import { DeploymentApi, WorkersValue } from '../../index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class WorkersTask extends TaskBase {
  constructor(protected readonly client: UpsunClient, private depApi: DeploymentApi) {
    super(client);
  }

  async list(projectId: string, environmentId: string): Promise<{[key: string]: WorkersValue}> {
    const currentDeployment = await this.client.environments.getDeployment(projectId, environmentId, 'current');
    
    return currentDeployment.workers;
  }
}
