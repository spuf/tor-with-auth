# tor-with-auth

[Tor](https://www.torproject.org) SOCKS5 proxy with authentication using [3proxy](https://3proxy.ru/?l=EN).

## Description

When you: `curl -x 'socks5h://user:pass@host:1080' 'example.com'`

1.  authentication (link to 3proxy/run)
2.  resolve domains except .onion (link to dnsmasq/run)
3.  route to tor network

## How to use

`docker run --rm -p 1080:1080 -v tor-data:/var/lib/tor -d tor-with-auth`

Sample docker-compose.yml:

```yml
version: '2'
services:
  tor-with-auth:
    image: spuf/tor-with-auth
    restart: unless-stopped
    ports:
      - "1080:1080"
    environment:
      TOR_ExcludeExitNodes: "{ua},{ru},{by},{kz},{tm},{cn},{ir}"
      PROXY_USER: "login"
      PROXY_PASSWORD: "secret"
    volumes:
      - "tor-data:/var/lib/tor"
    networks:
      - proxy

volumes:
  tor-data:

networks:
  proxy:
```
