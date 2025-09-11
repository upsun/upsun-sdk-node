#!/bin/bash
# Script to release upsun-sdk-node
TAG=$1
VERSION=${TAG#v}
jq ".version = \"$VERSION\"" package.json > package.json.tmp && mv package.json.tmp package.json
git add package.json
git commit -m "chore: bump version to $VERSION"
git tag "$TAG"
echo "Version updated and tag created: $VERSION"
