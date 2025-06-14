import { UpsunClient } from "../../upsun.js";

export class MetricsTask {
  get(arg0: string, arg1: string, arg2: string): any {
    throw new Error('Method not implemented.');
  }
  
  constructor(private readonly client: UpsunClient) { }

}
