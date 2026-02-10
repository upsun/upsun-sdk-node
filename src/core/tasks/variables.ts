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

  async createProjectVariable(
    projectId: string, 
    name: string,
    value: string,
    params?: ProjectVariableCreateParams
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
      projectVariableCreateInput: {name, value, ...params},
    });
  }

  async deleteProjectVariable(projectId: string, variableId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    this.checkVariableId(variableId);

    await this.projVarApi.deleteProjectsVariables({
      projectId: projectId,
      projectVariableId: variableId,
    });
  }

  async getProjectVariable(projectId: string, variableId: string): Promise<ProjectVariable> {
    TaskBase.checkProjectId(projectId);
    this.checkVariableId(variableId);

    return await this.projVarApi.getProjectsVariables({
      projectId: projectId,
      projectVariableId: variableId,
    });
  }

  async listProjectVariables(projectId: string): Promise<ProjectVariable[]> {
    TaskBase.checkProjectId(projectId);

    return await this.projVarApi.listProjectsVariables({
      projectId: projectId,
    });
  }

  async updateProjectVariable(
    projectId: string, 
    variableId: string, 
    params?: ProjectVariablePatch
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    this.checkVariableId(variableId);

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

    if (!name) {
      throw new Error('Variable name is required');
    }
    if (!value) {
      throw new Error('Variable value is required');
    }

    return await this.envVarApi.createProjectsEnvironmentsVariables({
      projectId: projectId,
      environmentId: environmentId,
      environmentVariableCreateInput: {name, value, ...params},
    });
  }

  async deleteEnvironmentVariable(projectId: string, environmentId: string, variableId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    this.checkVariableId(variableId);
    return await this.envVarApi.deleteProjectsEnvironmentsVariables({
      projectId: projectId,
      environmentId: environmentId,
      variableId: variableId,
    });
  }

  async getEnvironmentVariable(projectId: string, environmentId: string, variableId: string): Promise<EnvironmentVariable> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    this.checkVariableId(variableId);
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
    this.checkVariableId(variableId);

    return await this.envVarApi.updateProjectsEnvironmentsVariables({
      projectId,
      environmentId,
      variableId,
      environmentVariablePatch: {name, value, ...params},
    });
  }

  private checkVariableId(variableId: string): void {
    if (!variableId) {
      throw new Error('Variable ID is required');
    }
  }
}
