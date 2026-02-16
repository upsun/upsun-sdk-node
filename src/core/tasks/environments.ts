import { UpsunClient } from '../../upsun.js';
import { DeploymentApi, EnvironmentApi, EnvironmentTypeApi } from '../../api/index.js';
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
  ServiceRelationshipsValue,
} from '../../model/index.js';
import { TaskBase } from './task_base.js';
import { EnvironmentVariableCreateParams } from '../model.js';

export class EnvironmentsTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private envApi: EnvironmentApi,
    private envTypeApi: EnvironmentTypeApi,
    private deployApi: DeploymentApi,
  ) {
    super(client);
  }

  /**
   * Activate an environment. The API will return a 202 Accepted response if the activation request has been accepted,
   * but the client should check the environment's current activities to confirm whether the activation was successful
   * or not.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to activate.
   * @param init - (Optional) The initialization strategy to use when activating the environment. This can be used to
   * specify whether to initialize the environment with code and/or data from the parent environment, and whether to
   * rebase the environment.
   * @return An AcceptedResponse indicating that the activation request has been accepted.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async activate(
    projectId: string,
    environmentId: string,
    init?: string,
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
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to branch from.
   * @param title - The title for the new environment. This is a required parameter and must be a non-empty string.
   * @param name - The name for the new environment. This is a required parameter and must be a non-empty string.
   * The name must be unique within the project and can only contain lowercase letters, numbers, and hyphens.
   * @param cloneParent - Whether to clone the code and data from the parent environment.
   * @returns An AcceptedResponse indicating that the branch request has been accepted.
   * @throws An error if the project ID or environment ID is invalid, if the title or name is missing or invalid,
   * or if there is an issue with the API request.
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
      environmentBranchInput: { title, name, cloneParent, type, resources: { init } },
    });
  }

  /**
   * Deactivate an environment. The API will return a 202 Accepted response if the deactivation request has been
   * accepted, but the client should check the environment's current activities to confirm whether the deactivation was
   * successful or not.
   * @param projectId the ID of the project.
   * @param environmentId the ID of the environment to deactivate.
   * @return An AcceptedResponse indicating that the deactivation request has been accepted.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
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
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to delete.
   * @return An AcceptedResponse indicating that the delete request has been accepted.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async delete(projectId: string, environmentId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.deleteEnvironment({ projectId, environmentId });
  }

  /**
   * Update the HTTP access permissions for the environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to update the HTTP access permissions for.
   * @param httpAccess - The HTTP access permissions to set for the environment.
   * @return An AcceptedResponse indicating that the update request has been accepted.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async httpAccess(
    projectId: string,
    environmentId: string,
    httpAccess: HttpAccessPermissions2,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return this.update(projectId, environmentId, { httpAccess });
  }

  /**
   * Get details of a specific environment. The details include information about the environment's current status.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to retrieve details for.
   * @return The details of the specified environment.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async get(projectId: string, environmentId: string): Promise<Environment> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.getEnvironment({ projectId, environmentId });
  }

  /**
   * Get or Update details of the environment. If params are provided, the environment will be updated with the
   * specified parameters before returning the details.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to retrieve or update details for.
   * @param params - (Optional) The parameters to update for the environment. If not provided, the environment will not
   * be updated and the current details will be returned.
   * @return The details of the specified environment after applying any updates if params were provided.
   * @throws An error if the project ID or environment ID is invalid, if there is an issue with the API request, or if
   * the update request was provided but failed.
   */
  async info(
    projectId: string,
    environmentId: string,
    params?: EnvironmentPatch,
  ): Promise<Environment> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    if (params) {
      await this.update(projectId, environmentId, params);
    }

    return await this.get(projectId, environmentId);
  }

  /**
   * Initialize the environment by deploying code from a specified repository and profile, with optional configuration
   * and initialization parameters.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to initialize.
   * @param profile - The profile to use for initialization.
   * @param repository - The repository to use for initialization. This should be in the format "owner/repo" for
   * GitHub repositories.
   * @param files - An array of files to include in the initialization. Each file should be represented as a tuple of
   * [filePath, fileMode, fileContents], where filePath is the path to the file in the environment, fileMode is the
   * file mode (e.g., "100644" for regular files), and fileContents is the content of the file as a string.
   * @param config - (Optional) Additional configuration to use for initialization. This can be used to specify
   * environment variables, routes, and other settings to apply during initialization.
   * @param init - (Optional) The initialization strategy to use when initializing the environment. This can be used to
   * specify whether to initialize the environment with code and/or data from the parent environment, and whether to
   * rebase the environment.
   * @return An AcceptedResponse indicating that the initialization request has been accepted.
   * @throws An error if the project ID or environment ID is invalid, if the profile or repository is missing or
   * invalid, if the files array is empty or contains invalid entries, or if there is an issue with the API request.
   */
  async init(
    projectId: string,
    environmentId: string,
    profile: string,
    repository: string,
    files: FilesInner[],
    config?: string,
    init: Resources4InitEnum = Resources4InitEnum.DEFAULT,
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
      environmentInitializeInput: {
        profile,
        repository,
        config: config || null,
        resources: { init },
        files,
      },
    });
  }

  /**
   * List all environments in a project.
   * @param projectId - The ID of the project.
   * @return A list of environments in the specified project.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async list(projectId: string): Promise<Environment[]> {
    TaskBase.checkProjectId(projectId);

    return await this.envApi.listProjectsEnvironments({ projectId: projectId });
  }

  //TODO implement logs streaming?
  async logs(projectId: string, environmentId: string, app_name: string): Promise<never> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    throw new Error('Not implemented yet');
  }

  /**
   * Merge the environment with its parent. The merge will be best-effort and may not succeed if the environment is
   * currently undergoing another activity such as deployment, merging, etc.
   * The API will return a 202 Accepted response if the merge request has been accepted, but the client should check
   * the environment's current activities to confirm whether the merge was successful or not.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to merge.
   * @param init - (Optional) The initialization strategy to use when merging the environment. This can be used to
   * specify whether to initialize the environment with code and/or data from the parent environment, and whether to
   * rebase the environment.
   * @return An AcceptedResponse indicating that the merge request has been accepted.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async merge(
    projectId: string,
    environmentId: string,
    init: Resources5InitEnum = Resources5InitEnum.DEFAULT,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.mergeEnvironment({
      projectId: projectId,
      environmentId: environmentId,
      environmentMergeInput: { resources: { init: init } },
    });
  }

  /**
   * Pause the environment. The API will return a 202 Accepted response if the pause request has been accepted,
   * but the client should check the environment's current activities to confirm whether the pause action was successful
   * or not.
   * @param projectId the ID of the project.
   * @param environmentId the ID of the environment to pause.
   * @return An AcceptedResponse indicating that the pause request has been accepted.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
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
   * @param projectId the ID of the project.
   * @param environmentId the ID of the environment to redeploy.
   * @return An AcceptedResponse indicating that the redeploy request has been accepted.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async redeploy(projectId: string, environmentId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.redeployEnvironment({ projectId, environmentId });
  }

  /**
   * Get the relationships of an environment, which include the linked applications or services.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to get relationships for.
   * @param appId - The ID of the application to get relationships for. This is used to filter the relationships to only
   * include those that are relevant to the specified application.
   * @return The relationships of the environment for the specified application.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async relationships(
    projectId: string,
    environmentId: string,
    appId: string,
  ): Promise<{ [key: string]: ServiceRelationshipsValue }> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    const appConfig = await this.client.applications.configGet(projectId, environmentId, appId);

    return appConfig.relationships;
  }

  /**
   * Resume an environment that is currently paused. The API will return a 202 Accepted response if the resume request
   * has been accepted, but the client should check the environment's current activities to confirm whether the resume
   * action was successful or not.
   * @param projectId the ID of the project.
   * @param environmentId the ID of the environment to resume.
   * @return An AcceptedResponse indicating that the resume request has been accepted.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
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
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to synchronize.
   * @param synchronizeCode Whether to synchronize the code from the parent environment. If false, the environment's
   * code will not be changed during synchronization.
   * @param rebase Whether to rebase the environment's code on top of the parent environment's code. If false, the
   * environment's code will not be rebased.
   * @param synchronizeData Whether to synchronize the data from the parent environment. If false, the environment's
   * data will not be changed during synchronization.
   * @param synchronizeResources Whether to synchronize the resources from the parent environment. If false, the
   * environment's resources will not be changed during synchronization.
   * @return An AcceptedResponse indicating that the synchronization request has been accepted.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
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
      environmentSynchronizeInput: {
        synchronizeCode,
        rebase,
        synchronizeData,
        synchronizeResources,
      },
    });
  }

  /**
   * Update the environment with the specified parameters.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to update.
   * @param params - The parameters to update for the environment. This can include changes to the environment's title,
   * description, HTTP access permissions, and other settings.
   * @return An AcceptedResponse indicating that the update request has been accepted.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async update(
    projectId: string,
    environmentId: string,
    params?: EnvironmentPatch,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.updateEnvironment({
      projectId,
      environmentId,
      environmentPatch: params || {},
    });
  }

  /**
   * Cancel an ongoing activity on the environment, such as deployment, synchronization, etc.
   * The cancellation will be best-effort and may not succeed if the activity is too close to completion.
   * The API will return a 202 Accepted response if the cancellation request has been accepted,
   * but the client should check the environment's current activities to confirm whether the cancellation was successful
   * or not.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to cancel the activity on.
   * @param activityId - The ID of the activity to cancel.
   * @return An AcceptedResponse indicating that the cancellation request has been accepted.
   * @throws An error if the project ID, environment ID, or activity ID is invalid, or if there is an issue with the
   * API request.
   */
  async activityCancel(
    projectId: string,
    environmentId: string,
    activityId: string,
  ): Promise<AcceptedResponse> {
    return await this.client.activities.cancel(projectId, activityId, environmentId);
  }

  /**
   * Get details of a specific activity on the environment, such as deployment, synchronization, etc.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to get the activity details for.
   * @param activityId - The ID of the activity to get details for.
   * @return The details of the specified activity.
   * @throws An error if the project ID, environment ID, or activity ID is invalid, or if there is an issue with the
   * API request.
   */
  async getActivity(
    projectId: string,
    environmentId: string,
    activityId: string,
  ): Promise<Activity> {
    return await this.client.activities.get(projectId, activityId, environmentId);
  }

  /**
   * List all activities on the environment, such as deployments, synchronizations, etc.
   * @param projectId - the ID of the project.
   * @param environmentId - the ID of the environment to list activities for.
   * @return A list of activities on the specified environment.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async listActivities(projectId: string, environmentId: string): Promise<Activity[]> {
    return await this.client.activities.list(projectId, environmentId);
  }

  /**
   * Trigger a backup of the environment. The backup will be created asynchronously, and the API will return
   * a 202 Accepted response if the backup request has been accepted. The client can then check the list of backups to
   * monitor the progress and confirm when the backup is completed.
   * The isSafe parameter is a best-effort attempt to create a backup without causing disruption to the environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to back up.
   * @param isSafe - Whether to attempt a safe backup that minimizes disruption to the environment. This is a
   * best-effort attempt.
   * @return An AcceptedResponse indicating that the backup request has been accepted.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async backup(
    projectId: string,
    environmentId: string,
    isSafe?: boolean,
  ): Promise<AcceptedResponse> {
    return await this.client.backups.create(projectId, environmentId, isSafe);
  }

  /**
   * List all backups of the environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to list backups for.
   * @return A list of backups for the specified environment.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async listBackups(projectId: string, environmentId: string): Promise<Backup[]> {
    return await this.client.backups.list(projectId, environmentId);
  }

  /**
   * Delete a specific backup of the environment. The deletion will be best-effort and may not succeed if the backup is
   * currently being created or restored.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment that the backup belongs to.
   * @param backupId - The ID of the backup to delete.
   * @return An AcceptedResponse indicating that the delete request has been accepted.
   * @throws An error if the project ID, environment ID, or backup ID is invalid, or if there is an issue with the API
   * request.
   */
  async deleteBackup(
    projectId: string,
    environmentId: string,
    backupId: string,
  ): Promise<AcceptedResponse> {
    return await this.client.backups.delete(projectId, environmentId, backupId);
  }

  /**
   * Get details of a specific backup of the environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment that the backup belongs to.
   * @param backupId - The ID of the backup to get details for.
   * @return The details of the specified backup.
   * @throws An error if the project ID, environment ID, or backup ID is invalid, or if there is an issue with the API
   * request.
   */
  async getBackup(projectId: string, environmentId: string, backupId: string): Promise<Backup> {
    return await this.client.backups.get(projectId, environmentId, backupId);
  }

  /**
   * Restore the environment from a specific backup.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to restore.
   * @param backupId - The ID of the backup to restore from.
   * @param restoreCode - Whether to restore the code from the backup. If false, only the data and resources will be
   * restored, and the environment's code will not be changed.
   * @param restoreResources - Whether to restore the resources from the backup. If false, only the code and data will
   * be restored, and the environment's resources will not be changed.
   * @param environmentName - (Optional) The name for the new environment created from the backup. If not provided, the
   * restored environment will keep the same name as before.
   * @param branchFrom - (Optional) The ID of the environment to branch from when restoring. If provided, the restored
   * environment will be created as a new branch from the specified environment instead of replacing the existing
   * environment. This can be used to keep the existing environment intact while creating a new environment from the
   * backup.
   * @param init - (Optional) The initialization strategy to use when restoring the environment. This can be used to
   * specify whether to initialize the environment with code and/or data from the backup, and whether to rebase the
   * environment.
   * @return An AcceptedResponse indicating that the restore request has been accepted.
   * @throws An error if the project ID, environment ID, or backup ID is invalid, or if there is an issue with the API
   * request.
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
    return await this.client.backups.restore(
      projectId,
      environmentId,
      backupId,
      restoreCode,
      restoreResources,
      environmentName,
      branchFrom,
      init,
    );
  }

  /**
   * Get details of a specific environment type, such as development, production, etc.
   * @param projectId - The ID of the project.
   * @param environmentTypeId - The ID of the environment type to get details for.
   * @return The details of the specified environment type.
   * @throws An error if the project ID or environment type ID is invalid, or if there is an issue with the API request.
   */
  async getType(projectId: string, environmentTypeId: string): Promise<EnvironmentType> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentTypeId);

    return await this.envTypeApi.getEnvironmentType({
      projectId: projectId,
      environmentTypeId: environmentTypeId,
    });
  }

  /**
   * Create an environment variable in the environment. Environment variables are used to store configuration values
   * that can be accessed by the applications running in the environment. The name of the variable must be unique within
   * the environment. If a variable with the same name already exists, the API will return an error.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to create the variable in.
   * @param name - The name of the environment variable. This must be a non-empty string and unique within the
   * environment.
   * @param value - The value of the environment variable. This can be any string.
   * @param params - (Optional) Additional parameters for creating the environment variable, such as whether the
   * variable is secret or not.
   * @return An AcceptedResponse indicating that the create variable request has been accepted.
   * @throws An error if the project ID or environment ID is invalid, if the name is missing or invalid, if a variable
   * with the same name already exists in the environment, or if there is an issue with the API request.
   */
  async createVariable(
    projectId: string,
    environmentId: string,
    name: string,
    value: string,
    params?: EnvironmentVariableCreateParams,
  ): Promise<AcceptedResponse> {
    return await this.client.variables.createEnvironmentVariable(
      projectId,
      environmentId,
      name,
      value,
      params,
    );
  }

  /**
   * Delete an environment variable from the environment. The API will return an error if the variable does not exist.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to delete the variable from.
   * @param variableId - The ID of the environment variable to delete.
   * @return An AcceptedResponse indicating that the delete variable request has been accepted.
   * @throws An error if the project ID, environment ID, or variable ID is invalid, if the variable does not exist in
   * the environment, or if there is an issue with the API request.
   */
  async deleteVariable(
    projectId: string,
    environmentId: string,
    variableId: string,
  ): Promise<AcceptedResponse> {
    return await this.client.variables.deleteEnvironmentVariable(
      projectId,
      environmentId,
      variableId,
    );
  }

  /**
   * Get details of a specific environment variable in the environment.
   * The API will return an error if the variable does not exist.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to get the variable details from.
   * @param variableId - The ID of the environment variable to get details for.
   * @return The details of the specified environment variable.
   * @throws An error if the project ID, environment ID, or variable ID is invalid, if the variable does not exist in
   * the environment, or if there is an issue with the API request.
   */
  async getVariable(
    projectId: string,
    environmentId: string,
    variableId: string,
  ): Promise<EnvironmentVariable> {
    return await this.client.variables.getEnvironmentVariable(projectId, environmentId, variableId);
  }

  /**
   * List all environment variables in the environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to list variables for.
   * @return A list of environment variables in the specified environment.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async listVariables(projectId: string, environmentId: string): Promise<EnvironmentVariable[]> {
    return await this.client.variables.listEnvironmentVariables(projectId, environmentId);
  }

  /**
   * Update an environment variable in the environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to update the variable in.
   * @param variableId - The ID of the environment variable to update.
   * @param name - The new name for the environment variable. This must be a non-empty string and unique within the
   * environment. If a variable with the same name already exists, the API will return an error.
   * @param value - The new value for the environment variable. This can be any string.
   * @param params - (Optional) Additional parameters for updating the environment variable, such as whether the
   * variable is secret or not.
   * @return An AcceptedResponse indicating that the update variable request has been accepted.
   * @throws An error if the project ID, environment ID, or variable ID is invalid, if the name is missing or invalid,
   * if a variable with the same name already exists in the environment, if the variable to update does not exist in the
   * environment, or if there is an issue with the API request.
   */
  async updateVariable(
    projectId: string,
    environmentId: string,
    variableId: string,
    name: string,
    value: string,
    params?: EnvironmentVariableCreateParams,
  ): Promise<AcceptedResponse> {
    return await this.client.variables.updateEnvironmentVariable(
      projectId,
      environmentId,
      variableId,
      name,
      value,
      params,
    );
  }

  /**
   * Get details of a specific route in the environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to get the route details from.
   * @param routeId - The ID of the route to get details for.
   * @return The details of the specified route.
   * @throws An error if the project ID, environment ID, or route ID is invalid, if the route does not exist in
   * the environment, or if there is an issue with the API request.
   */
  async getRoute(projectId: string, environmentId: string, routeId: string): Promise<Route> {
    return await this.client.routes.get(projectId, environmentId, routeId);
  }

  /**
   * List all routes in the environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to list routes for.
   * @return A list of routes in the specified environment.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async listRoutes(projectId: string, environmentId: string): Promise<RouteCollection> {
    return await this.client.routes.list(projectId, environmentId);
  }

  /**
   * Create a new route in the environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to create the route in.
   * @param path - The path for the route. This should be a valid URL path (e.g., "/api").
   * @param destination - The destination for the route. This should specify where traffic matching the route's path
   * should be directed to (e.g., a specific application or service in the environment).
   * @param isDefault - Whether this route should be the default route for the environment. If true, this route will
   * be used to handle any traffic that does not match any other routes in the environment.
   * @return An AcceptedResponse indicating that the create route request has been accepted.
   * @throws An error if the project ID or environment ID is invalid, if the path or destination is missing or invalid,
   * if a route with the same path already exists in the environment, or if there is an issue with the API request.
   */
  async createDomain(
    projectId: string,
    environmentId: string,
    domainName: string,
    attributes?: Record<string, string>,
    isDefault?: boolean,
    replacementFor?: string,
  ): Promise<AcceptedResponse> {
    return await this.client.domains.add(
      projectId,
      domainName,
      attributes,
      isDefault,
      replacementFor,
      environmentId,
    );
  }

  /**
   * Delete a domain from the environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to delete the domain from.
   * @param domainId - The ID of the domain to delete.
   * @return An AcceptedResponse indicating that the delete domain request has been accepted.
   * @throws An error if the project ID, environment ID, or domain ID is invalid, if the domain does not exist in
   * the environment, or if there is an issue with the API request.
   */
  async deleteDomain(
    projectId: string,
    environmentId: string,
    domainId: string,
  ): Promise<AcceptedResponse> {
    return await this.client.domains.delete(projectId, domainId, environmentId);
  }

  /**
   * Get details of a specific domain in the environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to get the domain details from.
   * @param domainId - The ID of the domain to get details for.
   * @return The details of the specified domain.
   * @throws An error if the project ID, environment ID, or domain ID is invalid, if the domain does not exist in
   * the environment, or if there is an issue with the API request.
   */
  async getDomain(projectId: string, environmentId: string, domainId: string): Promise<Domain> {
    return await this.client.domains.get(projectId, domainId, environmentId);
  }

  /**
   * List all domains in the environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to list domains for.
   * @return A list of domains in the specified environment.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async listDomains(projectId: string, environmentId: string): Promise<Domain[]> {
    return await this.client.domains.list(projectId, environmentId);
  }

  /**
   * Update a domain in the environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to update the domain in.
   * @param domainId - The ID of the domain to update.
   * @param params - The parameters to update for the domain, such as the domain's attributes, whether it is the default
   * domain, etc.
   * @return An AcceptedResponse indicating that the update domain request has been accepted.
   * @throws An error if the project ID, environment ID, or domain ID is invalid, if the domain to update does not exist
   * in the environment, or if there is an issue with the API request.
   */
  async updateDomain(
    projectId: string,
    environmentId: string,
    domainId: string,
    params?: DomainPatch,
  ): Promise<AcceptedResponse> {
    return await this.client.domains.update(projectId, domainId, params, environmentId);
  }

  /**
   * Get details of a specific deployment on the environment. Deployments represent the process of deploying code
   * changes to the environment. The deployment details include information about the commit being deployed, the status
   * of the deployment, and any associated activities or logs.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to get the deployment details from.
   * @param deploymentId - The ID of the deployment to get details for.
   * @return The details of the specified deployment.
   * @throws An error if the project ID, environment ID, or deployment ID is invalid, if the deployment does not exist
   * on the environment, or if there is an issue with the API request.
   */
  async getDeployment(
    projectId: string,
    environmentId: string,
    deploymentId: string,
  ): Promise<Deployment> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkDeploymentId(deploymentId);

    return await this.deployApi.getProjectsEnvironmentsDeployments({
      projectId,
      environmentId,
      deploymentId,
    });
  }

  /**
   * List all deployments on the environment. Deployments represent the process of deploying code changes to the
   * environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to list deployments for.
   * @return A list of deployments on the specified environment.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async listDeployments(projectId: string, environmentId: string): Promise<Deployment[]> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.deployApi.listProjectsEnvironmentsDeployments({ projectId, environmentId });
  }
}
