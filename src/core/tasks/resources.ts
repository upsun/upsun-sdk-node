import { UpsunClient } from "../../upsun.js";
import { ResourceApi } from "../hack/ResourceApi.js";

export class ResourcesTask {
  
  constructor(private readonly client: UpsunClient) { }

  async get(projectId: string, environmentId: string) {
    const client = new ResourceApi(this.client.apiConfig);
    return await client.getNextDeployement({ projectId, environmentId });
  }

  async set(organizationId: string) {
    throw new Error("Not implemented");
  }

}
