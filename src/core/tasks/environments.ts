import { UpsunClient } from '../../upsun.js';
import { EnvironmentApi } from '../../api/index.js';
import {
  AcceptedResponse,
  Environment,
  EnvironmentActivateInput,
  EnvironmentCollection,
  EnvironmentMergeInput,
  Resources2,
  Resources2InitEnum,
  Resources3,
  Resources3InitEnum,
} from '../../model/index.js';
import { TaskBase } from './task_base.js';

export class EnvironmentsTask extends TaskBase {
  private envApi: EnvironmentApi;

  constructor(protected readonly client: UpsunClient) {
    super(client);

    this.envApi = new EnvironmentApi(this.client.apiConfig);
  }

  async activate(projectId: string, env_name: string): Promise<AcceptedResponse> {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.activateEnvironment({
      projectId,
      environmentId: env_name,
      environmentActivateInput: {
        resources: { init: Resources2InitEnum.DEFAULT } as Resources2,
      } as EnvironmentActivateInput,
    });
  }

  // async branch(projectId: string, env_name_src: string, env_name_dst) {
  //   const api = new EnvironmentApi(this.client.apiConfig);
  //   return await api.branchEnvironment({
  //     projectId,
  //     environmentId: env_name,
  //     environmentBranchInput: {
  //       title: env_name,
  //       name: env_name,
  //       cloneParent: true,
  //       type: "development",
  //       resources: { init: Resources3InitEnum.Manual } as Resources3
  //      } as EnvironmentBranchInput });
  // }

  async deactivate(projectId: string, env_name: string): Promise<AcceptedResponse> {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.deactivateEnvironment({ projectId, environmentId: env_name });
  }

  async delete(projectId: string, env_name: string): Promise<AcceptedResponse> {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.deleteEnvironment({ projectId, environmentId: env_name });
  }

  async info(projectId: string, env_name: string): Promise<Environment> {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.getEnvironment({ projectId, environmentId: env_name });
  }

  async list(projectId: string): Promise<EnvironmentCollection> {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.listProjectsEnvironments({ projectId });
  }

  async logs(projectId: string, env_name: string, app_name: string): Promise<never> {
    throw new Error('Not implemented');
  }

  async merge(projectId: string, env_name: string): Promise<AcceptedResponse> {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.mergeEnvironment({
      projectId,
      environmentId: env_name,
      environmentMergeInput: {
        resources: { init: Resources3InitEnum.DEFAULT } as Resources3,
      } as EnvironmentMergeInput,
    });
  }

  async pause(projectId: string, env_name: string): Promise<AcceptedResponse> {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.pauseEnvironment({ projectId, environmentId: env_name });
  }

  async relationships(projectId: string, env_name: string): Promise<never> {
    throw new Error('Not implemented');
  }

  async redeploy(projectId: string, env_name: string): Promise<AcceptedResponse> {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.redeployEnvironment({ projectId, environmentId: env_name });
  }

  async resume(projectId: string, env_name: string): Promise<AcceptedResponse> {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.resumeEnvironment({ projectId, environmentId: env_name });
  }

  async urls(projectId: string, env_name: string): Promise<never> {
    throw new Error('Not implemented');
  }
}
