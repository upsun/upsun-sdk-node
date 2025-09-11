import { UpsunClient } from "../../upsun.js";
import { TaskBase } from "./taskBase.js";
//import { ResourceApi } from "../hack/ResourceApi.js";

export class ResourcesTask extends TaskBase {
  private resApi: any; // = new ResourceApi(this.client.apiConfig);
  
  constructor(protected readonly client: UpsunClient) {
    super(client);
  }

  async get(projectId: string, environmentId: string) {
    throw new Error("Not implemented");

    // return await this.resApi.getNextDeployement({ projectId, environmentId });
  }

  async set(organizationId: string) {
    throw new Error("Not implemented");
  }

}
