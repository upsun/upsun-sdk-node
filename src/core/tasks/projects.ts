import { UpsunClient } from '../../upsun.js';
import { 
  DeploymentTargetApi,
  ListOrgSubscriptionsRequest, 
  ListProjectTeamAccessRequest, 
  ListTeamProjectAccessRequest, 
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
  ProjectInvitation
} from '../../model/index.js';
import { TaskBase } from './task_base.js';
import { CertificateCreateParams } from './certificates.js';
import { FilterListProjectUserAccess } from '../index.js';
import { CreateProjectInvite } from './invitations.js';

// Type creation for request parameters that omit required fields from the original input types
export type IntegrationCreateInputWithoutType = Omit<IntegrationCreateInput, 'type'>;
export type ProjectCreateRequest = Omit<CreateOrgSubscriptionRequest, 'projectRegion'>;
export type FilterListOrgProjects = Omit<ListOrgSubscriptionsRequest, 'organizationId'>;

export class ProjectsTask extends TaskBase {
  
  constructor(
    protected readonly client: UpsunClient,
    private prjApi: ProjectApi,
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
    const subscriptionId = TaskBase.extractSubscriptionId(project.subscription.licenseUri);
    TaskBase.checkSubscriptionId(subscriptionId);

    return await this.subApi.deleteOrgSubscription({ organizationId: project.organization as string, subscriptionId });
  }

  async info(
    projectId: string,
    params?: ProjectPatch
  ): Promise<Project> {
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

    const response = await this.prjApi.updateProjects({ projectId, projectPatch: params });
    if (response.code !== 200) {
      return await this.get(projectId);
    } else {
      throw new Error('Project update failed');
    }
  }

  //TODO do we return ListOrgSubscriptions200Response or Project[]
  async list(organizationId: string, filters?: FilterListOrgProjects): Promise<Project[]> {
    TaskBase.checkOrganizationId(organizationId);

    const subscriptions = await this.subApi.listOrgSubscriptions({ organizationId, ...filters });
    return Promise.all((subscriptions.items ?? []).map(subscription => this.client.projects.get(subscription.id!)));
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

  async createInvite(   
    projectId: string, 
    email: string,
    params: CreateProjectInvite,
  ): Promise<ProjectInvitation> {
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
    
    if(!name) {
      throw new Error('Variable name is required');
    }

    if(!value) {
      throw new Error('Variable value is required');
    }

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

  //TODO improve enforcedMounts typing
  async createDeployment(
    projectId: string,
    type: DedicatedDeploymentTargetCreateInputTypeEnum,
    name: string,
    enforcedMounts?: object
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);

    return await this.deploymentTargetApi.createProjectsDeployments({
      projectId,
      deploymentTargetCreateInput: {type, name, enforcedMounts}
    });
  }

  async deleteDeployment(projectId: string, deploymentId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkDeploymentId(deploymentId);

    return await this.deploymentTargetApi.deleteProjectsDeployments({ 
      projectId, 
      deploymentTargetConfigurationId: deploymentId 
    });
  }

  async getDeployment(projectId: string, deploymentId: string): Promise<DeploymentTarget> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkDeploymentId(deploymentId);

    return await this.deploymentTargetApi.getProjectsDeployments({ 
      projectId, 
      deploymentTargetConfigurationId: deploymentId 
     });
  }

  async listDeployments(projectId: string): Promise<DeploymentTargetCollection> {
    TaskBase.checkProjectId(projectId);

    return await this.deploymentTargetApi.listProjectsDeployments({ projectId });
  }

  async updateDeployment(
    projectId: string, 
    deploymentId: string,
    type: DedicatedDeploymentTargetCreateInputTypeEnum,
    name: string,
    enforcedMounts?: object  
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkDeploymentId(deploymentId);

    return await this.deploymentTargetApi.updateProjectsDeployments({ 
      projectId, 
      deploymentTargetConfigurationId: deploymentId, 
      deploymentTargetPatch: { type, name, enforcedMounts }
    });
  }

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

  async restartGitServer(projectId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);

