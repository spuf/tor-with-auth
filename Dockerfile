FROM alpine:edge

RUN apk --no-cache upgrade && \
    apk --no-cache add s6 curl && \
    echo 'http://dl-cdn.alpinelinux.org/alpine/edge/testing' >> /etc/apk/repositories  && \
    apk --no-cache add tor 3proxy

ENV TOR_RelayBandwidthRate="1250 KBytes" \
    TOR_RelayBandwidthBurst="2500 KBytes" \
    TOR_ExitRelay="0" \
    TOR_ExitPolicy="reject *:*" \
    TOR_PublishServerDescriptor="0" \
    TOR_ExcludeExitNodes="{ua},{ru},{by},{kz},{tm},{cn}" \
    TOR_HardwareAccel="1" \
    PROXY_USER="user" \
    PROXY_PASSWORD="pass"

ADD src/etc/s6 /etc/s6

EXPOSE 1080

HEALTHCHECK --interval=60s --timeout=30s --start-period=60s \
    CMD /bin/sh -c "curl -fsSL -x 'socks5h://127.0.0.1:9050' 'https://ifconfig.co/json' || exit 1"

VOLUME [ "/var/lib/tor" ]

CMD [ "/bin/s6-svscan", "/etc/s6" ]
