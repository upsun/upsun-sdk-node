import { EnvironmentBackupsApi } from '../../api/index.js';
import { AcceptedResponse, Backup, EnvironmentBackupInput, Resources6 } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class BackupsTask extends TaskBase {
  
  constructor(protected readonly client: UpsunClient, private bckApi: EnvironmentBackupsApi) {
    super(client);
  }

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
    restoreCode: boolean = true,
    restoreResources: boolean = true,
    environmentName?: string,
    branchFrom?: string,
    init?: string,
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
        resources: {init: init} as Resources6,
      },
    });
  }
}
