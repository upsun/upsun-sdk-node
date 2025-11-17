import { SshKeysApi } from '../../api/index.js';
import { SshKey } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class SshTask extends TaskBase {
  list(userId: string): never {
    throw new Error('Method not implemented.');
  }
  delete(userId: string, arg1: string): never {
    throw new Error('Method not implemented.');
  }

  constructor(protected readonly client: UpsunClient) {
    super(client);
  }

  async add(user_id: string, ssh_key: string, key_id: string): Promise<SshKey> {
    const api = new SshKeysApi(this.client.apiConfig);
    return await api.createSshKey({
      createSshKeyRequest: { uuid: user_id, value: ssh_key, title: key_id },
    });
  }
}
