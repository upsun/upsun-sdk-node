import { UpsunClient } from "../../upsun.js";

export class Mount {
  
  constructor(private readonly client: UpsunClient) { }

  async download(projectId: string, mountId: string) {
    throw new Error("Cannot be implemented");
  }

  async list(projectId: string) {
    throw new Error("Cannot be implemented");
  }
  
  async upload(projectId: string, mountId: string) {
    throw new Error("Cannot be implemented");
  }

}
