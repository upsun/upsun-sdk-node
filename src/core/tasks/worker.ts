import { UpsunClient } from "../../upsun.js";
import { TaskBase } from "./taskBase.js";

export class WorkerTask extends TaskBase {
  
  constructor(protected readonly client: UpsunClient) {
    super(client);
  }

}
