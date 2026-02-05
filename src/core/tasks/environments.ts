import { UpsunClient } from '../../upsun.js';
import { AutoscalingApi, DeploymentApi, EnvironmentApi, EnvironmentTypeApi } from '../../api/index.js';
import {
  AcceptedResponse,
  AddressGrantsInner,
  AddressGrantsInnerPermissionEnum,
  AutoscalerSettings,
  Deployment,
  Domain,
  Environment,
  EnvironmentActivateInput,
  EnvironmentBranchInput,
  EnvironmentBranchInputTypeEnum,
  EnvironmentCollection,
  EnvironmentMergeInput,
  EnvironmentPatchTypeEnum,
  EnvironmentType,
  EnvironmentVariable,
  Resources2,
  Resources2InitEnum,
  Resources3,
  Resources3InitEnum,
  Resources4,
  Resources4InitEnum,
  Route,
  RouteCollection,
} from '../../model/index.js';
import { TaskBase } from './task_base.js';

export class EnvironmentsTask extends TaskBase {
  private envApi: EnvironmentApi;
  private envTypeApi: EnvironmentTypeApi;
  private deployApi: DeploymentApi;
  private autoscalingApi: AutoscalingApi;

  constructor(protected readonly client: UpsunClient) {
    super(client);

    this.envApi = new EnvironmentApi(this.client.apiConfig);
    this.envTypeApi = new EnvironmentTypeApi(this.client.apiConfig);
    this.deployApi = new DeploymentApi(this.client.apiConfig);
    this.autoscalingApi = new AutoscalingApi(this.client.apiConfig);
  }

  async activate(
    projectId: string, 
    environmentId: string, 
    init: string = Resources2InitEnum.DEFAULT
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.activateEnvironment({
      projectId,
      environmentId: environmentId,
      environmentActivateInput: {
        resources: { init: init } as Resources2,
      } as EnvironmentActivateInput,
    });
  }

