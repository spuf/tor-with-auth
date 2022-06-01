FROM alpine:edge
ENV LAST_UPGRADE 2022-06-01

RUN apk --no-cache upgrade && \
    echo 'http://dl-cdn.alpinelinux.org/alpine/edge/testing' >> /etc/apk/repositories  && \
    apk --no-cache add s6 curl tor 3proxy dnsmasq

ENV TOR_ClientOnly="1" \
    TOR_HardwareAccel="1" \
    PROXY_USER="user" \
    PROXY_PASSWORD="pass"

COPY src/etc/s6 /etc/s6

EXPOSE 1080

HEALTHCHECK --interval=60s --timeout=30s --start-period=30s \
    CMD curl -fsSL -m 30 -x 'socks5h://127.0.0.1:9050' 'http://www.gstatic.com/generate_204' || exit 1

VOLUME [ "/var/lib/tor" ]

CMD [ "s6-svscan", "/etc/s6" ]
