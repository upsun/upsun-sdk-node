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

  /**
   * List source operations for an environment. This method retrieves a list of all source operations that are 
   * associated with the specified project and environment.
   * @param projectId - The ID of the project to list source operations for.
   * @param environmentId - The ID of the environment to list source operations for.
   * @return A list of source operations that are associated with the specified project and environment, including 
   * details such as the operation type, status, and other relevant details for each source operation.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async list(projectId: string, environmentId: string): Promise<EnvironmentSourceOperationCollection> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.sourceOperationsApi.listProjectsEnvironmentsSourceOperations({
      projectId,
      environmentId,
    });
  }

  /**
   * Run a source operation for an environment. This method allows you to run a source operation for a specified project
   * and environment by providing the necessary parameters for the operation.
   * @param projectId - The ID of the project to run the source operation for.
   * @param environmentId - The ID of the environment to run the source operation for.
   * @param params - An object containing the necessary parameters for the source operation. The specific parameters
   * required will depend on the type of source operation being run, and may include details such as the operation type,
   * source details, and other relevant information.
   * @return An AcceptedResponse indicating that the source operation request has been accepted. The client should check
   * the status of the source operation through the operation details to confirm whether it was executed successfully or
   * if there were any issues.
   * @throws An error if the project ID or environment ID is invalid, if the required parameters for the source 
   * operation are missing or incorrect, or if there is an issue with the API request.
   */
  async run(
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
