#!/usr/bin/env bash

# Download chrome inside of our CI env.
url="https://download-chromium.appspot.com/dl/Linux_x64?type=snapshots"

if [ x"$LIGHTHOUSE_CHROMIUM_PATH" == x ]; then
  echo "Error: Environment variable LIGHTHOUSE_CHROMIUM_PATH not set"
  exit 1
fi

if [ -e "$LIGHTHOUSE_CHROMIUM_PATH" ]; then
  echo "cached chrome found"
else
  wget "$url" --no-check-certificate -q -O chrome.zip && unzip chrome.zip
fi
