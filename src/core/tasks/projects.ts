import { UpsunClient } from '../../upsun.js';
import { 
  DeploymentTargetApi,
  ListOrgProjectsRequest,
  ListProjectTeamAccessRequest, 
  ListTeamProjectAccessRequest, 
  OrganizationProjectsApi, 
  OrganizationsApi, 
  ProjectApi, 
  ProjectSettingsApi, 
  RepositoryApi, 
  SubscriptionsApi, 
  SystemInformationApi, 
  ThirdPartyIntegrationsApi
} from '../../api/index.js';
import {
  AcceptedResponse,
  Activity,
  CanCreateNewOrgSubscription200Response,
  DedicatedDeploymentTargetCreateInputTypeEnum,
  DeploymentTarget,
  DeploymentTargetCollection,
  EnvironmentVariableCreateInput,
  Project,
  ProjectCapabilities,
  ProjectPatch,
  ProjectSettings,
  ProjectVariable,
  Subscription,
  Blob,
  Commit,
  Ref,
  Tree,
  SystemInformation,
  IntegrationCreateInput,
  IntegrationCollection,
  Integration,
  Domain,
  Certificate,
  TeamProjectAccess,
  GrantProjectTeamAccessRequestInner,
  GrantTeamProjectAccessRequestInner,
  ListProjectTeamAccess200Response,
  CreateOrgSubscriptionRequest,
  DomainPatch,
  UserProjectAccess,
  GrantProjectUserAccessRequestInner,
  ListProjectUserAccess200Response,
  Environment,
  ProjectInvitation,
  ListOrgProjects200Response
} from '../../model/index.js';
import { TaskBase } from './task_base.js';
import { 
  CertificateCreateParams, 
  CreateProjectInvite, 
  FilterListOrgProjects, 
  IntegrationCreateData, 
  ProjectCreateRequest 
} from '../model.js';
import { FilterListProjectUserAccess } from '../index.js';

export class ProjectsTask extends TaskBase {
  
  constructor(
    protected readonly client: UpsunClient,
    private prjApi: ProjectApi,
    private orgPrjApi: OrganizationProjectsApi,
    private subApi: SubscriptionsApi,
    private settingsApi: ProjectSettingsApi,
    private deploymentTargetApi: DeploymentTargetApi,
    private repositoryApi: RepositoryApi,
    private systemInfoApi: SystemInformationApi,
    private thirdPartyIntegrationsApi: ThirdPartyIntegrationsApi,
  ) {
    super(client);
  }

  /**
   * Clears the build cache for a project.
   */
  async clearBuildCache(projectId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);

