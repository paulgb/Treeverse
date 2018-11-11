#!/bin/sh

webpack

rsync web/ public/ -a --copy-links -v
