import Connex from '@vechain/connex/esm'

export function createConnex(net?: 'main' | 'test') {
    return new Connex({ node: (window as any).nodeUrl, network:  (window as any).genesis })
}
