# Upsun SDK Node

The official **Upsun SDK for Node.js** on TypeScript. 
This SDK provides a Node.js interface that maps to the Upsun CLI commands.

For more information, read [the documentation](https://docs.upsun.com/api).

> [!CAUTION]
> This project is currently in **Beta**, meaning features and APIs may evolve over time.
>
> Please report bugs or request new features by creating a GitHub issue.

<hr/>

[![Issues](https://img.shields.io/github/issues/upsun/upsun-sdk-node.svg?style=for-the-badge&labelColor=0C0F10&color=D5F800&label=Issues)](https://github.com/upsun/upsun-sdk-node/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/upsun/upsun-sdk-node.svg?style=for-the-badge&labelColor=0C0F10&color=D5F800&label=Pull%20requests)](https://github.com/upsun/upsun-sdk-node/pulls)
[![License](https://img.shields.io/static/v1?label=License&message=Apache-2.0&style=for-the-badge&labelColor=0C0F10&color=D5F800)](https://github.com/upsun/upsun-sdk-node/blob/master/LICENSE)

<hr/>

[![codecov](https://img.shields.io/codecov/c/github/upsun/upsun-sdk-node?style=for-the-badge&label=codecov&labelColor=0C0F10&color=D5F800)](https://codecov.io/gh/upsun/upsun-sdk-node)
[![npm version](https://img.shields.io/npm/v/upsun-sdk-node?include_prereleases&style=for-the-badge&label=npm&labelColor=0C0F10&color=D5F800)](https://www.npmjs.com/package/upsun-sdk-node)
[![npm downloads](https://img.shields.io/npm/dm/upsun-sdk-node?style=for-the-badge&label=downloads&labelColor=0C0F10&color=D5F800)](https://www.npmjs.com/package/upsun-sdk-node)

<hr/>

## Installation

Install the SDK via npm:

```bash
npm install upsun-sdk-node
```

## Authentication

You will need an [Upsun API token](https://docs.upsun.com/administration/cli/api-tokens.html) to use this SDK.  
Store it securely, preferably in an environment variable.

```ts
import { UpsunClient, UpsunConfig } from "upsun-sdk-node";

const config: UpsunConfig = {
  apiKey: process.env.UPSUN_CLI_TOKEN || "",
};

const client = new UpsunClient(config);
```

## Usage

### Example: List organizations

```ts
const organizations = await client.organizations.list();
```

### Example: List projects

```ts
const projects = await client.projects.list();
```

### Example: Redeploy an environment

```ts
const result = await client.environments.redeploy("<projectId>", "main");
```

---

## Development

Clone the repository and install dependencies:

```bash
git clone git@github.com:upsun/upsun-sdk-node.git
npm install
npm run spec:generate:install
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
npm run spec:generate
```

## Contributing

Contributions are welcome!  
Please open a [pull request](https://github.com/upsun/upsun-sdk-node/compare) or an [issue](https://github.com/upsun/upsun-sdk-node/issues/new)
for any improvements, bug fixes, or new features.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](./LICENSE) and [NOTICE](./NOTICE) files for details.
