#!/bin/bash

rm -rf docs/
mkdir docs/
cp index.html check.js favicon-pudding.ico docs/
cp -a dist static data docs/