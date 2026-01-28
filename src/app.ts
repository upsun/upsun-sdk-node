/* eslint-disable no-console */
import { exit } from 'process';
import { SubscriptionStatusEnum } from './model/index.js';
import { UpsunClient, UpsunConfig } from './upsun.js';
import dotenv from 'dotenv';
import { ResponseError } from './index.js';

dotenv.config();

const DISABLED: boolean = false;
const FULL_TEST: boolean = true;
const MODE_USE: string = 'API'; // 'API' or 'BEARER'

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main class of Upsun-dsk-node.
let upsun: UpsunClient;
if (MODE_USE === 'API') {
  upsun = new UpsunClient({
    apiKey: process.env.UPSUN_CLI_TOKEN || 'UPSUN_CLI_TOKEN is not define !',
  } as UpsunConfig);

  // (If needed) Check authentication
  if (DISABLED || (await upsun.authenticate())) {
    console.log('Authentication successful');
  }
} else if (MODE_USE === 'BEARER') {
  upsun = new UpsunClient();
  upsun.setBearerToken('Your_Bearer_Token_Here'); // Replace with your bearer token
} else {
  throw new Error('Invalid MODE_USE value. Use API or BEARER.');
}

console.log('--- it\'s me ---');
// const me = await upsun.user.me();
// console.log(me);

console.log('--- List Organizations ---');
//const accessToken = await upsun.getToken();
//console.log('Access Token:', accessToken);
// console.log(orgs);

// console.log(org);

//const tt = await upsun.metrics.fetchMetrics("a6gx2dq4x235u", "master", "eu-3");
// const tt = await upsun.metrics.fetchMetrics('3byyvv7dtvdye', 'master', 'ch-1');
// console.log(tt);

console.log('--- Delete Project ---');
/* upsun.project.delete('y4q5rwg4uzv5g').then(() => {
  console.log('Project deleted successfully');
}).catch((error) => {
  console.error('Error deleting project:', error);
}); */

if (FULL_TEST) {
  try {
    const orgs = await upsun.organization.list();
    const orgName = 'demo-test-org'; // Replace with your organization name (ex: 'perso-home')
    const org = orgs.items?.find(p => p.name === orgName) ?? null;
    if (org && org?.id) {
      // Create Project
      console.log('--- Create Project ---');
      const subCreated = await upsun.project.create(
        org?.id, 
        'eu-3.platform.sh', 
        'Demo', 
        'upsun/flexible',
        'main'
      );

      console.log('Project created:', subCreated);
      let prjCreated = await upsun.project.getSubscription(org?.id, subCreated.id || '');
      while (prjCreated.status !== SubscriptionStatusEnum.ACTIVE) {
        console.log('Waiting for project to be active...');
        await delay(10000);
        prjCreated = await upsun.project.getSubscription(org.id, subCreated.id || '');
      }

      // Sample code to get all projects
      // const orgId = "name=Perso-home"; // Replace with your organization ID
      const prjs = await upsun.project.list(org.id);

      // Select a specific project
      const prjName = 'POC-mcp-stack'; // Replace with your project name
      const prj = prjs.items?.find(p => p.projectTitle === prjName) ?? null;
      console.log(prj);

      // Wait 15 minutes before redeploying (test renew access token)
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      DISABLED || (await delay(6000 * 15));

      // Work with project
      if (prj && prj.projectId) {
        const envName = 'main'; // Replace with your environment name

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
    if (error instanceof ResponseError) {
      const responseText = await error.response.text();
      console.error(`Create Project failed: HTTP ${error.response.status}`, responseText);
      if (error.response.status === 403) {
        throw new Error('You do not have permission to create a project for this organization (403 Forbidden)');
      }
    } else {
      console.error('An unexpected error occurred:', error);
      throw error;
    }
  }
}
