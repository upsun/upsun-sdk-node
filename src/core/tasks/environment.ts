import { UpsunClient } from "../../upsun.js";
import { EnvironmentApi } from "../../apis-gen/index.js";
import { EnvironmentActivateInput, Resources1, Resources1InitEnum, SchemasSubscription } from "../../apis-gen/models/index.js";


export class Environement {
  
  constructor(private readonly client: UpsunClient) { }

  async activate(projectId: string, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.activateEnvironment({
      projectId,
      environmentId: env_name,
      environmentActivateInput: { resources: { init: Resources1InitEnum.Default } as Resources1 } as EnvironmentActivateInput
    });
  }

  async delete(projectId: string, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.deleteEnvironment({ projectId, environmentId: env_name });
  }

  async info(projectId: string, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.getEnvironment({ projectId, environmentId: env_name });
  }

  async list(projectId: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.listProjectsEnvironments({ projectId });
  }

  async logs(projectId: string, env_name: string) {
    throw new Error("Not implemented");
  }

  async pause(projectId: string, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.pauseEnvironment({ projectId, environmentId: env_name })
  }

  async relationships(projectId: string, env_name: string) {
    throw new Error("Not implemented");
  }

  async redeploy(projectId: string, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.redeployEnvironment({ projectId, environmentId: env_name })
  }

  async resume(projectId: string, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.resumeEnvironment({ projectId, environmentId: env_name })
  }

  async url(projectId: string, env_name: string) {
    throw new Error("Not implemented");
  }

}
