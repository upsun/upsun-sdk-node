import { SshApi } from '../../api/index.js';
import { ListUserSshKeys200Response, SshKey } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { FilterListUserSshKeys } from '../model.js';
import { TaskBase } from './task_base.js';

export class SshTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private sshApi = new SshApi(client.apiConfig),
  ) {
    super(client);
  }

  /**
   * Add an SSH public key to a user.
   * @param value - The public key, for example `ssh-ed25519 AAAA...`.
   * @param userId - The ID of the user who owns the key.
   * @param label - (Optional) A label that identifies the key.
   * @return The new SSH key.
   * @throws An error if the user ID or the key value is empty, or if the API request fails.
   */
  async add(value: string, userId: string, label?: string): Promise<SshKey> {
    TaskBase.checkUserId(userId);

    if (!value) {
      throw new Error('SSH key value is required');
    }

    return await this.sshApi.createUserSshKey({
      userId,
      createUserSshKeyRequest: { value, label },
    });
  }

  /**
   * Get an SSH key of a user.
   * @param userId - The ID of the user who owns the key.
   * @param keyId - The ID of the SSH key.
   * @return The SSH key.
   * @throws An error if the user ID or the key ID is empty, or if the API request fails.
   */
  async get(userId: string, keyId: string): Promise<SshKey> {
    TaskBase.checkUserId(userId);
    TaskBase.checkSshKeyId(keyId);

    return await this.sshApi.getUserSshKey({ userId, keyId });
  }

  /**
   * List the SSH keys of a user.
   * @param userId - The ID of the user who owns the keys.
   * @param filters - (Optional) Filters, sort and pagination.
   * @return One page of SSH keys.
   * @throws An error if the user ID is empty, or if the API request fails.
   */
  async list(userId: string, filters?: FilterListUserSshKeys): Promise<ListUserSshKeys200Response> {
    TaskBase.checkUserId(userId);

    return await this.sshApi.listUserSshKeys({ userId, ...filters });
  }

  /**
   * Delete an SSH key of a user. The API requires a recent authentication.
   * @param userId - The ID of the user who owns the key.
   * @param keyId - The ID of the SSH key.
   * @throws An error if the user ID or the key ID is empty, or if the API request fails.
   */
  async delete(userId: string, keyId: string): Promise<void> {
    TaskBase.checkUserId(userId);
    TaskBase.checkSshKeyId(keyId);

    return await this.sshApi.deleteUserSshKey({ userId, keyId });
  }
}
