#!/usr/bin/bash

echo "Clean old build..."
rm -rf ./src/apis-gen
rm -rf ./out
rm -rf ./schema/*

echo "Download last openAPI spec..."
wget -O ./schema/openapispec-platformsh.json https://api.upsun.com/docs/openapispec-platformsh.json

echo "Hotfix openAPI spec..."
sed -i 's/HTTP access permissions/Http access permissions/g' ./schema/openapispec-platformsh.json

echo "Generate apis_gen code..."
npm install @openapitools/openapi-generator-cli -g

openapi-generator-cli generate \
  -i ./schema/openapispec-platformsh.json \
  -g typescript-fetch \
  -o ./src/apis-gen \
  --additional-properties=withInterfaces=true,importFileExtension=.js,supportsES6=true

echo "Hotfix openAPI spec..."
sed -i 's#export \* from '\''./models/index.js'\'';#//export * from '\''./models/index.js'\'';#' src/apis-gen/index.ts
