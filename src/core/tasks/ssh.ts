import { SshKeysApi } from '../../api/index.js';
import { SshKey } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class SshTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private sshKeysApi = new SshKeysApi(client.apiConfig),
  ) {
    super(client);
  }

  /**
   * Add a new SSH key for the user. This method allows you to add a new SSH key for the user by providing the key
   * value, and optionally a user ID and title for the key. The method returns the details of the newly added SSH key,
   * including the key ID, value, title, and other relevant information.
   * @param value - The value of the SSH key to add. This should be the public key string that you want to associate
   * with the user.
   * @param userId - (Optional) The ID of the user to associate the SSH key with. If not provided, the key will be
   * associated with the currently authenticated user.
   * @param title - (Optional) A title or description for the SSH key. This can be used to help identify the key later
   * on.
   * @return The details of the newly added SSH key, including the key ID, value, title, and other relevant information.
   * @throws An error if the SSH key value is not provided, if the user ID is invalid, or if there is an issue with the
   * API request to add the SSH key.
   */
  async add(value: string, userId: string, title?: string): Promise<SshKey> {
    TaskBase.checkUserId(userId);

    if (!value) { throw new Error('SSH key value is required'); }

    return await this.sshKeysApi.createSshKey({
      createSshKeyRequest: { uuid: userId, value, title },
    });
  }

  /**
   * Get the details of an SSH key by its ID. This method allows you to retrieve the details of a specific SSH key by
   * providing the key ID. The method returns the details of the SSH key, including the key ID, value, title, and other
   * relevant information.
   * @param keyId - The ID of the SSH key to retrieve the details for. This should be a positive integer that uniquely
   * identifies the SSH key within the system.
   * @return The details of the SSH key with the specified ID, including the key ID, value, title, and other relevant
   * information. If the SSH key with the specified ID is not found, an error will be thrown.
   * @throws An error if the key ID is invalid (e.g., not a positive integer) or if there is an issue with the API
   * request to retrieve the SSH key details.
   */
  async get(keyId: number): Promise<SshKey> {
    TaskBase.checkSshKeyId(keyId);

    return await this.sshKeysApi.getSshKey({ keyId });
  }

  /**
   * Delete an SSH key by its ID. This method allows you to delete a specific SSH key by providing the key ID. The
   * method returns nothing if the deletion is successful.
   * @param keyId - The ID of the SSH key to delete. This should be a positive integer that uniquely identifies the SSH
   * key within the system.
   * @return Nothing if the deletion is successful. If the SSH key with the specified ID is not found, an error will be
   * thrown.
   * @throws An error if the key ID is invalid (e.g., not a positive integer) or if there is an issue with the API
   * request to delete the SSH key.
   */
  async delete(keyId: number): Promise<void> {
    TaskBase.checkSshKeyId(keyId);

    return await this.sshKeysApi.deleteSshKey({ keyId });
  }
}
