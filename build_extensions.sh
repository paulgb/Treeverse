#!/bin/sh

./node_modules/.bin/webpack

cd extension_chrome; zip -r ../extension_chrome.zip *; cd ..

cd extension_firefox; zip -r ../extension_firefox.zip *; cd ..

