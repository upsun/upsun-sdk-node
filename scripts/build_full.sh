#!/usr/bin/bash

./scripts/gen_node.sh

echo "Build project..."
npm run clean
npm run build
