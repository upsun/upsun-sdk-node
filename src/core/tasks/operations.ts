import { AcceptedResponse, RuntimeOperationsApi } from '../../index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class OperationsTask extends TaskBase {
  
  constructor(
    protected readonly client: UpsunClient,
    private runApi: RuntimeOperationsApi,
  ) {
    super(client);
  }

  async run(
    projectId: string, 
    environmentId: string, 
    deploymentId: string,
    service: string,
    operation: string,
    parameters: string[]
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkDeploymentId(deploymentId);

    if (!service) {
      throw new Error('Service must be a non-empty string');
    }
    
    if (!operation) {
      throw new Error('Operation must be a non-empty string');
    }

    return await this.runApi.runOperation({
      projectId,
      environmentId,
      deploymentId,
      environmentOperationInput: {
        service,
        operation,
        parameters,
      },
    });
  }
}
