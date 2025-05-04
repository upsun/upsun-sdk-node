#!/usr/bin/bash

echo "Clean old build..."
rm -rf ./src/apis-gen
rm -rf ./out

echo "Download last openAPI spec..."
wget -O ./schema/openapispec-platformsh.json https://api.upsun.com/docs/openapispec-platformsh.json

echo "Generate apis_gen code..."
openapi-generator-cli generate \
  -i ./schema/openapispec-platformsh.json \
  -g typescript-fetch \
  -o ./src/apis-gen \
  --additional-properties=withInterfaces=true,importFileExtension=.js,supportsES6=true
