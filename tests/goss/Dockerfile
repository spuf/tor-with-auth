FROM alpine:edge

RUN apk --no-cache upgrade && \
    apk --no-cache add curl bash docker && \
    sh -c 'curl -fsSL https://goss.rocks/install | sh'

ENV GOSS_FILES_STRATEGY=cp

CMD [ "dgoss", "run", "tor-with-auth" ]