  async branch(
    projectId: string, 
    environmentId: string, 
    title: string,
    name: string, 
    cloneParent: boolean = true,
    type: string = EnvironmentBranchInputTypeEnum.DEVELOPMENT,
    init: string = Resources3InitEnum.DEFAULT,
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
      environmentBranchInput: {
        title: title,
        name: name,
        cloneParent: cloneParent,
        type: type,
        resources: { init: init } as Resources3
       } as EnvironmentBranchInput });
  }

  async deactivate(projectId: string, environmentId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    
    return await this.envApi.deactivateEnvironment({ projectId, environmentId: environmentId });
  }

  async delete(projectId: string, environmentId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.deleteEnvironment({ projectId, environmentId: environmentId });
  }

  async get(projectId: string, environmentId: string): Promise<Environment> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.getEnvironment({ 
      projectId: projectId, 
      environmentId: environmentId
    });  
  }

  //TODO remove this one in favor of env.get? 
  async info(projectId: string, environmentId: string): Promise<Environment> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.getEnvironment({ 
      projectId: projectId, 
      environmentId: environmentId
    });
  }

  /**
   * files: Array of [filePath, fileMode, fileContents] where mode is either null, "config" or "secret"
   */
  async initialize(
    projectId: string, 
    environmentId: string,
    profile: string,
    repository: string,
    files: [string, number, string][],
    config: string | null = null,
    init: string = Resources4InitEnum.DEFAULT
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
      projectId: projectId,
      environmentId: environmentId,
      environmentInitializeInput: {
        profile: profile,
        repository: repository,
        config: config,
        resources: { init: init } as Resources4,
        files: files.map(([filePath, fileMode, fileContents]) => ({
          path: filePath,
          contents: fileContents,
          mode: fileMode,
        })),
      },
    });
  }

  async list(projectId: string): Promise<EnvironmentCollection> {
    TaskBase.checkProjectId(projectId);
    
    return await this.envApi.listProjectsEnvironments({ projectId: projectId });
  }

  //TODO implement logs streaming?
  async logs(projectId: string, environmentId: string, app_name: string): Promise<never> {
    throw new Error('Not implemented');
  }

  async merge(projectId: string, environmentId: string, init: string = Resources3InitEnum.DEFAULT): Promise<AcceptedResponse> {
    return await this.envApi.mergeEnvironment({
      projectId: projectId,
      environmentId: environmentId,
      environmentMergeInput: {
        resources: { init: init } as Resources3,
      } as EnvironmentMergeInput,
    });
  }

  async pause(projectId: string, environmentId: string): Promise<AcceptedResponse> {
    return await this.envApi.pauseEnvironment({ projectId: projectId, environmentId: environmentId });
  }

  //TODO implement relationships
  async relationships(projectId: string, environmentId: string): Promise<never> {
    throw new Error('Not implemented');
  }

  async redeploy(projectId: string, environmentId: string): Promise<AcceptedResponse> {
    return await this.envApi.redeployEnvironment({ projectId: projectId, environmentId: environmentId });
  }

  async resume(projectId: string, environmentId: string): Promise<AcceptedResponse> {
    return await this.envApi.resumeEnvironment({ projectId: projectId, environmentId: environmentId });
  }

  async synchronize(
    projectId: string, 
    environmentId: string,
    synchronizeCode: boolean = true,
    rebase: boolean = false,
    synchronizeData: boolean = true,
    synchronizeResources: boolean = true,
  ): Promise<AcceptedResponse> {
    return await this.envApi.synchronizeEnvironment({ 
      projectId: projectId, 
      environmentId: environmentId,
      environmentSynchronizeInput: {
        synchronizeCode: synchronizeCode,
        rebase: rebase,
        synchronizeData: synchronizeData,
        synchronizeResources: synchronizeResources,
      },
    });
  }

  async update(
      projectId: string,
      environmentId: string,
      parent: string | undefined,
      name: string | undefined,
      title: string | undefined,
      attributes: { [key: string]: string; } | undefined,
      type: string = EnvironmentPatchTypeEnum.DEVELOPMENT,
      cloneParentOnCreate: boolean | undefined,
      httpAccess: { 
        isEnabled?: boolean, 
        addresses?: { address: string, permission: string }[], 
        basicAuth?: { username: string, password: string } 
      } | undefined,
      enableSmtp: boolean | undefined,
      restrictRobots: boolean | undefined,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.envApi.updateEnvironment({
        projectId: projectId,
        environmentId: environmentId,
        environmentPatch: {
          name: name,
          title: title,
            parent: parent,
            attributes: attributes,
            type: EnvironmentPatchTypeEnum[type as keyof typeof EnvironmentPatchTypeEnum],
            cloneParentOnCreate: cloneParentOnCreate,
            httpAccess: {
              isEnabled: httpAccess && httpAccess.isEnabled !== undefined ? httpAccess.isEnabled : undefined,
              addresses: httpAccess && httpAccess.addresses
                ? httpAccess.addresses.map(addr => ({
                    address: addr.address,
                    permission: AddressGrantsInnerPermissionEnum[addr.permission as keyof typeof AddressGrantsInnerPermissionEnum],
                  }))
                : undefined,
                basicAuth: httpAccess && httpAccess.basicAuth !== undefined ? httpAccess.basicAuth : undefined,
            },
            enableSmtp: enableSmtp,
            restrictRobots: restrictRobots
        }
    });
  }

  //TODO add activities.activityCancel --> function activityCancel ? 
  //TODO add activities.getActivity --> function getActivities? --> PHP deprecated to rename it to activityGet ? 
  //TODO add activities.list ? 
  //TODO add backups.backup --> backup? 
  //TODO add backups.list --> listBackups?
  //TODO add backups.delete --> deleteBackup?
  //TODO add backups.get --> getBackup?
  //TODO add backups.restore --> restoreBackup?

  //TODO does this function belong to env or project task? same for listTypes
  async getType(projectId: string, environmentTypeId: string): Promise<EnvironmentType> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentTypeId);

    return await this.envTypeApi.getEnvironmentType({ projectId: projectId, environmentTypeId: environmentTypeId });
  }

  async createVariables(
    projectId: string, 
    environmentId: string, 
    name: string,
    value: string,
    attributes?: Record<string, string>,
    isJson?: boolean,
    isSensitive?: boolean,
    visibleBuild?: boolean,
    visibleRuntime?: boolean,
    applicationScope?: string[]
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.variables.createEnvironmentVariable(
      projectId,
      environmentId,
      name,
      value,
      attributes,
      isJson,
      isSensitive,
      visibleBuild,
      visibleRuntime,
      applicationScope,
    );
  }

  async deleteVariable(projectId: string, environmentId: string, variableId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.variables.deleteEnvironmentVariable(projectId, environmentId, variableId);
  }

  async getVariable(projectId: string, environmentId: string, variableId: string): Promise<EnvironmentVariable> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.variables.getEnvironmentVariable(projectId, environmentId, variableId);
  }

  async listVariables(projectId: string, environmentId: string): Promise<EnvironmentVariable[]> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.variables.listEnvironmentVariables(projectId, environmentId);
  }

  async updateVariable(
    projectId: string, 
    environmentId: string,
    variableId: string,
    name: string,
    value: string,
    attributes?: Record<string, string>,
    isJson?: boolean,
    isSensitive?: boolean,
    visibleBuild?: boolean,
    visibleRuntime?: boolean,
    applicationScope?: string[]
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.variables.updateEnvironmentVariable(
      projectId,
      environmentId,
      variableId,
      name,
      value,
      attributes,
      isJson,
      isSensitive,
      visibleBuild,
      visibleRuntime,
      applicationScope,
    );
  }

  async getRoute(projectId: string, environmentId: string, routeId: string): Promise<Route> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.routes.get(projectId, environmentId, routeId);
  }

  async listRoutes(projectId: string, environmentId: string): Promise<RouteCollection> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.routes.list(projectId, environmentId);
  }

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

    return await this.client.domains.add(
      projectId,
      domainName,
      attributes,
      isDefault,
      replacementFor,
      environmentId,
    );
  }

  async deleteDomain(projectId: string, environmentId: string, domainId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.domains.delete(projectId, domainId, environmentId);
  }

  async getDomain(projectId: string, environmentId: string, domainId: string): Promise<Domain> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.domains.get(projectId, domainId, environmentId);
  }

  async listDomains(projectId: string, environmentId: string): Promise<Domain[]> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.domains.list(projectId, environmentId);
  }

  async updateDomain(
    projectId: string, 
    environmentId: string, 
    domainId: string,
    attributes?: Record<string, string>,
    isDefault?: boolean,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.client.domains.update(
      projectId,
      domainId,
      attributes,
      isDefault,
      environmentId,
    );
  }

  async getDeployment(projectId: string, environmentId: string, deploymentId: string): Promise<Deployment> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    if (!deploymentId) {
      throw new Error('Deployment ID must be a non-empty string');
    }

    return await this.deployApi.getProjectsEnvironmentsDeployments({
      projectId, 
      environmentId,
      deploymentId
    });
  }

  async listDeployments(projectId: string, environmentId: string): Promise<Deployment[]> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.deployApi.listProjectsEnvironmentsDeployments({
      projectId, 
      environmentId,
    }); 
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