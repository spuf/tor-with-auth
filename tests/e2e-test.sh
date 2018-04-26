#!/usr/bin/env bash

step() {
    echo
    echo '==>' $1
}

install_goss() {
    GOSS_VER=$1
    DGOSS_VER=$GOSS_VER

    GOSS_DST=$2
    INSTALL_LOC="${GOSS_DST%/}/goss"
    DGOSS_INSTALL_LOC="${GOSS_DST%/}/dgoss"

    arch=""
    if [ "$(uname -m)" = "x86_64" ]; then
        arch="amd64"
    else
        arch="386"
    fi
    url="https://github.com/aelsabbahy/goss/releases/download/$GOSS_VER/goss-linux-$arch"

    echo "Downloading $url"
    curl -sL "$url" -o "$INSTALL_LOC"
    chmod +x "$INSTALL_LOC"
    echo "Goss $GOSS_VER has been installed to $INSTALL_LOC"

    dgoss_url="https://raw.githubusercontent.com/aelsabbahy/goss/$DGOSS_VER/extras/dgoss/dgoss"
    echo "Downloading $dgoss_url"
    curl -sL "$dgoss_url" -o "$DGOSS_INSTALL_LOC"
    chmod +x "$DGOSS_INSTALL_LOC"
    echo "dgoss $DGOSS_VER has been installed to $DGOSS_INSTALL_LOC"
}

CONTAINER_NAME=tor-with-auth
TESTS_PATH=$(dirname $BASH_SOURCE)

step 'Build image'
docker build --no-cache -t $CONTAINER_NAME .

step 'Run goss tests'
install_goss v0.3.5 $TESTS_PATH
env GOSS_PATH="$TESTS_PATH/goss" \
    GOSS_FILES_PATH=$TESTS_PATH \
    $TESTS_PATH/dgoss run $CONTAINER_NAME

step 'Run container'
docker stop $CONTAINER_NAME &> /dev/null || true
docker run --rm -p 127.0.0.1:1088:1088 -d --name $CONTAINER_NAME $CONTAINER_NAME

step 'Wait for Tor to open a circuit'
sleep 1
TOR_SUCCESS='Tor has successfully opened a circuit. Looks like client functionality is working.'
WAIT_LIMIT=120
while ! docker logs $CONTAINER_NAME | fgrep -q -m 1 "$TOR_SUCCESS"; do
    echo -n .
    WAIT_LIMIT=$(($WAIT_LIMIT-1))
    [ $WAIT_LIMIT -le 0 ] && exit 1
    sleep 1
done
echo

step 'Run curl tests'
echo -n 'Not using Tor without proxy: '
curl -fsSL https://check.torproject.org/?lang=en_US \
    | fgrep -q -m 1 'Sorry. You are not using Tor.' \
    && echo 'OK'

echo -n 'Using Tor with proxy: '
curl -fsSL -x socks5://user:pass@127.0.0.1:1088 https://check.torproject.org/?lang=en_US \
    | fgrep -q -m 1 'Congratulations. This browser is configured to use Tor.' \
    && echo 'OK'

echo -n 'Error with invalid user: '
curl -fsL -x socks5://root@127.0.0.1:1088 https://check.torproject.org/?lang=en_US \
    && exit 1 \
    || echo 'OK'

echo -n 'Error withouth auth: '
curl -fsL -x socks5://127.0.0.1:1088 https://check.torproject.org/?lang=en_US \
    && exit 1 \
    || echo 'OK'

step 'Container logs'
docker logs $CONTAINER_NAME

step 'Stop container'
docker stop $CONTAINER_NAME
