import { UsersApi } from '../../api/index.js';
import { User as UserModel } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class UserTask extends TaskBase {
  private usrApi: UsersApi;

  constructor(protected readonly client: UpsunClient) {
    super(client);

    this.usrApi = new UsersApi(this.client.apiConfig);
  }

  async me(): Promise<UserModel> {
    return await this.usrApi.getCurrentUser();
  }
}
