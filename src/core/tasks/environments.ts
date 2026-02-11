import { UpsunClient } from '../../upsun.js';
import { AutoscalingApi, DeploymentApi, EnvironmentApi, EnvironmentTypeApi } from '../../api/index.js';
import {
  AcceptedResponse,
  Activity,
  Backup,
  Deployment,
  Domain,
  DomainPatch,
  Environment,
  EnvironmentActivateInput,
  EnvironmentBranchInputTypeEnum,
  EnvironmentPatch,
  EnvironmentType,
  EnvironmentVariable,
  FilesInner,
  HttpAccessPermissions2,
  Resources3InitEnum,
  Resources4InitEnum,
  Resources5InitEnum,
  Resources6InitEnum,
  Route,
  RouteCollection,
} from '../../model/index.js';
import { TaskBase } from './task_base.js';
import { EnvironmentVariableCreateParams } from '../index.js';

export class EnvironmentsTask extends TaskBase {
  
  constructor(
    protected readonly client: UpsunClient,
    private envApi: EnvironmentApi,
    private envTypeApi: EnvironmentTypeApi,
    private deployApi: DeploymentApi,
    private autoscalingApi: AutoscalingApi,
  ) {
    super(client);
  }

  /**
   * Activate an environment. The API will return a 202 Accepted response if the activation request has been accepted, 
   * but the client should check the environment's current activities to confirm whether the activation was successful 
   * or not.
   */
  async activate(
    projectId: string, 
    environmentId: string, 
    init?: string
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.activateEnvironment({
      projectId,
      environmentId,
      environmentActivateInput: {
        resources: { init },
      } as EnvironmentActivateInput,
    });
  }

  /**
   * Create a new environment by branching from an existing environment. The new environment will be created 
   * asynchronously, and the API will return a 202 Accepted response if the branch request has been accepted. 
   * The client can then check the list of environments or the details of the new environment to monitor the progress 
   * and confirm when the branching is completed.
   */
  async branch(
    projectId: string, 
    environmentId: string, 
    title: string,
    name: string, 
    cloneParent: boolean = true,
    type: EnvironmentBranchInputTypeEnum = EnvironmentBranchInputTypeEnum.DEVELOPMENT,
    init: Resources3InitEnum = Resources3InitEnum.PARENT,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    
    if (!title) {
      throw new Error('Title must be a non-empty string');
    }

    if (!name) {
      throw new Error('Name must be a non-empty string');
    }

    return await this.envApi.branchEnvironment({
      projectId,
      environmentId: environmentId,
      environmentBranchInput: { title, name, cloneParent, type, resources: { init }} });
  }

  /**
   * Deactivate an environment. The API will return a 202 Accepted response if the deactivation request has been 
   * accepted, but the client should check the environment's current activities to confirm whether the deactivation was 
   * successful or not.
   */
  async deactivate(projectId: string, environmentId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    
    return await this.envApi.deactivateEnvironment({ projectId, environmentId });
  }

  /**
   * Delete an environment. The deletion will be best-effort and may not succeed if the environment is currently 
   * undergoing another activity such as deployment, merging, etc. The API will return a 202 Accepted response if 
   * the delete request has been accepted, but the client should check the environment's current activities to confirm 
   * whether the deletion was successful or not.
   */
  async delete(projectId: string, environmentId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.deleteEnvironment({ projectId, environmentId });
  }

  /**
   * Update the HTTP access permissions for the environment. 
   */
  async httpAccess(
    projectId: string, 
    environmentId: string,
    httpAccess: HttpAccessPermissions2,
  ): Promise<Environment> {  
    TaskBase.checkProjectId(projectId); 
    TaskBase.checkEnvironmentId(environmentId);
    
    return this.update(projectId, environmentId, { httpAccess });
  }

