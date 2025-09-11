import { UpsunClient } from "../../upsun.js";
import { TaskBase } from "./taskBase.js";

export class MetricsTask extends TaskBase {
  get(arg0: string, arg1: string, arg2: string): any {
    throw new Error('Method not implemented.');
  }
  
  constructor(protected readonly client: UpsunClient) {
    super(client);
  }

}
