#!/bin/sh
set -e

GOSS_VER=$npm_package_config_goss_version
GOSS_DST=node_modules/.bin

if [ ! -d $GOSS_DST ]; then
  exit 1
fi

INSTALL_LOC="${GOSS_DST%/}/goss"
DGOSS_INSTALL_LOC="${GOSS_DST%/}/dgoss"

url="https://github.com/aelsabbahy/goss/releases/download/$GOSS_VER/goss-linux-amd64"
echo "Downloading $url"
curl -fsSL "$url" -o "$INSTALL_LOC"
chmod +rx "$INSTALL_LOC"
echo "Goss $GOSS_VER has been installed to $INSTALL_LOC"

dgoss_url="https://raw.githubusercontent.com/aelsabbahy/goss/master/extras/dgoss/dgoss"
echo "Downloading $dgoss_url"
curl -fsSL "$dgoss_url" -o "$DGOSS_INSTALL_LOC"
chmod +rx "$DGOSS_INSTALL_LOC"
echo "dgoss has been installed to $DGOSS_INSTALL_LOC"
