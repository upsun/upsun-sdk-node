import { SubscriptionStatusEnum } from "./apis-gen/models/index.js";
import { UpsunClient, UpsunConfig } from "./index.js";
import dotenv from "dotenv";

dotenv.config();

const DISABLED: boolean = true;
const FULL_TEST: boolean = false;
const MODE_USE: string = 'API'; // 'API' or 'BEARER'

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

// Main class of Upsun-dsk-node.
let upsun: UpsunClient;
if (MODE_USE === 'API') {

  upsun = new UpsunClient({ apiKey: process.env.UPSUN_CLI_TOKEN || "UPSUN_CLI_TOKEN is not define !" } as UpsunConfig);

  // (If needed) Check authentication
  if (DISABLED || await upsun.authenticate()) {
    console.log("Authentication successful");
  }

} else if (MODE_USE === 'BEARER') {

  upsun = new UpsunClient();
  upsun.setBearerToken("token");

} else {
  throw new Error("Invalid MODE_USE value. Use 'API' or 'BEARER'.");
}

const orgs = await upsun.organization.list();
console.log(orgs);

const orgName = "Perso-home"; // Replace with your organization ID
const org = orgs.items?.find((p) => p.label === orgName) ?? null;
console.log(org);

if (FULL_TEST) {
  try {
    if (org && org.id) {
      // Create Project
      const subCreated = await upsun.project.create(org.id, "eu-3.platform.sh", "Demo", "main");
      
      let prjCreated = await upsun.project.getSubscription(org.id, subCreated.id || "");
      while (prjCreated.status !== SubscriptionStatusEnum.Active) {
        console.log("Waiting for project to be active...");
        await delay(10000);
        prjCreated = await upsun.project.getSubscription(org.id, subCreated.id || "");
      }

      // Sample code to get all projects
      // const orgId = "name=Perso-home"; // Replace with your organization ID
      const prjs = await upsun.project.list(org.id);

      // Select a specific project
      const prjName = "POC-mcp-stack"; // Replace with your project name
      const prj = prjs.items?.find((p) => p.projectTitle === prjName) ?? null;
      console.log(prj);

      // Wait 15 minutes before redeploying (test renew access token)
      DISABLED || await delay(6000*15);

      // Work with project
      if (prj && prj.projectId) {
        
        const envName = "main"; // Replace with your environment name
        
        const res = await upsun.resource.get(prj.projectId, envName);
        console.log(res);

        // Get console URL
        // const web = await upsun.route.web(prj.projectId);
        // console.log(web.ui);

        // Redeploy the project
        const result = await upsun.environment.redeploy(prj.projectId, envName);
        console.log(result);

        // List all activities
        const activities = await upsun.activity.list(prj.projectId);
        console.log(activities);

        // List routes of prj/env
        const routes = await upsun.route.list(prj.projectId, envName);
        console.log(routes);
      }
    }

  } catch (error) {
    console.error("An error occurred:", error);
  }
}
