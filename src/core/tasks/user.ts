import { UsersApi } from "../../apis-gen/index.js";
import { User as UserModel } from "../../apis-gen/models/index.js";
import { UpsunClient } from "../../upsun.js";

export class UserTask {
  
  constructor(private readonly client: UpsunClient) { }

  async me(): Promise<UserModel> {
    const api = new UsersApi(this.client.apiConfig);
    return await api.getCurrentUser();
  }
}
