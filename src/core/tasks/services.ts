import { DeploymentApi } from '../../index.js';
import { ServicesValue } from '../../model/ServicesValue.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class ServicesTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private depApi: DeploymentApi,
  ) {
    super(client);
  }

  async list(projectId: string, environmentId: string): Promise<{ [key: string]: ServicesValue }> {
    const currentDeployment = await this.client.environments.getDeployment(
      projectId,
      environmentId,
      'current',
    );

    return currentDeployment.services;
  }
}
