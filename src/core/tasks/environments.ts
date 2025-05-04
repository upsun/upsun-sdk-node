import { UpsunClient } from "../../upsun.js";
import { EnvironmentApi } from "../../apis-gen/apis/EnvironmentApi.js";
import { SchemasSubscription } from "../../apis-gen/models/SchemasSubscription.js";


export class Environements {
  
  constructor(private readonly client: UpsunClient) { }

  async redeploy(prj: SchemasSubscription, env_name: string) {
    const api = new EnvironmentApi(this.client.apiConfig);
    return await api.redeployEnvironment({ projectId: prj.projectId as string, environmentId: env_name })
  }
}
