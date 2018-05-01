#!/bin/sh
set -e

export GOSS_FILES_PATH="$npm_package_config_goss_files"
export GOSS_OPTS="$npm_package_config_goss_options"

exec dgoss "${1:-run}" -v "$npm_package_config_volume" "$npm_package_config_image"
