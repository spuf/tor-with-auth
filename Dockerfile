FROM alpine:edge

RUN apk --no-cache upgrade && \
    apk --no-cache add s6 && \
    echo http://dl-cdn.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories  && \
    apk --no-cache add tor 3proxy

ENV TOR_SOCKSPort="127.0.0.1:9050" \
    TOR_DataDirectory="/var/lib/tor" \
    TOR_RelayBandwidthRate="1250 KBytes" \
    TOR_RelayBandwidthBurst="2500 KBytes" \
    TOR_ExitRelay="0" \
    TOR_ExitPolicy="reject *:*" \
    TOR_PublishServerDescriptor="0" \
    TOR_ExcludeExitNodes="{ua},{ru},{by},{kz},{tm},{cn}" \
    TOR_User="tor" \
    TOR_HardwareAccel="1" \
    PROXY_USER="user" \
    PROXY_PASSWORD="pass"

ADD src/etc/s6 /etc/s6

VOLUME [ "/var/lib/tor" ]

EXPOSE 1088

CMD [ "/bin/s6-svscan", "/etc/s6" ]
