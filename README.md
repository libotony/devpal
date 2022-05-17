# DEVPAL

The best friend of developers, helps setting up the local develop environment.

## Motivation

Some times you might need to set up a solo/custom vechain [thor](https://github.com/vechain/thor.git) network, but the well known tools [Insight](https://insight.vecha.in) and [Inspector](https://inspector.vecha.in) are not available for local network. You might need `devpal` to help you.

## How to

[![asciicast](https://asciinema.org/a/495180.png)](https://asciinema.org/a/495180)

``` shell
npx @vechain/devpal [Thor REST URL]
```

If `Thor REST URL` was left unset, `http://locahost:8669` will be the default value.