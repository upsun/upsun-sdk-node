import { AcceptedResponse, EnvironmentOperationInput, RuntimeOperationsApi } from '../../index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class OperationsTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private runApi: RuntimeOperationsApi,
  ) {
    super(client);
  }

  /**
   * Run an operation on a specific service in the environment. This allows you to execute predefined operations on
   * services that are part of the current deployment. The operation is executed in the context of the specified deployment,
   * which means it will have access to the environment variables and configuration of that deployment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to run the operation in.
   * @param deploymentId - The ID of the deployment to run the operation in. This should be a specific deployment ID
   * or 'current' to indicate the current deployment on the environment.
   * @param service - The name of the service to run the operation on. This should be a service that is part of the
   * current deployment.
   * @param operation - The name of the operation to run. This should be a predefined operation that is supported by the
   * specified service.
   * @param parameters - An array of string parameters to pass to the operation. The specific parameters required will
   * depend on the operation being executed.
   * @return An AcceptedResponse indicating that the operation has been accepted for execution. The client should check
   * the status of the operation through the activity details to confirm whether it was executed successfully or if
   * there was an error.
   */
  async run(
    projectId: string,
    environmentId: string,
    deploymentId: string,
    service: string,
    operation: string,
    parameters: string[],
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

    if (!parameters || parameters.length === 0) {
      throw new Error('Parameters must be a non-empty array of strings');
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
