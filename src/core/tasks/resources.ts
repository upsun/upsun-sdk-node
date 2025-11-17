import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';
//import { ResourceApi } from "../hack/ResourceApi.js";

interface ResourceApiPlaceholder {
  getNextDeployement: (params: { projectId: string; environmentId: string }) => Promise<unknown>;
}

export class ResourcesTask extends TaskBase {
  private resApi: ResourceApiPlaceholder | null = null; // = new ResourceApi(this.client.apiConfig);

  constructor(protected readonly client: UpsunClient) {
    super(client);
  }

  async get(projectId: string, environmentId: string): Promise<never> {
    throw new Error('Not implemented');

    // return await this.resApi.getNextDeployement({ projectId, environmentId });
  }

  async set(organizationId: string): Promise<never> {
    throw new Error('Not implemented');
  }
}
