#!/usr/bin/env bash

set -e

CONTAINER_NAME=tor-with-auth
TESTS_PATH=$(dirname $BASH_SOURCE)

step() {
    echo
    echo -e "\033[1m==> $1\033[0m"
}

test_ok() {
    echo -e "\033[32mOK\033[0m"
}

show_info() {
    echo 'Logs:'
    echo -ne "\033[2m"
    docker logs $CONTAINER_NAME
    echo -ne "\033[0m"
    echo 'Inspect:'
    echo -ne "\033[2m"
    docker inspect $CONTAINER_NAME
    echo -ne "\033[0m"
}

test_fail() {
    echo -e "\033[31mFAIL\033[0m"
    show_info
    docker stop $CONTAINER_NAME &> /dev/null || true
    exit 1
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

step 'Build image'
docker build --no-cache -t $CONTAINER_NAME .

step 'Run goss tests'
install_goss v0.3.5 $TESTS_PATH
env GOSS_PATH="$TESTS_PATH/goss" \
    GOSS_FILES_PATH=$TESTS_PATH \
    $TESTS_PATH/dgoss run $CONTAINER_NAME

step 'Run container'
docker stop $CONTAINER_NAME &> /dev/null || true
docker run -d --rm -p 127.0.0.1:1080:1080 --name $CONTAINER_NAME $CONTAINER_NAME

step 'Run curl tests'
echo -n 'Wait Tor to open a circuit'
sleep 1
TOR_SUCCESS='Tor has successfully opened a circuit. Looks like client functionality is working.'
WAIT_LIMIT=120
while ! docker logs $CONTAINER_NAME | fgrep -o "$TOR_SUCCESS" > /dev/null; do
    echo -n '.'
    WAIT_LIMIT=$(($WAIT_LIMIT-1))
    [ $WAIT_LIMIT -le 0 ] && test_fail
    sleep 1
done
echo

TEST_URI='https://check.torproject.org/?lang=en_US'
echo -n 'Not using Tor without proxy: '
curl -fsSL "$TEST_URI" \
    | fgrep -o 'Sorry. You are not using Tor.' > /dev/null \
    && test_ok || test_fail

echo -n 'Using Tor with proxy: '
curl -fsSL -x 'socks5h://user:pass@127.0.0.1:1080' "$TEST_URI" \
    | fgrep -o 'Congratulations. This browser is configured to use Tor.' > /dev/null \
    && test_ok || test_fail

echo -n 'Working onion router: '
curl -fsSL -x 'socks5h://user:pass@127.0.0.1:1080' "http://facebookcorewwwi.onion/" \
    | fgrep -o 'Facebook' > /dev/null \
    && test_ok || test_fail

echo -n 'Error with invalid user: '
curl -fsL -x 'socks5h://root@127.0.0.1:1080' "$TEST_URI" && test_fail || test_ok

echo -n 'Error withouth auth: '
curl -fsL -x 'socks5h://127.0.0.1:1080' "$TEST_URI" && test_fail || test_ok

step 'Validate healthcheck'
echo -n 'Wait healthcheck start period'
WAIT_LIMIT=60
while docker inspect $CONTAINER_NAME | fgrep -o '"Status": "starting"' > /dev/null; do
    echo -n '.'
    WAIT_LIMIT=$(($WAIT_LIMIT-1))
    [ $WAIT_LIMIT -le 0 ] && test_fail
    sleep 1
done
echo

echo -n 'Status is healthy: '
docker inspect $CONTAINER_NAME \
    | fgrep -o '"Status": "healthy"' > /dev/null \
    && test_ok || test_fail

step 'Show container info'
show_info

step 'Stop container'
docker stop $CONTAINER_NAME
