#!/usr/bin/env bash

echo "Clean old build..."
rm -rf ./src/apis-gen
rm -rf ./dist
rm -rf ./schema/*

echo "Download last openAPI spec..."
wget -O ./schema/openapispec-upsun.json https://api.upsun.com/docs/openapispec-platformsh.json
# wget -O ./schema/openapispec-upsun.yaml https://api.upsun.com/docs/openapispec-platformsh.yaml
# wget -O ./schema/openapispec-platformsh.json https://api.platform.sh/docs/openapispec-platformsh.json
# wget -O ./schema/openapispec-platformsh.yaml https://api.platform.sh/docs/openapispec-platformsh.yaml

echo "Hotfix openAPI spec..."
sed -i 's/HTTP access permissions/Http access permissions/g' ./schema/openapispec-upsun.json

echo "Generate apis_gen code..."
npm install @openapitools/openapi-generator-cli -g

openapi-generator-cli generate \
  -i ./schema/openapispec-upsun.json \
  -g typescript-fetch \
  -o ./src/apis-gen \
  --additional-properties=withInterfaces=true,importFileExtension=.js,supportsES6=true

echo "Hotfix openAPI spec..."
sed -i 's#export \* from '\''./models/index.js'\'';#//export * from '\''./models/index.js'\'';#' src/apis-gen/index.ts