  /**
   * Get details of a specific environment. The details include information about the environment's current status,
   */
  async get(projectId: string, environmentId: string): Promise<Environment> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.getEnvironment({ projectId, environmentId });  
  }

  /**
   * Get or Update details of the environment. If params are provided, the environment will be updated with the 
   * specified parameters before returning the details.
   */
  async info(projectId: string, environmentId: string, params?: EnvironmentPatch): Promise<Environment> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    if(params) {
      return await this.update(projectId, environmentId, params);
    } else {
      return await this.get(projectId, environmentId);
    }
  }

  /**
   * Initialize the environment by deploying code from a specified repository and profile, with optional configuration 
   * and initialization parameters.
   */
  async init(
    projectId: string, 
    environmentId: string,
    profile: string,
    repository: string,
    files: Array<FilesInner>,
    config?: string,
    init: Resources4InitEnum = Resources4InitEnum.DEFAULT
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    if (!profile) {
      throw new Error('Profile must be a non-empty string');
    }
    if (!repository) {
      throw new Error('Repository must be a non-empty string');
    }

    if (files.length === 0) {
      throw new Error('Files must be a non-empty array of [filePath, fileMode, fileContents]');
    }

    return await this.envApi.initializeEnvironment({ 
      projectId,
      environmentId,
      environmentInitializeInput: {profile,repository,config: config || null,resources: { init: init },files},
    });
  }

  /**
   * List all environments in a project.
   */
  async list(projectId: string): Promise<Array<Environment>> {
    TaskBase.checkProjectId(projectId);
    
    return await this.envApi.listProjectsEnvironments({ projectId: projectId });
  }

  //TODO implement logs streaming?
  async logs(projectId: string, environmentId: string, app_name: string): Promise<never> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    throw new Error('Not implemented');
  }

  /**
   * Merge the environment with its parent. The merge will be best-effort and may not succeed if the environment is 
   * currently undergoing another activity such as deployment, merging, etc.
   * The API will return a 202 Accepted response if the merge request has been accepted, but the client should check 
   * the environment's current activities to confirm whether the merge was successful or not.
   */
  async merge(
    projectId: string, 
    environmentId: string, 
    init: Resources5InitEnum = Resources5InitEnum.DEFAULT
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.mergeEnvironment({
      projectId: projectId,
      environmentId: environmentId,
      environmentMergeInput: {resources: { init: init }},
    });
  }

  /**
   * Pause the environment. The API will return a 202 Accepted response if the pause request has been accepted, 
   * but the client should check the environment's current activities to confirm whether the pause action was successful
   * or not.
   */
  async pause(projectId: string, environmentId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.pauseEnvironment({ projectId, environmentId });
  }

  /**
   * Redeploy the environment. Redeployment will trigger a new deployment activity on the environment, 
   * which will redeploy the currently deployed code without making any changes to the environment's code or 
   * configuration. The API will return a 202 Accepted response if the redeploy request has been accepted, 
   * but the client should check the environment's current activities to confirm whether the redeploy was successful 
   * or not.
   */
  async redeploy(projectId: string, environmentId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.redeployEnvironment({ projectId, environmentId });
  }

  //TODO implement relationships
  async relationships(projectId: string, environmentId: string, appId: string): Promise<never> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    const appConfig = this.client.applications.configGet(projectId, environmentId, appId);

    

    throw new Error('Not implemented');
  }

  /**
   * Resume an environment that is currently paused. The API will return a 202 Accepted response if the resume request 
   * has been accepted, but the client should check the environment's current activities to confirm whether the resume 
   * action was successful or not.
   */
  async resume(projectId: string, environmentId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.resumeEnvironment({ projectId, environmentId });
  }

  /**
   * Synchronize the environment with its parent. The synchronization will be best-effort and may not succeed if the 
   * environment is currently undergoing another activity such as deployment, merging, etc. 
   * The API will return a 202 Accepted response if the synchronization request has been accepted, 
   * but the client should check the environment's current activities to confirm whether the synchronization was 
   * successful or not.
   */
  async synchronize(
    projectId: string, 
    environmentId: string,
    synchronizeCode: boolean = true,
    rebase: boolean = true,
    synchronizeData: boolean = true,
    synchronizeResources: boolean = true,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.synchronizeEnvironment({ 
      projectId: projectId,
      environmentId: environmentId,
      environmentSynchronizeInput: {synchronizeCode, rebase, synchronizeData, synchronizeResources},
    });
  }

  /**
   * Update the environment with the specified parameters.
   */
  async update(
      projectId: string,
      environmentId: string,
      params?: EnvironmentPatch
  ): Promise<Environment> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    const response = await this.envApi.updateEnvironment({projectId, environmentId, environmentPatch: params || {}});

    if(response.code === 200) {
      return this.get(projectId, environmentId);
    } else {
      throw new Error(`Failed to update environment`);
    }
  }

  /**
   * Cancel an ongoing activity on the environment, such as deployment, synchronization, etc. 
   * The cancellation will be best-effort and may not succeed if the activity is too close to completion. 
   * The API will return a 202 Accepted response if the cancellation request has been accepted, 
   * but the client should check the environment's current activities to confirm whether the cancellation was successful
   * or not.
   */
  async activityCancel(projectId: string, environmentId: string, activityId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkActivityId(activityId);

    return await this.client.activities.cancel(projectId, activityId, environmentId);
  }

  /**
   * Get details of a specific activity on the environment, such as deployment, synchronization, etc.
   */
  async getActivity(projectId: string, environmentId: string, activityId: string): Promise<Activity> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkActivityId(activityId);

    return await this.client.activities.get(projectId, activityId, environmentId);
  }

  /**
   * List all activities on the environment, such as deployments, synchronizations, etc.
   */
  async listActivities(projectId: string, environmentId: string): Promise<Activity[]> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.activities.list(projectId, environmentId);
  }

  /**
   * Trigger a backup of the environment. The backup will be created asynchronously, and the API will return 
   * a 202 Accepted response if the backup request has been accepted. The client can then check the list of backups to 
   * monitor the progress and confirm when the backup is completed. 
   * The isSafe parameter is a best-effort attempt to create a backup without causing disruption to the environment.
   */
  async backup(projectId: string, environmentId: string, isSafe?: boolean): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.backups.create(projectId, environmentId, isSafe);
  }

  /**
   * List all backups of the environment.
   */
  async listBackups(projectId: string, environmentId: string): Promise<Backup[]> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.backups.list(projectId, environmentId);
  }

  /**
   * Delete a specific backup of the environment. The deletion will be best-effort and may not succeed if the backup is 
   * currently being created or restored.
   */
  async deleteBackup(projectId: string, environmentId: string, backupId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkBackupId(backupId);

    return await this.client.backups.delete(projectId, environmentId, backupId);
  }

  /**
   * Get details of a specific backup of the environment.
   */
  async getBackup(projectId: string, environmentId: string, backupId: string): Promise<Backup> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkBackupId(backupId);

    return await this.client.backups.get(projectId, environmentId, backupId);
  }
  /**
   * Restore the environment from a specific backup.
   */
  async restoreBackup(
    projectId: string, 
    environmentId: string,
    backupId: string,
    restoreCode: boolean = true,
    restoreResources: boolean = true,
    environmentName?: string,
    branchFrom?: string,
    init?: Resources6InitEnum,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkBackupId(backupId);

    return await this.client.backups.restore(
      projectId, 
      environmentId,
      backupId,
      restoreCode,
      restoreResources,
      environmentName,
      branchFrom,
      init
    );
  }

  /**
   * Get details of a specific environment type, such as development, production, etc.
   */
  async getType(projectId: string, environmentTypeId: string): Promise<EnvironmentType> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentTypeId);

    return await this.envTypeApi.getEnvironmentType({ projectId: projectId, environmentTypeId: environmentTypeId });
  }

  /**
   * Create an environment variable in the environment. Environment variables are used to store configuration values 
   * that can be accessed by the applications running in the environment. The name of the variable must be unique within
   * the environment. If a variable with the same name already exists, the API will return an error.
   */
  async createVariables(
    projectId: string, 
    environmentId: string, 
    name: string,
    value: string,
    params?: EnvironmentVariableCreateParams,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.variables.createEnvironmentVariable(projectId, environmentId, name, value, params);
  }

  /**
   * Delete an environment variable from the environment. The API will return an error if the variable does not exist.
   */
  async deleteVariable(projectId: string, environmentId: string, variableId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkVariableId(variableId);

    return await this.client.variables.deleteEnvironmentVariable(projectId, environmentId, variableId);
  }

  /**
   * Get details of a specific environment variable in the environment. 
   * The API will return an error if the variable does not exist.
   */
  async getVariable(projectId: string, environmentId: string, variableId: string): Promise<EnvironmentVariable> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkVariableId(variableId);

    return await this.client.variables.getEnvironmentVariable(projectId, environmentId, variableId);
  }

  /**
   * List all environment variables in the environment.
   */
  async listVariables(projectId: string, environmentId: string): Promise<EnvironmentVariable[]> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.variables.listEnvironmentVariables(projectId, environmentId);
  }

  /**
   * Update an environment variable in the environment.
   */
  async updateVariable(
    projectId: string, 
    environmentId: string,
    variableId: string,
    name: string,
    value: string,
    params?: EnvironmentVariableCreateParams,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkVariableId(variableId);
    
    return await this.client.variables.updateEnvironmentVariable(
      projectId,
      environmentId,
      variableId,
      name,
      value,
      params
    );
  }

  /**
   * Get details of a specific route in the environment.
   */
  async getRoute(projectId: string, environmentId: string, routeId: string): Promise<Route> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.routes.get(projectId, environmentId, routeId);
  }

  /**
   * List all routes in the environment.
   */
  async listRoutes(projectId: string, environmentId: string): Promise<RouteCollection> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.routes.list(projectId, environmentId);
  }

  /**
   * Create a new route in the environment.
   */
  async createDomain(
    projectId: string, 
    environmentId: string, 
    domainName: string,
    attributes?: Record<string, string>,
    isDefault?: boolean,
    replacementFor?: string
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);   

    if (!domainName) {
      throw new Error('Domain name must be a non-empty string');
    }

    return await this.client.domains.add(projectId, domainName, attributes, isDefault, replacementFor, environmentId);
  }

  /**
   * Delete a domain from the environment.
   */
  async deleteDomain(projectId: string, environmentId: string, domainId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.domains.delete(projectId, domainId, environmentId);
  }

  /**
   * Get details of a specific domain in the environment.
   */
  async getDomain(projectId: string, environmentId: string, domainId: string): Promise<Domain> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.domains.get(projectId, domainId, environmentId);
  }

  /**
   * List all domains in the environment.
   */
  async listDomains(projectId: string, environmentId: string): Promise<Domain[]> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.domains.list(projectId, environmentId);
  }

  /**
   * Update a domain in the environment.
   */
  async updateDomain(
    projectId: string, 
    environmentId: string, 
    domainId: string,
    params?: DomainPatch
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.domains.update(projectId, domainId, params, environmentId);
  }

  /**
   * Get details of a specific deployment on the environment. Deployments represent the process of deploying code 
   * changes to the environment. The deployment details include information about the commit being deployed, the status 
   * of the deployment, and any associated activities or logs.
   */
  async getDeployment(projectId: string, environmentId: string, deploymentId: string): Promise<Deployment> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    if (!deploymentId) {
      throw new Error('Deployment ID must be a non-empty string');
    }

    return await this.deployApi.getProjectsEnvironmentsDeployments({projectId, environmentId, deploymentId});
  }

  /**
   * List all deployments on the environment. Deployments represent the process of deploying code changes to the 
   * environment.
   */
  async listDeployments(projectId: string, environmentId: string): Promise<Deployment[]> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.deployApi.listProjectsEnvironmentsDeployments({projectId, environmentId}); 
  }

  //TODO autoscaling
  // async getAutoscaling(projectId: string, environmentId: string): Promise<AutoscalerSettings> {
  //   TaskBase.checkProjectId(projectId);
  //   TaskBase.checkEnvironmentId(environmentId);

  //   return await this.autoscalingApi.getAutoscalerSettings({
  //     projectId, 
  //     environmentId,
  //   });
  //  }

  // async updateAutoscaling(
  //   projectId: string, 
  //   environmentId: string, 
  //   isEnabled?: boolean,
  //   addresses?: { address: string, permission: string }[],
  //   basicAuth?: { username: string, password: string },
  // ): Promise<AcceptedResponse> {
  //   TaskBase.checkProjectId(projectId);
  //   TaskBase.checkEnvironmentId(environmentId);

  //   return await this.autoscalingApi.patchAutoscalerSettings({
  //     projectId, 
  //     environmentId,
  //     autoscalerSettings: {
  //       services: {
  //         isEnabled,
  //         addresses,
  //         basicAuth,
  //       }
  //     },
  //   });
  // }
}