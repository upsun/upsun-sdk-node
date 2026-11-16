#!/usr/bin/bash

npm run spec:full

echo "Build project..."
npm run clean
npm run build
