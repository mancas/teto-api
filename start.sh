#!/bin/bash

echo "Jose REST server"
echo " -> $1 mode"
export NODE_ENV=$1
cd /opt/api && npm start
