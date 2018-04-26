FROM alpine:edge

RUN apk --no-cache upgrade && \
    apk --no-cache add s6 tor && \
    echo http://dl-cdn.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories  && \
    apk --no-cache add 3proxy && \
    rm -rf /tmp/*

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
    3PROXY_0_log="" \
    3PROXY_1_fakeresolve="" \
    3PROXY_2_timeouts="30 30 60 60 180 1800 60 120" \
    3PROXY_3_users="user:CL:pass" \
    3PROXY_4_auth="strong" \
    3PROXY_5_allow="user" \
    3PROXY_6_parent="1000 socks5 127.0.0.1 9050" \
    3PROXY_7_socks="-p1088"

ADD s6 /etc/s6

VOLUME [ "/var/lib/tor" ]

EXPOSE 1088

CMD [ "/bin/s6-svscan", "/etc/s6" ]
