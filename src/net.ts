import * as https from 'https'
import * as http from 'http'
import * as querystring from 'querystring'

interface Params {
    query?: Record<string, string>
    body?: any
    headers?: Record<string, string>
}

const httpAgent = new http.Agent({
    keepAlive: true,
    maxSockets: 1000,
    maxFreeSockets: 50
})

const httpsAgent = new https.Agent({
    keepAlive: true,
    maxSockets: 1000,
    maxFreeSockets: 50
})

export const request = async<T>(method: 'GET' | 'POST',url: string,params?: Params):Promise<T> => {
    if (!params) {
        params = {}
    }

    const full =  url + (params.query ? ('?' + querystring.stringify(params.query)) : '')
    return new Promise((resolve, reject) => {
        let request = http.request
        let agent = httpAgent
        if (url.startsWith('https://')) {
            request = https.request
            agent = httpsAgent
        }

        const req = request(full, {
            method,
            headers: params!.headers || {},
            agent: agent,
            timeout: 5 * 1000
        }, (res) => {
            res.setEncoding('utf-8')

            let resStr = ''
            res.on('data', (data) => {
                resStr += data
            })


            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`${method} ${url} ${res.statusCode} - ${resStr}`))
                    return
                }

                try {
                    const ret = JSON.parse(resStr)
                    resolve(ret)
                } catch (e) {
                    reject(e)
                }

            })

        })

        req.on('error', e => {
            reject(e)
        })

        if (method === 'POST' && params!.body) {
            req.write(JSON.stringify(params!.body))
        }

        req.end()
    })
}
