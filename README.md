# Upsun SDK Node

Upsun SDK for Node/JS on TypeScript.  
This SDK maps the Upsun CLI commands. For more information, read [the documentation](https://docs.upsun.com).

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

## Install

To install the Upsun SDK, you can use npm. Run the following command in your terminal:

```bash
npm install upsun-sdk-node
```

## Usage

To use the Upsun SDK, you need to initialize the `Upsun` class with your API key and connection URL. Here's an example:

```TypeScript
import { UpsunClient, UpsunConfig } from "upsun-sdk-node";

const upsun = new UpsunClient({ apiKey: process.env.UPSUN_CLI_TOKEN || "" } as UpsunConfig);

const orgs = await upsun.organizations.list();
const prjs = await upsun.projects.list();
const result = await upsun.environments.redeploy("MyProjectId", "main");
```

## Devel

Clone repository:

```bash
git clone git@github.com:upsun/upsun-sdk-node.git
```

Install Dep:

```bash
npm install
npm run spec:generate:install
```

Generate API Client (Low-level) base on OpenAPI spec.

```bash
npm run spec:generate
```

Build the stack:

```bash
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the Apache V2 License. See the [LICENSE](./LICENSE) and [NOTICE](./NOTICE) files for more details.
