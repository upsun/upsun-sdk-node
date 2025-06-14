import { SSHKeysApi } from "../../apis-gen/index.js";
import { UpsunClient } from "../../upsun.js";

export class SshTask {
  list(userId: string) {
    throw new Error('Method not implemented.');
  }
  delete(userId: string, arg1: string) {
    throw new Error('Method not implemented.');
  }

  constructor(private readonly client: UpsunClient) { }

  async add(user_id: string, ssh_key: string, key_id: string) {
    const api = new SSHKeysApi(this.client.apiConfig);
    return await api.createSshKey({createSshKeyRequest: { uuid: user_id, value: ssh_key, title:key_id }});
  }

}
