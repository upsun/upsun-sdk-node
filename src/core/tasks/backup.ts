import { EnvironmentBackupsApi } from '../../api/index.js';
import { AcceptedResponse, Backup, EnvironmentBackupInput } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class BackupTask extends TaskBase {
  private bckApi: EnvironmentBackupsApi;

  constructor(protected readonly client: UpsunClient) {
    super(client);

    this.bckApi = new EnvironmentBackupsApi(this.client.apiConfig);
  }

  async create(
    projectId: string,
    environmentId: string,
    safe: boolean = true,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.bckApi.backupEnvironment({
      projectId,
      environmentId,
      environmentBackupInput: { safe } as EnvironmentBackupInput,
    });
  }

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

  async get(projectId: string, environmentId: string, backupId: string): Promise<Backup> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkBackupId(backupId);

    return await this.bckApi.getProjectsEnvironmentsBackups({ projectId, environmentId, backupId });
  }

  async list(projectId: string, environmentId: string): Promise<Array<Backup>> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.bckApi.listProjectsEnvironmentsBackups({ projectId, environmentId });
  }

  async restore(
    projectId: string,
    environmentId: string,
    backupId: string,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkBackupId(backupId);

    return await this.bckApi.restoreBackup({
      projectId,
      environmentId,
      backupId,
      environmentRestoreInput: {
        environmentName: environmentId,
        branchFrom: null,
        restoreCode: true,
        restoreResources: true,
        resources: null,
      },
    });
  }
}
