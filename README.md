# Upsun SDK Node

Upsun SDK for Node/JS on TypeScript.
This SDK maps the Upsun CLI commands. For more information, read [the documentation](https://docs.upsun.com).

## Install

```bash
npm install upsun-sdk
```

## Usage

```TypeScript

import { UpsunClient, UpsunConfig } from "./index.js";

const upsun = new UpsunClient({ apiKey: process.env.UPSUN_CLI_TOKEN || "" } as UpsunConfig);

const orgs = await upsun.organization.list();
const prjs = await upsun.project.list("name=MyOrganizationName");
const result = await upsun.environment.redeploy("MyProjectId", "main");
```

## Devel

Clone repository:
```bash
git clone git@github.com:upsun/upsun-sdk-node.git
```

Install Dep:
```bash
npm install
```

Generate API Client (Low-level) base on OpenAPI spec.
```bash
npm run gen-client
```

Build the stack:
```bash
npm run build
```




