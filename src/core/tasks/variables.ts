import { ProjectVariablesApi } from '../../api/ProjectVariablesApi.js';
import { AcceptedResponse, EnvironmentVariableCreateInput, EnvironmentVariablesApi, ProjectVariable, ProjectVariableCreateInput, ProjectVariablePatch } from '../../index.js';
import { EnvironmentVariable } from '../../model/EnvironmentVariable.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

// Type creation for request parameters that omit required fields from the original input types
export type ProjectVariableCreateParams = Omit<ProjectVariableCreateInput, 'name' | 'value'>;
export type EnvironmentVariableCreateParams = Omit<EnvironmentVariableCreateInput, 'name' | 'value'>;

export class VariablesTask extends TaskBase {
  
  constructor(
    protected readonly client: UpsunClient,
    private projVarApi: ProjectVariablesApi,
    private envVarApi: EnvironmentVariablesApi,
  ) {
    super(client);
  }

  /**
   * Creates a new project variable. This method allows you to create a new variable for a project. The variable can be used to store sensitive information, such as API keys or credentials, that can be accessed by tasks and deployments within the project.
   * @param projectId The ID of the project for which the variable will be created.
   * @param name The name of the variable. It must be unique within the project and can be prefixed with "env:" to indicate that it is an environment variable (e.g., "env:MY_VARIABLE") exposed in your container.
   * @param value The value of the variable. For sensitive variables, the value will not be returned in API responses for security reasons, but it will be stored securely and can be used in tasks and deployments.
   * @param params Optional additional parameters for creating the variable, such as whether it is sensitive or not. If the variable is marked as sensitive, its value will not be returned in API responses for security reasons, but it will be stored securely and can be used in tasks and deployments.
   * @return A promise that resolves to an AcceptedResponse indicating that the variable creation request has been accepted. The actual creation of the variable may take some time, and you can check the status of the operation using the returned response.
   */
  async createProjectVariable(
    projectId: string, 
    name: string,
    value: string,
    params?: ProjectVariableCreateParams
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);

    if (!name) { throw new Error('Variable name is required'); }
    if (!value) { throw new Error('Variable value is required'); }
    
    return await this.projVarApi.createProjectsVariables({
      projectId,
      projectVariableCreateInput: {name, value, ...params},
    });
  }

  async deleteProjectVariable(projectId: string, variableId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    VariablesTask.checkVariableId(variableId);

    await this.projVarApi.deleteProjectsVariables({
      projectId: projectId,
      projectVariableId: variableId,
    });
  }

  /**
   * Get a project variable by its ID.
   * 
   * @param projectId 
   * @param variableId The ID of the variable to retrieve. Its name is prefixed with "env:" for environment variables 
   *        (e.g., "env:MY_VARIABLE"). In case of a sensitive variable, the value will not be returned for security 
   *        reasons.
   * @returns
   */
  async getProjectVariable(projectId: string, variableId: string): Promise<ProjectVariable> {
    TaskBase.checkProjectId(projectId);
    VariablesTask.checkVariableId(variableId);

    return await this.projVarApi.getProjectsVariables({
      projectId: projectId,
      projectVariableId: variableId,
    });
  }

  async listProjectVariables(projectId: string): Promise<ProjectVariable[]> {
    TaskBase.checkProjectId(projectId);

    return await this.projVarApi.listProjectsVariables({ projectId: projectId });
  }

  async updateProjectVariable(
    projectId: string, 
    variableId: string, 
    params?: ProjectVariablePatch
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    VariablesTask.checkVariableId(variableId);

    return await this.projVarApi.updateProjectsVariables({
      projectId: projectId,
      projectVariableId: variableId,
      projectVariablePatch: params || {},
    });
  }

  async createEnvironmentVariable(
    projectId: string, 
    environmentId: string, 
    name: string,
    value: string,
    params?: EnvironmentVariableCreateParams,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    if (!name) { throw new Error('Variable name is required'); }
    if (!value) { throw new Error('Variable value is required'); }

    return await this.envVarApi.createProjectsEnvironmentsVariables({
      projectId: projectId,
      environmentId: environmentId,
      environmentVariableCreateInput: {name, value, ...params},
    });
  }

  async deleteEnvironmentVariable(projectId: string, environmentId: string, variableId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    VariablesTask.checkVariableId(variableId);

    return await this.envVarApi.deleteProjectsEnvironmentsVariables({
      projectId: projectId,
      environmentId: environmentId,
      variableId: variableId,
    });
  }

  /**
   * Get an environment variable by its ID.
   * 
   * @param projectId 
   * @param environmentId 
   * @param variableId The ID of the variable to retrieve. Its name is prefixed with "env:" for environment variables 
   *        (e.g., "env:MY_VARIABLE"). In case of a sensitive variable, the value will not be returned for security 
   *        reasons.
   * @returns 
   */
  async getEnvironmentVariable(projectId: string, environmentId: string, variableId: string): Promise<EnvironmentVariable> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    VariablesTask.checkVariableId(variableId);

    return await this.envVarApi.getProjectsEnvironmentsVariables({
      projectId: projectId,
      environmentId: environmentId,
      variableId: variableId,
    });
  }

  async listEnvironmentVariables(projectId: string, environmentId: string): Promise<EnvironmentVariable[]> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envVarApi.listProjectsEnvironmentsVariables({
      projectId: projectId,
      environmentId: environmentId,
    });
  }

  async updateEnvironmentVariable(
    projectId: string, 
    environmentId: string, 
    variableId: string, 
    name: string,
    value: string,
    params?: EnvironmentVariableCreateParams,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    VariablesTask.checkVariableId(variableId);

    if (!name) { throw new Error('Variable name is required'); }
    if (!value) { throw new Error('Variable value is required'); }

    return await this.envVarApi.updateProjectsEnvironmentsVariables({
      projectId,
      environmentId,
      variableId,
      environmentVariablePatch: {name, value, ...params},
    });
  }

  static checkVariableId(variableId: string): void {
    if (!variableId) {
      throw new Error('Variable ID is required');
    }
  }
}
