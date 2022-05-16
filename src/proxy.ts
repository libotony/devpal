import * as httpProxy from 'http-proxy'
import * as http from 'http'

const setCORSHeaders = (req: http.IncomingMessage, res: http.ServerResponse) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin as string)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD')
    res.setHeader('Access-Control-Allow-Headers', 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,x-genesis-id')
    res.setHeader('Access-Control-Expose-Headers', 'x-genesis-id,x-thorest-ver')
    res.setHeader('Access-Control-Max-Age', 86400)
}

export const createProxy = (target: string, port: number) => {
    const proxy = httpProxy.createProxyServer({
        target: target,
        changeOrigin: true
    });
    
    const server = http.createServer(function (req, res) {
        // response to preflight request
        if (req.method === 'OPTIONS') {
            setCORSHeaders(req, res)
            res.writeHead(204)
            res.end()
        } else {
            proxy.web(req, res);
        }
    });
    
    server.on('upgrade', function (req, socket, head) {
        // ignore error on socket, upgrade failed will cause connection reset
        socket.on('error', () => { return null })
        proxy.ws(req, socket, head, { headers: { origin: '' } });
    });
    
    proxy.on('proxyRes', (proxyRes, req, res) => {
        // attach CORS headers on each response
        setCORSHeaders(req, res)
    })
    
    proxy.on('error', function (err, req, res) {
        if (res instanceof http.ServerResponse) {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            })
        }
    
        res.end('Something went wrong. And we are reporting a custom error message.');
    });
    
    server.listen(port);
}
