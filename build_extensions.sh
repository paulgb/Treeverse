#!/bin/sh

./node_modules/.bin/webpack

cp -r extension_common/* extension_chrome/
cp -r extension_common/* extension_firefox/

cd extension_chrome
zip ../extension_chrome.zip *
cd ..

cd extension_firefox
zip ../extension_firefox.zip *
cd ..
