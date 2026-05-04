# Upsun SDK Node

The official **Upsun SDK for Node.js** on TypeScript.
This SDK provides a Node.js interface that maps to the Upsun CLI commands.

For more information, read [the documentation](https://docs.upsun.com/api).

> **CAUTION**:
> This project is currently in **Beta**, meaning features and APIs may evolve over time.
>
> Please report bugs or request new features by creating a GitHub issue.

## Installation

Install the SDK via npm:

```bash
npm install upsun-sdk-node
```

## Authentication

You will need an [Upsun API token](https://docs.upsun.com/administration/cli/api-tokens.html) to use this SDK.  
Store it securely, preferably in an environment variable.

```ts
import { UpsunClient, UpsunConfig } from 'upsun-sdk-node';

const config: UpsunConfig = {
  apiKey: process.env.UPSUN_CLI_TOKEN || '',
};

const upsunClient = new UpsunClient(config);
```

## Usage

### Example: List organizations

```ts
const organizations = await upsunClient.organizations.list();
```

### Example: List projects

```ts
const projects = await upsunClient.projects.list('<organizationId>');
```

### Example: Redeploy an environment

```ts
const result = await upsunClient.environments.redeploy('<projectId>', '<environmentId>');
```

---

## Development

Clone the repository and install dependencies:

```bash
git clone git@github.com:upsun/upsun-sdk-node.git
npm install
```

## Architecture of this SDK

The SDK is built as follows:

- From the [JSON specs of our API](https://docs.upsun.com/api/openapispec-upsun.json)
- Using [`@openapitools/openapi-generator-cli`](https://www.npmjs.com/package/%40openapitools/openapi-generator-cli)
- Which generates a low-level API client
- On top of that, the SDK exposes higher-level task-oriented methods

### Regenerating API client code

API classes are generated from the [Upsun OpenAPI spec](https://docs.upsun.com/api/openapispec-upsun.json).

```bash
npm run spec:generate:install
npm run spec:full
```

## Publishing
To generate a new version of the Upsun SDK Node and automatically publish it on https://npmjs.org

1. update your local
```bash
git fetch
git checkout main
git pull
```
2. check existing tags on https://github.com/upsun/upsun-sdk-node/tags
3. Update `package.json` version to the new release version (highest version + 1)
4. update `package-lock.json` using: 
```bash
npm install
git add package.json package-lock.json
git commit -m "bump release version to v<x.y.z>"
git push
```
5. create a new tag from your local
```bash
git tag v<x.y.z>
git push --tag
```
6. Go on release page: https://github.com/upsun/upsun-sdk-node/releases
7. create a new release based on the previously created tag (Do not forget to autogenerate description in the form)
8. check publishing action status: https://github.com/upsun/upsun-sdk-node/actions 
9. check new release version on https://www.npmjs.com/package/upsun-sdk-node 

## Contributing

Contributions are welcome!  
Please open a [pull request](https://github.com/upsun/upsun-sdk-node/compare) or an [issue](https://github.com/upsun/upsun-sdk-node/issues/new)
for any improvements, bug fixes, or new features.

## Tests

To run the tests, use:

```bash
npm run test
```

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](https://github.com/upsun/upsun-sdk-node/blob/main/LICENSE) and [NOTICE](https://github.com/upsun/upsun-sdk-node/blob/main/NOTICE) files for details.
