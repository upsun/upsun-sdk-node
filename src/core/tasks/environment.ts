import { UpsunClient } from "../../upsun.js";
import { EnvironmentActivateInput, EnvironmentApi, Resources1, Resources1InitEnum, SchemasSubscription } from "../../apis-gen/index.js";


export class Environement {
  
  constructor(private readonly client: UpsunClient) { }

  async activate(prj: SchemasSubscription, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.activateEnvironment(
      prj.projectId as string, env_name,{ resources: { init: Resources1InitEnum.Default } as Resources1 } as EnvironmentActivateInput
    )
  }

  async delete(prj: SchemasSubscription, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.deleteEnvironment(prj.projectId as string, env_name)
  }

  async info(prj: SchemasSubscription, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.getEnvironment(prj.projectId as string, env_name)
  }

  async list(prj: SchemasSubscription) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.listProjectsEnvironments(prj.projectId as string)
  }

  async logs(prj: SchemasSubscription, env_name: string) {
    throw new Error("Not implemented");
  }

  async pause(prj: SchemasSubscription, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.pauseEnvironment(prj.projectId as string, env_name)
  }

  async relationships(prj: SchemasSubscription, env_name: string) {
    throw new Error("Not implemented");
  }

  async redeploy(prj: SchemasSubscription, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.redeployEnvironment(prj.projectId as string, env_name)
  }

  async resume(prj: SchemasSubscription, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.resumeEnvironment(prj.projectId as string, env_name)
  }

  async url(prj: SchemasSubscription, env_name: string) {
    throw new Error("Not implemented");
  }

}
