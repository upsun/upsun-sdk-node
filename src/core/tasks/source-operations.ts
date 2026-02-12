import { SourceOperationsApi } from '../../api/SourceOperationsApi.js';
import { AcceptedResponse } from '../../model/AcceptedResponse.js';
import { EnvironmentSourceOperationCollection } from '../../model/EnvironmentSourceOperationCollection.js';
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

  async list(projectId: string, environmentId: string): Promise<EnvironmentSourceOperationCollection> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.sourceOperationsApi.listProjectsEnvironmentsSourceOperations({
      projectId,
      environmentId,
    });
  }

  async get(
    projectId: string,
    environmentId: string,
    params: EnvironmentSourceOperationInput,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.sourceOperationsApi.runSourceOperation({
      projectId,
      environmentId,
      environmentSourceOperationInput: params,
    });
  }
}
