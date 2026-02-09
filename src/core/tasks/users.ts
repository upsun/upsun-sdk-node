import { UsersApi } from '../../api/index.js';
import { User as UserModel } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class UsersTask extends TaskBase {
  
  constructor(
    protected readonly client: UpsunClient,
    private usrApi: UsersApi,
  ) {
    super(client);
  }

  async me(): Promise<UserModel> {
    return await this.usrApi.getCurrentUser();
  }
}