    return await this.prjApi.actionProjectsClearBuildCache({ projectId });
  }

  /**
   * Creates a new project subscription under the specified organization with the given parameters.
   */
  async create(
    organizationId: string,
    projectRegion: string,
    params?: ProjectCreateRequest
  ): Promise<Subscription> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkProjectRegion(projectRegion);

    return await this.subApi.createOrgSubscription({
      organizationId,
      createOrgSubscriptionRequest: {projectRegion, ...params},
    });
  }

  async canCreate(organizationId: string): Promise<CanCreateNewOrgSubscription200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.subApi.canCreateNewOrgSubscription({ organizationId });
  }

  async delete(projectId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    
    const project = await this.prjApi.getProjects({ projectId });
    //TODO Why not using Project.subscription.id directly? FHK: Because it's empty 
    const subscriptionId = TaskBase.extractSubscriptionId(project.subscription.licenseUri);
    TaskBase.checkSubscriptionId(subscriptionId);

    return await this.subApi.deleteOrgSubscription({ organizationId: project.organization as string, subscriptionId });
  }

  async info(projectId: string,params?: ProjectPatch): Promise<Project> {
    TaskBase.checkProjectId(projectId);

    if(params && Object.keys(params).length > 0) {
      return await this.update(projectId, params);
    } else {
      return await this.prjApi.getProjects({ projectId });
    }
  }

  async get(projectId: string): Promise<Project> {
    TaskBase.checkProjectId(projectId);

    return await this.prjApi.getProjects({ projectId });
  }

  async update(projectId: string, params: ProjectPatch): Promise<Project> {
    TaskBase.checkProjectId(projectId);

    await this.prjApi.updateProjects({ projectId, projectPatch: params });
    return await this.get(projectId);
  }

  async list(organizationId: string, filters?: FilterListOrgProjects): Promise<ListOrgProjects200Response> {
    TaskBase.checkOrganizationId(organizationId);
    
    return await this.orgPrjApi.listOrgProjects({ organizationId, ...filters });
  }

  // Add more project-related methods as needed
  async getSubscription(organizationId: string, subscriptionId: string): Promise<Subscription> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkSubscriptionId(subscriptionId);

    return await this.subApi.getOrgSubscription({ organizationId, subscriptionId });
  }

  async getCapabilities(projectId: string): Promise<ProjectCapabilities> {
    TaskBase.checkProjectId(projectId);

    return await this.prjApi.getProjectsCapabilities({ projectId });
  }
 
  async cancelInvite(projectId: string, inviteId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkInviteId(inviteId);

    await this.client.invitations.cancelProjectInvite(projectId, inviteId);
  }

  async createInvite(projectId: string, email: string, params: CreateProjectInvite): Promise<ProjectInvitation> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEmail(email);
    
    return await this.client.invitations.createProjectInvite( projectId, email, params);
  }

  async listInvites(projectId: string): Promise<ProjectInvitation[]> {
    TaskBase.checkProjectId(projectId);
    
    return await this.client.invitations.listProjectInvites(projectId);
  }

  async getSettings(projectId: string): Promise<ProjectSettings> {
    TaskBase.checkProjectId(projectId);

    return await this.settingsApi.getProjectsSettings({ projectId });
  }

  async updateSettings(projectId: string, settings: ProjectSettings): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);

    return await this.settingsApi.updateProjectsSettings({ projectId, projectSettingsPatch: settings });
  }

  async createVariable(
    projectId: string, 
    name: string, 
    value: string, 
    params?: EnvironmentVariableCreateInput
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);

    return await this.client.variables.createProjectVariable(projectId, name, value, params);
  }

  async getVariable(projectId: string, variableId: string): Promise<ProjectVariable> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkVariableId(variableId);

    return await this.client.variables.getProjectVariable(projectId, variableId);
  }

  async deleteVariable(projectId: string, variableId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkVariableId(variableId);

    return await this.client.variables.deleteProjectVariable(projectId, variableId);
  }

   async listVariables(projectId: string): Promise<ProjectVariable[]> {
    TaskBase.checkProjectId(projectId);

    return await this.client.variables.listProjectVariables(projectId);
  }

  async updateVariable(
    projectId: string, 
    variableId: string, 
    params?: EnvironmentVariableCreateInput
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkVariableId(variableId);

    return await this.client.variables.updateProjectVariable(projectId, variableId, params);
  }

  async listActivities(projectId: string): Promise<Activity[]> {
    TaskBase.checkProjectId(projectId);

    return await this.client.activities.list(projectId);
  }

  async getActivity(projectId: string, activityId: string): Promise<Activity> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkActivityId(activityId);

    return await this.client.activities.get(projectId, activityId);
  }

  // //TODO(@micka) do we expose it? seems that it's not public endpoint
  // async createDeployment(
  //   projectId: string,
  //   type: DedicatedDeploymentTargetCreateInputTypeEnum,
  //   name: string,
  //   enforcedMounts?: object
  // ): Promise<AcceptedResponse> {
  //   TaskBase.checkProjectId(projectId);

  //   return await this.deploymentTargetApi.createProjectsDeployments({
  //     projectId,
  //     deploymentTargetCreateInput: {type, name, enforcedMounts}
  //   });
  // }

  // async deleteDeployment(projectId: string, deploymentId: string): Promise<AcceptedResponse> {
  //   TaskBase.checkProjectId(projectId);
  //   TaskBase.checkDeploymentId(deploymentId);

  //   return await this.deploymentTargetApi.deleteProjectsDeployments({ 
  //     projectId, 
  //     deploymentTargetConfigurationId: deploymentId 
  //   });
  // }

  // async getDeployment(projectId: string, deploymentId: string): Promise<DeploymentTarget> {
  //   TaskBase.checkProjectId(projectId);
  //   TaskBase.checkDeploymentId(deploymentId);

  //   return await this.deploymentTargetApi.getProjectsDeployments({ 
  //     projectId, 
  //     deploymentTargetConfigurationId: deploymentId 
  //    });
  // }

  // async listDeployments(projectId: string): Promise<DeploymentTargetCollection> {
  //   TaskBase.checkProjectId(projectId);

  //   return await this.deploymentTargetApi.listProjectsDeployments({ projectId });
  // }

  // async updateDeployment(
  //   projectId: string, 
  //   deploymentId: string,
  //   type: DedicatedDeploymentTargetCreateInputTypeEnum,
  //   name: string,
  //   enforcedMounts?: object  
  // ): Promise<AcceptedResponse> {
  //   TaskBase.checkProjectId(projectId);
  //   TaskBase.checkDeploymentId(deploymentId);

  //   return await this.deploymentTargetApi.updateProjectsDeployments({ 
  //     projectId, 
  //     deploymentTargetConfigurationId: deploymentId, 
  //     deploymentTargetPatch: { type, name, enforcedMounts }
  //   });
  // }

  //TODO move them into a dedicated RepositoryTask
  async getGitBlob(projectId: string, repositoryBlobId: string): Promise<Blob> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkRepositoryBlobId(repositoryBlobId);

    return await this.repositoryApi.getProjectsGitBlobs({ projectId, repositoryBlobId });
  }
  
  async getGitCommit(projectId: string, repositoryCommitId: string): Promise<Commit> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkRepositoryCommitId(repositoryCommitId);

    return await this.repositoryApi.getProjectsGitCommits({ projectId, repositoryCommitId });
  }

  /**
   * Get a Git reference (e.g., branch or tag) by its ID in the specified project.
   * @param projectId 
   * @param repositoryRefId Id of the Git reference to retrieve 
   *        (e.g., "heads/main" for the main branch or "tags/v1.0" for a tag).
   * @returns
   */
  async getGitRef(projectId: string, repositoryRefId: string): Promise<Ref> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkRepositoryRefId(repositoryRefId);
    
    return await this.repositoryApi.getProjectsGitRefs({ projectId, repositoryRefId });
  }

  async listGitRefs(projectId: string): Promise<Ref[]> {
    TaskBase.checkProjectId(projectId);

    return await this.repositoryApi.listProjectsGitRefs({ projectId });
  }

  async getGitTree(projectId: string, repositoryTreeId: string): Promise<Tree> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkRepositoryTreeId(repositoryTreeId);

    return await this.repositoryApi.getProjectsGitTrees({ projectId, repositoryTreeId });
  }

  //TODO internal
  // async restartGitServer(projectId: string): Promise<AcceptedResponse> {
  //   TaskBase.checkProjectId(projectId);

  //   return await this.systemInfoApi.actionProjectsSystemRestart({ projectId });
  // }

  async getGitInfo(projectId: string): Promise<SystemInformation> {
    TaskBase.checkProjectId(projectId);

    return await this.systemInfoApi.getProjectsSystem({ projectId });
  }

  //TODO move them into a dedicated IntegrationTask
  async createIntegration(
    projectId: string, 
    type: string,
    params: IntegrationCreateData
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    
    if(!type) {
      throw new Error('Integration type is required');
    }

    return await this.thirdPartyIntegrationsApi.createProjectsIntegrations({ 
      projectId, 
      integrationCreateInput: { type, ...params }
    }); 
  }

  async deleteIntegration(projectId: string, integrationId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkIntegrationId(integrationId);

    return await this.thirdPartyIntegrationsApi.deleteProjectsIntegrations({ 
      projectId, 
      integrationId 
    });
  }

  async listIntegrations(projectId: string): Promise<IntegrationCollection> {
    TaskBase.checkProjectId(projectId);

    return await this.thirdPartyIntegrationsApi.listProjectsIntegrations({ projectId });
  }

  async getIntegration(projectId: string, integrationId: string): Promise<Integration> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkIntegrationId(integrationId);

    return await this.thirdPartyIntegrationsApi.getProjectsIntegrations({ 
      projectId, 
      integrationId 
    });
  }

  async updateIntegration(
    projectId: string,
    integrationId: string,
    type: string,
    params: IntegrationCreateData
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkIntegrationId(integrationId);
    
    if(!type) {
      throw new Error('Integration type is required');
    }

    return await this.thirdPartyIntegrationsApi.updateProjectsIntegrations({ 
      projectId, 
      integrationId, 
      integrationPatch: { type, ...params }
    }); 
  }

  async addDomain(
    projectId: string, 
    domainName: string,
    attributes?: { [key: string]: string },
    isDefault?: boolean,
    replacementFor?: string,
  ): Promise<AcceptedResponse> {
    return await this.client.domains.add( projectId, domainName, attributes, isDefault, replacementFor);
  }
   
  async deleteDomain(projectId: string, domainId: string): Promise<AcceptedResponse> {
    return await this.client.domains.delete(projectId, domainId);
  }

  async getDomain(projectId: string, domainId: string): Promise<Domain> {
    return await this.client.domains.get(projectId, domainId);
  }

  async listDomains(projectId: string): Promise<Domain[]> {
    return await this.client.domains.list(projectId);
  }

  async updateDomain(
    projectId: string, 
    domainId: string, 
    params?: DomainPatch
  ): Promise<AcceptedResponse> {
    return await this.client.domains.update(projectId, domainId, params);
  }

  async addCertificate(
    projectId: string,
    certificate: string,
    key: string,
    params?: CertificateCreateParams
  ): Promise<AcceptedResponse> {
    return await this.client.certificates.add(projectId, certificate, key, params);
  }

  async deleteCertificate(projectId: string, certificateId: string): Promise<AcceptedResponse> {
    return await this.client.certificates.delete(projectId, certificateId);
  }

  async getCertificate(projectId: string, certificateId: string): Promise<Certificate> {
    return await this.client.certificates.get(projectId, certificateId);
  }

  async listCertificates(projectId: string): Promise<Certificate[]> {
    return await this.client.certificates.list(projectId);
  }

  async getTeamProjectAccessByProject(projectId: string, teamId: string): Promise<TeamProjectAccess> {
    return await this.client.teams.getTeamProjectAccessByProject(projectId, teamId);
  }

  async getTeamProjectAccessByTeam(teamId: string, projectId: string): Promise<TeamProjectAccess> {
    return await this.client.teams.getTeamProjectAccessByTeam(teamId, projectId);
  }

  async grantTeamProjectAccessToProject(
    projectId: string, 
    access: Array<GrantProjectTeamAccessRequestInner>
  ): Promise<void> {
    return await this.client.teams.grantTeamProjectAccessToProject(projectId, access);
  }

  async grantTeamProjectAccessToTeam(teamId: string, access: Array<GrantTeamProjectAccessRequestInner>): Promise<void> {
    return await this.client.teams.grantTeamProjectAccessToTeam(teamId, access);
  }

  async listTeamProjectAccessByProject(
    projectId: string, 
    params: ListProjectTeamAccessRequest
  ): Promise<ListProjectTeamAccess200Response> {
    return await this.client.teams.listTeamProjectAccessByProject(projectId, params);
  }

  async listTeamProjectAccessByTeam(
    teamId: string, 
    params: ListTeamProjectAccessRequest
  ): Promise<ListProjectTeamAccess200Response> {
    return await this.client.teams.listTeamProjectAccessByTeam(teamId, params);
  }
  
  async revokeTeamProjectAccessByProject(projectId: string, teamId: string): Promise<void> {
    return await this.client.teams.revokeTeamProjectAccessByProject(projectId, teamId);
  }

  async revokeTeamProjectAccessByTeam(teamId: string, projectId: string): Promise<void> {
    return await this.client.teams.revokeTeamProjectAccessByTeam(teamId, projectId);
  }

  async getUserProjectAccessByProject(projectId: string, userId: string): Promise<UserProjectAccess> {
    return await this.client.users.getUserProjectAccessByProject(projectId, userId);
  }

  async grantUserProjectAccessByProject(projectId: string, access: Array<GrantProjectUserAccessRequestInner>): Promise<void> {
    return await this.client.users.grantUserProjectAccessByProject(projectId, access);
  }

  async revokeUserProjectAccessByProject(projectId: string, userId: string): Promise<void> {
    return await this.client.users.revokeUserProjectAccessByProject(projectId, userId);
  }

  async updateUserProjectAccessByProject(
    projectId: string, 
    userId: string, 
    access: GrantProjectUserAccessRequestInner
  ): Promise<void> {
    return await this.client.users.updateUserProjectAccessByProject(projectId, userId, access);
  }

  async listUserProjectAccessByProject(
    projectId: string, 
    filters?: FilterListProjectUserAccess
  ): Promise<ListProjectUserAccess200Response> {
    return await this.client.users.listUserProjectAccessByProject(projectId, filters);
  }

  async listUserProjectAccessByUser(
    userId: string, 
    filters?: FilterListProjectUserAccess
  ): Promise<ListProjectUserAccess200Response> {
    return await this.client.users.listUserProjectAccessByUser(userId, filters);
  }

  async listEnvironments(projectId: string): Promise<Environment[]> {
    return await this.client.environments.list(projectId);
  }
}