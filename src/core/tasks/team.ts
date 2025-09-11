import { UpsunClient } from "../../upsun.js";
import { TaskBase } from "./taskBase.js";

export class TeamTask extends TaskBase {
  
  constructor(protected readonly client: UpsunClient) {
    super(client);
  }

}
