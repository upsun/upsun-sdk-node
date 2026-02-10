import { AcceptedResponse, EnvironmentOperationInput, RuntimeOperationsApi } from '../../index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class OperationsTask extends TaskBase {
  
  constructor(protected readonly client: UpsunClient, private runApi: RuntimeOperationsApi) {
    super(client);
  }

  async run(
    projectId: string, 
    environmentId: string, 
    deploymentId: string,
    params: EnvironmentOperationInput,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkDeploymentId(deploymentId);

    if (!params.service) {
      throw new Error('Service must be a non-empty string');
    }
    
    if (!params.operation) {
      throw new Error('Operation must be a non-empty string');
    }

    return await this.runApi.runOperation({
      projectId,
      environmentId,
      deploymentId,
      environmentOperationInput:  params,
    });
  }
}
