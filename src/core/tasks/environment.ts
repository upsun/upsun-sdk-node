import { UpsunClient } from "../../upsun.js";
import { EnvironmentApi } from "../../apis-gen/index.js";
import { EnvironmentActivateInput, Resources1, Resources1InitEnum, SchemasSubscription } from "../../apis-gen/models/index.js";


export class Environement {
  
  constructor(private readonly client: UpsunClient) { }

  async activate(prj: SchemasSubscription, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.activateEnvironment({
      projectId: prj.projectId as string,
      environmentId: env_name,
      environmentActivateInput: { resources: { init: Resources1InitEnum.Default } as Resources1 } as EnvironmentActivateInput
    });
  }

  async delete(prj: SchemasSubscription, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.deleteEnvironment({ projectId: prj.projectId as string, environmentId: env_name });
  }

  async info(prj: SchemasSubscription, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.getEnvironment({ projectId: prj.projectId as string, environmentId: env_name });
  }

  async list(prj: SchemasSubscription) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.listProjectsEnvironments({ projectId: prj.projectId as string });
  }

  async logs(prj: SchemasSubscription, env_name: string) {
    throw new Error("Not implemented");
  }

  async pause(prj: SchemasSubscription, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.pauseEnvironment({ projectId: prj.projectId as string, environmentId: env_name })
  }

  async relationships(prj: SchemasSubscription, env_name: string) {
    throw new Error("Not implemented");
  }

  async redeploy(prj: SchemasSubscription, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.redeployEnvironment({ projectId: prj.projectId as string, environmentId: env_name })
  }

  async resume(prj: SchemasSubscription, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.resumeEnvironment({ projectId: prj.projectId as string, environmentId: env_name })
  }

  async url(prj: SchemasSubscription, env_name: string) {
    throw new Error("Not implemented");
  }

}
