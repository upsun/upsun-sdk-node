import { SourceOperationsApi } from '../../api/SourceOperationsApi.js';
import { EnvironmentSourceOperationInput } from '../../model/EnvironmentSourceOperationInput.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class SourceOperationsTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private sourceOperationsApi: SourceOperationsApi,
  ) {
    super(client);
  }

  async list(projectId: string, environmentId: string): Promise<{[key: string]: any}> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.sourceOperationsApi.listProjectsEnvironmentsSourceOperations({
      projectId,
      environmentId,
    });
  }

  async get(projectId: string, environmentId: string, params: EnvironmentSourceOperationInput): Promise<any> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    
    return await this.sourceOperationsApi.runSourceOperation({
      projectId,
      environmentId,
      environmentSourceOperationInput: params,
    });
  }
}
