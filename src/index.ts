import * as path from 'path'
import * as fs from 'fs/promises'
import * as chalk from 'chalk';
import * as portFinder from 'portfinder'
import * as defaultGateway from 'default-gateway'
import * as address from 'address'
import { createProxy } from './proxy';
import { createStatic } from './static';
import { request } from './net';

const getEnvContent = (nodePort: number, insightPort: number, genesis: object) => {
    return `const origin = window.location.origin;const port = window.location.port
window.nodeUrl = origin.replace(port, '${nodePort}')
window.genesis = ${JSON.stringify(genesis)}
window.insight = origin.replace(port, '${insightPort}')
`
}

const error = (input: string) => {
    console.log(chalk.bgRed(' ERROR ') + ' ' + chalk.red(input))
}

const info = (input: string) => {
    console.log(chalk.bgBlue(' INFO ') + ' ' + input)
}

const fatal = (input: string) => {
    error(input)
    process.exit(-1)
}

const writeEnvFile = async (content: string) => {
    const files = [
        path.join(__dirname, "../sites/insight/env.js"),
        path.join(__dirname, "../sites/inspector/env.js")
    ]

    for (const f of files) {
        const fh = await fs.open(f, 'w')
        await fh.writeFile(content)
        await fh.close()
    }
}

const checkLogsAPI = async (nodeUrl: string) => {
    try {
        await request<void>('POST', nodeUrl + '/logs/event', { body: { options: { offset: 0, limit: 1 } } })
    } catch (e: any) {
        if (e.toString().includes('404')) {
            fatal("Log required to be enable at thor!")
        } else {
            throw e
        }
    }
}

const findPorts = (): Promise<number[]> => {
    return new Promise((resolve, reject) => {
        portFinder.getPorts(3, { startPort: 3000 }, (err, ports) => {
            if (err) {
                reject(err)
            } else {
                resolve(ports)
            }
        })
    })
}

const getLocalIP = async () => {
    const ret = await defaultGateway.v4();
    return address.ip(ret.interface)
}

const idToNet = (id: string) => {
    switch (id) {
        case '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a': return 'MainNet'
        case '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127': return 'TestNet'
        case '0x00000000c05a20fbca2bf6ae3affba6af4a74b800b585bf7a4988aba7aea69f6': return 'Solo'
        default: return 'Custom:0x'+id.slice(-2)
    }
}

void (async () => {
    if (!process.argv[2]) {
        fatal('THOR REST URL required!')
    }
    const nodeUrl = process.argv[2]

    const genesis = await request<object>('GET', nodeUrl + '/blocks/0')
    await checkLogsAPI(nodeUrl)

    info('Connected to '+idToNet((genesis as any).id))
    const [nodePort, insightPort, inspectorPort] = await findPorts()
    await (writeEnvFile(getEnvContent(nodePort, insightPort, genesis)))

    createProxy(nodeUrl, nodePort)
    createStatic(path.join(__dirname, "../sites/insight"), insightPort)
    createStatic(path.join(__dirname, "../sites/inspector"), inspectorPort)

    const lan = await getLocalIP()
    console.log(`
    ${chalk.cyan('Insight')} running at:
    - Local:   ${chalk.blue('http://localhost:'+insightPort)}
    - Network: ${chalk.blue('http://'+lan+':'+insightPort)}

    ${chalk.cyan('Inspector')} running at:
    - Local:   ${chalk.blue('http://localhost:'+inspectorPort)}
    - Network: ${chalk.blue('http://'+lan+':'+inspectorPort)}
    `)
})().catch(e => {
    console.log(e)
    process.exit(-1)
})
