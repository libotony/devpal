// eslint-disable-next-line @typescript-eslint/no-var-requires
const StaticServer = require('static-server')

export const createStatic = (dir: string, port: number) => {
    const server = new StaticServer({
        rootPath: dir,
        port: port,      
        followSymlink: true,
        templates: {
            index: 'index.html',
            notFound: '404.html'
        }
    })
    
    server.start()
}

