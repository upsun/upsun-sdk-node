import { UpsunClient } from "../../upsun.js";

export class Resources {
  
  constructor(private readonly client: UpsunClient) { }

  async get(projectId: string) {
    throw new Error("Not implemented");
  }

  async set(organizationId: string) {
    throw new Error("Not implemented");
  }

}
