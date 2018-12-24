#!/bin/sh

rm extension_*.zip

./node_modules/.bin/webpack

cd dist/extension_chrome; zip -r ../../extension_chrome.zip *; cd ../../

cd dist/extension_firefox; zip -r ../../extension_firefox.zip *; cd ../../