    return await this.systemInfoApi.actionProjectsSystemRestart({ projectId });
  }

  async getGitInfo(projectId: string): Promise<SystemInformation> {
    TaskBase.checkProjectId(projectId);

    return await this.systemInfoApi.getProjectsSystem({ projectId });
  }

  async createIntegration(
    projectId: string, 
    type: string,
    params: IntegrationCreateInputWithoutType
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
    params: IntegrationCreateInputWithoutType
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
    TaskBase.checkProjectId(projectId);
    
    if(!domainName) {
      throw new Error('Domain name is required');
    }

    return await this.client.domains.add( projectId, domainName, attributes, isDefault, replacementFor);
  }
   
  async deleteDomain(projectId: string, domainId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkDomainId(domainId);

    return await this.client.domains.delete(projectId, domainId);
  }

  async getDomain(projectId: string, domainId: string): Promise<Domain> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkDomainId(domainId);

    return await this.client.domains.get(projectId, domainId);
  }

  async listDomains(projectId: string): Promise<Domain[]> {
    TaskBase.checkProjectId(projectId);

    return await this.client.domains.list(projectId);
  }

  async updateDomain(
    projectId: string, 
    domainId: string, 
    params?: DomainPatch
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkDomainId(domainId);

    return await this.client.domains.update(projectId, domainId, params);
  }

  async addCertificate(
    projectId: string,
    certificate: string,
    key: string,
    params?: CertificateCreateParams
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);

    return await this.client.certificates.add(projectId, certificate, key, params);
  }

  async deleteCertificate(projectId: string, certificateId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkCertificateId(certificateId);

    return await this.client.certificates.delete(projectId, certificateId);
  }

  async getCertificate(projectId: string, certificateId: string): Promise<Certificate> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkCertificateId(certificateId);

    return await this.client.certificates.get(projectId, certificateId);
  }

  async listCertificates(projectId: string): Promise<Certificate[]> {
    TaskBase.checkProjectId(projectId);

    return await this.client.certificates.list(projectId);
  }

  async getProjectTeamAccess(projectId: string, teamId: string): Promise<TeamProjectAccess> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkTeamId(teamId);

    return await this.client.teams.getProjectTeamAccess(projectId, teamId);
  }

  async getTeamProjectAccess(teamId: string, projectId: string): Promise<TeamProjectAccess> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkProjectId(projectId);

    return await this.client.teams.getTeamProjectAccess(teamId, projectId);
  }

  async grantProjectTeamAccess(
    projectId: string, 
    access: Array<GrantProjectTeamAccessRequestInner>
  ): Promise<void> {
    TaskBase.checkProjectId(projectId);

    return await this.client.teams.grantProjectTeamAccess(projectId, access);
  }

  async grantTeamProjectAccess(teamId: string, access: Array<GrantTeamProjectAccessRequestInner>): Promise<void> {
    TaskBase.checkTeamId(teamId);

    return await this.client.teams.grantTeamProjectAccess(teamId, access);
  }

  async listProjectTeamAccess(projectId: string, params: ListProjectTeamAccessRequest): Promise<ListProjectTeamAccess200Response> {
    TaskBase.checkProjectId(projectId);

    return await this.client.teams.listProjectTeamAccess(projectId, params);
  }

  async listTeamProjectAccess(teamId: string, params: ListTeamProjectAccessRequest): Promise<ListProjectTeamAccess200Response> {
    TaskBase.checkTeamId(teamId);
    return await this.client.teams.listTeamProjectAccess(teamId, params);
  }
  
  async revokeProjectTeamAccess(projectId: string, teamId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkTeamId(teamId);

    return await this.client.teams.revokeProjectTeamAccess(projectId, teamId);
  }

  async revokeTeamProjectAccess(teamId: string, projectId: string): Promise<void> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkProjectId(projectId);

    return await this.client.teams.revokeTeamProjectAccess(teamId, projectId);
  }

  async getProjectUserAccess(projectId: string, userId: string): Promise<UserProjectAccess> {
    TaskBase.checkUserId(userId);
    TaskBase.checkProjectId(projectId);

    return await this.client.users.getProjectUserAccess(projectId, userId);
  }

  async grantProjectUserAccess(projectId: string, access: Array<GrantProjectUserAccessRequestInner>): Promise<void> {
    TaskBase.checkProjectId(projectId);
    
    return await this.client.users.grantProjectUserAccess(projectId, access);
  }

  async revokeProjectUserAccess(projectId: string, userId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkUserId(userId);

    return await this.client.users.revokeProjectUserAccess(projectId, userId);
  }

  async updateProjectUserAccess(
    projectId: string, 
    userId: string, 
    access: GrantProjectUserAccessRequestInner
  ): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkUserId(userId);

    return await this.client.users.updateProjectUserAccess(projectId, userId, access);
  }

  async listProjectUserAccess(
    projectId: string, 
    filters?: FilterListProjectUserAccess
  ): Promise<ListProjectUserAccess200Response> {
    TaskBase.checkProjectId(projectId);

    return await this.client.users.listProjectUserAccess(projectId, filters);
  }

  async listUserProjectAccess(
    userId: string, 
    filters?: FilterListProjectUserAccess
  ): Promise<ListProjectUserAccess200Response> {
    TaskBase.checkUserId(userId);

    return await this.client.users.listUserProjectAccess(userId, filters);
  }

  async listEnvironments(projectId: string): Promise<Environment[]> {
    TaskBase.checkProjectId(projectId);

    return await this.client.environments.list(projectId);
  }
}