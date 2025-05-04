import { UpsunClient, UpsunConfig } from "./index.js";
import dotenv from "dotenv";

dotenv.config();

const DISABLED: boolean = true;

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

// Main class of Upsun-dsk-node.
const upsun = new UpsunClient({ apiKey: process.env.UPSUN_CLI_TOKEN || "UPSUN_CLI_TOKEN is not define !" } as UpsunConfig);

// (If needed) Check authentication
if (DISABLED || await upsun.authenticate()) {
  console.log("Authentication successful");
}

// Sample code to get all projects
const orgId = "name=Perso-home"; // Replace with your organization ID
const prjs = await upsun.projects.getProject(orgId);

// Select a specific project
const prjName = "POC-mcp-stack"; // Replace with your project name
const prj = prjs.items?.find((p) => p.projectTitle === prjName) ?? null;
console.log(prj);

// Wait 15 minutes before redeploying (test renew access token)
await delay(6000*15);

// Redeploy the project
// Note: The environment name is hardcoded as "main" in this example.
if (prj) {
  const envName = "main"; // Replace with your environment name
  const result = await upsun.environments.redeploy(prj, envName);

  console.log(result);
}
