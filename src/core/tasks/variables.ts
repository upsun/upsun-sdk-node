import { ProjectVariablesApi } from '../../api/ProjectVariablesApi.js';
import {
  AcceptedResponse,
  EnvironmentVariablesApi,
  ProjectVariable,
  ProjectVariablePatch,
} from '../../index.js';
import { EnvironmentVariable } from '../../model/EnvironmentVariable.js';
import { UpsunClient } from '../../upsun.js';
import { EnvironmentVariableCreateParams, ProjectVariableCreateParams } from '../model.js';
import { TaskBase } from './task_base.js';

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
    params?: ProjectVariableCreateParams,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);

    if (!name) {
      throw new Error('Variable name is required');
    }
    if (!value) {
      throw new Error('Variable value is required');
    }

    return await this.projVarApi.createProjectsVariables({
      projectId,
      projectVariableCreateInput: { name, value, ...params },
    });
  }

  /**
   * Deletes a project variable by its ID. This method allows you to delete an existing variable from a project. Once
   * deleted, the variable will no longer be available for use in tasks and deployments within the project.
   * @param projectId The ID of the project from which the variable will be deleted.
   * @param variableId The ID of the variable to delete. This should be a valid variable ID that exists within the
   * project.
   * @throws An error if the project ID or variable ID is invalid, or if there is an issue with the API request to
   * delete the variable.
   */
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

  /**
   * List all project variables for a given project.
   * @param projectId The ID of the project to list variables for.
   * @return An array of project variables associated with the specified project.
   * @throws An error if the project ID is invalid or if there is an issue with the API request to list the project
   * variables.
   */
  async listProjectVariables(projectId: string): Promise<ProjectVariable[]> {
    TaskBase.checkProjectId(projectId);

    return await this.projVarApi.listProjectsVariables({ projectId: projectId });
  }

  /**
   * Updates a project variable by its ID.
   * @param projectId The ID of the project that the variable belongs to.
   * @param variableId The ID of the variable to update. This should be a valid variable ID that exists within the
   * project.
   * @param params Optional parameters for updating the variable, such as a new name, value, or sensitivity status.
   * If the variable is marked as sensitive, its value will not be returned in API responses for security reasons, but
   * it will be stored securely and can be used in tasks and deployments.
   * @return A promise that resolves to an AcceptedResponse indicating that the variable update request has been
   * accepted.
   * @throws An error if the project ID or variable ID is invalid, or if there is an issue with the API request to
   * update the variable.
   */
  async updateProjectVariable(
    projectId: string,
    variableId: string,
    params?: ProjectVariablePatch,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    VariablesTask.checkVariableId(variableId);

    return await this.projVarApi.updateProjectsVariables({
      projectId: projectId,
      projectVariableId: variableId,
      projectVariablePatch: params || {},
    });
  }

  /**
   * Creates a new environment variable for a specific environment within a project.
   * @param projectId The ID of the project that the environment belongs to.
   * @param environmentId The ID of the environment that the variable will be associated with. This should be a valid
   * environment ID that exists within the project.
   * @param name The name of the variable. It must be unique within the environment and should be prefixed with "env:"
   * to indicate that it is an environment variable.
   * @param value The value of the variable. For sensitive variables, the value will not be returned in API responses
   * for security reasons, but it will be stored securely and can be used in tasks and deployments.
   * @param params Optional additional parameters for creating the environment variable, such as whether it is sensitive
   * or not. If the variable is marked as sensitive, its value will not be returned in API responses for security
   * reasons, but it will be stored securely and can be used in tasks and deployments.
   * @return A promise that resolves to an AcceptedResponse indicating that the environment variable creation request
   * has been accepted.
   * @throws An error if the project ID, environment ID, variable name, or variable value is invalid, or if there is an
   * issue with the API request to create the environment variable.
   */
  async createEnvironmentVariable(
    projectId: string,
    environmentId: string,
    name: string,
    value: string,
    params?: EnvironmentVariableCreateParams,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    if (!name) {
      throw new Error('Variable name is required');
    }
    if (!value) {
      throw new Error('Variable value is required');
    }

    return await this.envVarApi.createProjectsEnvironmentsVariables({
      projectId: projectId,
      environmentId: environmentId,
      environmentVariableCreateInput: { name, value, ...params },
    });
  }

  /**
   * Deletes an environment variable by its ID. This method allows you to delete an existing variable from a specific
   * environment within a project. Once deleted, the variable will no longer be available for use in tasks and
   * deployments within that environment.
   * @param projectId The ID of the project that the environment belongs to.
   * @param environmentId The ID of the environment that the variable is associated with.
   * @param variableId The ID of the variable to delete. This should be a valid variable ID that exists within the
   * environment.
   * @returns A promise that resolves to an AcceptedResponse indicating that the environment variable deletion request
   * has been accepted.
   * @throws An error if the project ID, environment ID, or variable ID is invalid, or if there is an issue with the API
   * request to delete the environment variable.
   */
  async deleteEnvironmentVariable(
    projectId: string,
    environmentId: string,
    variableId: string,
  ): Promise<AcceptedResponse> {
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
   * @param projectId
   * @param environmentId
   * @param variableId The ID of the variable to retrieve. Its name is prefixed with "env:" for environment variables
   *        (e.g., "env:MY_VARIABLE"). In case of a sensitive variable, the value will not be returned for security
   *        reasons.
   * @returns A promise that resolves to the requested EnvironmentVariable.
   * @throws An error if the project ID, environment ID, or variable ID is invalid, or if there is an issue with the API
   * request to retrieve the environment variable.
   */
  async getEnvironmentVariable(
    projectId: string,
    environmentId: string,
    variableId: string,
  ): Promise<EnvironmentVariable> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    VariablesTask.checkVariableId(variableId);

    return await this.envVarApi.getProjectsEnvironmentsVariables({
      projectId: projectId,
      environmentId: environmentId,
      variableId: variableId,
    });
  }

  /**
   * List all environment variables for a specific environment within a project. This method retrieves all variables
   * that are associated with the specified environment, allowing you to view and manage the environment variables that
   * are available for use in tasks and deployments within that environment.
   * @param projectId The ID of the project that the environment belongs to.
   * @param environmentId The ID of the environment to list variables for. This should be a valid environment ID that
   * exists within the project.
   * @return An array of environment variables associated with the specified environment. Each variable in the array
   * includes details such as the variable's name, value (if not sensitive), and other relevant information. If there
   * are no environment variables, an empty array is returned.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request to
   * list environment variables.
   */
  async listEnvironmentVariables(
    projectId: string,
    environmentId: string,
  ): Promise<EnvironmentVariable[]> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envVarApi.listProjectsEnvironmentsVariables({
      projectId: projectId,
      environmentId: environmentId,
    });
  }

  /**
   * Updates an environment variable by its ID. This method allows you to update the details of an existing variable for
   * a specific environment within a project. You can update the variable's name, value, and other properties. If the
   * variable is marked as sensitive, its value will not be returned in API responses for security reasons, but it will
   * be stored securely and can be used in tasks and deployments.
   * @param projectId The ID of the project that the environment belongs to.
   * @param environmentId The ID of the environment that the variable is associated with.
   * @param variableId The ID of the variable to update. This should be a valid variable ID that exists within the
   * environment.
   * @param name The new name of the variable. It must be unique within the environment and should be prefixed with
   * "env:" to indicate that it is an environment variable.
   * @param value The new value of the variable. For sensitive variables, the value will not be returned in API
   * responses.
   * @param params Optional additional parameters for updating the environment variable, such as sensitivity status.
   * If the variable is marked as sensitive, its value will not be returned in API responses for security reasons,
   * but it will be stored securely and can be used in tasks and deployments.
   * @return A promise that resolves to an AcceptedResponse indicating that the environment variable update request has
   * been accepted.
   * @throws An error if the project ID, environment ID, variable ID, variable name, or variable value is invalid, or
   * if there is an issue with the API request to update the environment variable.
   */
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

    if (!name) {
      throw new Error('Variable name is required');
    }
    if (!value) {
      throw new Error('Variable value is required');
    }

    return await this.envVarApi.updateProjectsEnvironmentsVariables({
      projectId,
      environmentId,
      variableId,
      environmentVariablePatch: { name, value, ...params },
    });
  }

  /**
   * Checks if the provided variable ID is valid. This method is used to validate that a variable ID is provided and is
   * in the correct format before making API requests that require a variable ID. If the variable ID is invalid, an
   * error is thrown to prevent making an API request with an invalid variable ID.
   * @param variableId
   */
  static checkVariableId(variableId: string): void {
    if (!variableId) {
      throw new Error('Variable ID is required');
    }
  }
}
