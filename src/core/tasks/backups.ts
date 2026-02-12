import { EnvironmentBackupsApi } from '../../api/index.js';
import { AcceptedResponse, Backup, Resources6, Resources6InitEnum } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class BackupsTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private bckApi: EnvironmentBackupsApi,
  ) {
    super(client);
  }

  /**
   * Create a backup for an environment.
   * By default, the backup will be created as a "safe" backup, which means that the backup process will attempt to
   * minimize the impact on the environment's performance and availability.
   * If set to false ("Live backup"), this leaves the environment running and open to connections during the backup.
   * This reduces downtime, at the risk of backing up data in an inconsistent state.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param isSafe - Whether to create a "safe" backup (default: true).
   * @returns An AcceptedResponse indicating that the backup creation request has been accepted.
   */
  async create(
    projectId: string,
    environmentId: string,
    isSafe: boolean = true,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.bckApi.backupEnvironment({
      projectId,
      environmentId,
      environmentBackupInput: { safe: isSafe },
    });
  }

  /**
   * Delete a backup for an environment. The API will return a 202 Accepted response if the deletion request has been
   * accepted and is being processed. However, the client should check the backup's details to confirm whether the
   * deletion was successful or not.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param backupId - The ID of the backup to delete.
   * @returns An AcceptedResponse indicating that the backup deletion request has been accepted.
   */
  async delete(
    projectId: string,
    environmentId: string,
    backupId: string,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkBackupId(backupId);

    return await this.bckApi.deleteProjectsEnvironmentsBackups({
      projectId,
      environmentId,
      backupId,
    });
  }

  /**
   * Get the details of a backup for an environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param backupId - The ID of the backup to retrieve.
   * @returns The details of the specified backup.
   */
  async get(projectId: string, environmentId: string, backupId: string): Promise<Backup> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkBackupId(backupId);

    return await this.bckApi.getProjectsEnvironmentsBackups({ projectId, environmentId, backupId });
  }

  /**
   * List the backups for an environment. The returned list is ordered by creation date, with the most recent backup
   * appearing first in the list.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @returns A list of backups for the specified environment.
   */
  async list(projectId: string, environmentId: string): Promise<Array<Backup>> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.bckApi.listProjectsEnvironmentsBackups({ projectId, environmentId });
  }

  /**
   * Restore an environment from a backup. The API will return a 202 Accepted response if the restoration request has
   * been accepted and is being processed. However, the client should check the activity's details to confirm whether
   * the restoration was successful or not.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param backupId - The ID of the backup to restore from.
   * @param restoreCode - Whether to restore the code (default: true).
   * @param restoreResources - Whether to restore the resources (default: true).
   * @param environmentName - (Optional) The name for the new environment that will be created as part of the
   *        restoration. If not provided, the restored environment will keep the same name as before.
   * @param branchFrom - (Optional) The name of an existing branch to use as the source for the restored environment's
   *        code. This is only applicable if `restoreCode` is set to true. If not provided, the restored environment
   *        will use the code from the backup.
   * @param init - (Optional) The initialization resources strategy in the restored environment. This is only
   *        applicable if `restoreResources` is set to true. If not provided, it defaults to
   *        `Resources6InitEnum.DEFAULT`.
   * @returns An AcceptedResponse indicating that the environment restoration request has been accepted.
   */
  async restore(
    projectId: string,
    environmentId: string,
    backupId: string,
    restoreCode: boolean = true,
    restoreResources: boolean = true,
    environmentName?: string,
    branchFrom?: string,
    init: Resources6InitEnum = Resources6InitEnum.DEFAULT,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkBackupId(backupId);

    return await this.bckApi.restoreBackup({
      projectId,
      environmentId,
      backupId,
      environmentRestoreInput: {
        restoreCode,
        restoreResources,
        environmentName: environmentName || null,
        branchFrom: branchFrom || null,
        resources: { init: init },
      },
    });
  }
}
