import { UpsunClient } from "../../upsun.js";
import { TaskBase } from "./taskBase.js";

export class MountTask extends TaskBase {
  
  constructor(protected readonly client: UpsunClient) {
    super(client);
  }

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
