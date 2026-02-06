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
const projectTestId = 'iok5pcum4s4au'; // Replace with your project ID

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
//let prjCreatedObject = null;

if (FULL_TEST) {
  try {
    const orgs = await upsun.organizations.list();
    const orgName = 'florent-huck'; // Replace with your organization name (ex: 'perso-home')
    const org = orgs.items?.find(p => p.name === orgName) ?? null;
    if (org && org?.id) {
      // Create Project
      // console.log('--- Create Project ---');
      // const subCreated = await upsun.projects.create(
      //   org?.id, 
      //   'eu-5.platform.sh', 
      //   'Demo test from sdk-node '+new Date().toISOString(), 
      //   'upsun/flexible',
      //   'main'
      // );

      // const maxAttempts = 12;
      // let prjCreated = null;
      /* for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          prjCreated = await upsun.projects.getSubscription(org!.id, subCreated.id || '');
          console.log(`Statut de la souscription : ${prjCreated.status}`);
          if (prjCreated.status === SubscriptionStatusEnum.ACTIVE) {
            break;
          }
        } catch (error) {
          if (error instanceof ResponseError && [404, 202].includes(error.response.status)) {
            console.log(`Ressource non prête (code ${error.response.status}), attente…`);
          } else {
            throw error;
          }
        }
        await delay(10000);
      }

      if (!prjCreated || prjCreated.status !== SubscriptionStatusEnum.ACTIVE) {
        throw new Error('Subscription never transitioned to ACTIVE state within the allotted time');
      } else {
        console.log('Project created:', prjCreated);
      } */

      // Sample code to get a project
      // console.log('--- Get project ---');
      // prjCreatedObject = await upsun.projects.get(prjCreated.projectId || '');
      // console.log(prjCreatedObject);

      // Wait 15 minutes before redeploying (test renew access token)
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      //DISABLED || (await delay(6000 * 15));

      // Work with project
      const prj = await upsun.projects.get(projectTestId || '');

      if (prj && prj.id) {
        const envName = 'main'; // Replace with your environment name

        console.log('--- Get Resources ---');
        const res = await upsun.resources.get(prj.id, prj.defaultBranch || 'main', 'workers', 'app--app-worker');
        console.log(res);

        console.log('--- Set Resources ---');
        const response = await upsun.resources.set(
          prj.id || '',
          prj.defaultBranch || 'main',
          { 'app': { 
              resources: { profileSize: '1' },
              disk: 1024,
              instanceCount: 2,
            }
          },
          {
            'mysql': { 
              resources: { profileSize: '1' },
              disk: 2048,
            }
          },
          {
            'app--app-worker': { 
              resources: { profileSize: '1' },
              instanceCount: 2,
            }
          }
        );

        // Get console URL
        const route = await upsun.routes.list(prj.id, prj.defaultBranch || 'main');
        console.log(route);

        // Redeploy the project
        const result = await upsun.environments.redeploy(prj.id, envName);
        console.log(result);

        // List all activities
        const activities = await upsun.activities.list(prj.id);
        console.log(activities);

        const latestActivity = activities[0];
        if (latestActivity && latestActivity.id) {
          // Get activity details
          const activityDetails = await upsun.activities.get(prj.id, latestActivity.id);
          console.log(activityDetails);
        }

        // List routes of prj/env
        const routes = await upsun.routes.list(prj.id, envName);
        console.log(routes);
      }
    }

    await upsun.environments.activate(projectTestId, 'main');
  } catch (error) {
    console.error(error);
  } finally {
    if(FULL_TEST){
      console.log('--- Cleanup: Delete Project ---');
      try {
        // await upsun.projects.delete(prjCreatedObject?.id || '');
        console.log('Project deleted successfully');
      } catch (deleteError) {
        console.error('Error deleting project:', deleteError);
      }
    }
  }
}
