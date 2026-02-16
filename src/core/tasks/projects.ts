import { UpsunClient } from '../../upsun.js';
import {
  ListProjectTeamAccessRequest,
  ListTeamProjectAccessRequest,
  OrganizationProjectsApi,
  ProjectApi,
  ProjectSettingsApi,
  SubscriptionsApi,
} from '../../api/index.js';
import {
  AcceptedResponse,
  Activity,
  CanCreateNewOrgSubscription200Response,
  EnvironmentVariableCreateInput,
  Project,
  ProjectCapabilities,
  ProjectPatch,
  ProjectSettings,
  ProjectVariable,
  Subscription,
  Domain,
  Certificate,
  TeamProjectAccess,
  GrantProjectTeamAccessRequestInner,
  GrantTeamProjectAccessRequestInner,
  ListProjectTeamAccess200Response,
  DomainPatch,
  UserProjectAccess,
  GrantProjectUserAccessRequestInner,
  ListProjectUserAccess200Response,
  Environment,
  ProjectInvitation,
  ListOrgProjects200Response,
} from '../../model/index.js';
import { TaskBase } from './task_base.js';
import {
  CertificateCreateParams,
  CreateProjectInvite,
  FilterListOrgProjects,
  FilterListProjectUserAccess,
  FilterListUserProjectAccess,
  ProjectCreateRequest,
} from '../model.js';

export class ProjectsTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private prjApi: ProjectApi,
    private orgPrjApi: OrganizationProjectsApi,
    private subApi: SubscriptionsApi,
    private settingsApi: ProjectSettingsApi,
  ) {
    super(client);
  }

  /**
   * Clears the build cache for a project.
   * @param projectId - The ID of the project to clear the build cache for.
   * @return An AcceptedResponse indicating that the request to clear the build cache has been accepted.
   * The client should check the status of the operation through the activity details to confirm whether it was executed
   * successfully or if there was an error.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async clearBuildCache(projectId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);

    return await this.prjApi.actionProjectsClearBuildCache({ projectId });
  }

  /**
   * Creates a new project subscription under the specified organization with the given parameters.
   * @param organizationId - The ID of the organization to create the project subscription under.
   * @param projectRegion - The region where the project will be created. This should be a valid region identifier
   * where the project will be hosted.
   * @param params - Optional parameters for creating the project subscription, such as the subscription plan, billing
   * cycle, and any additional configuration options that may be required for the subscription.
   * @return The details of the created subscription, including information such as the subscription ID, status, plan,
   * and other relevant details.
   * @throws An error if the organization ID is invalid, if the project region is invalid, if the parameters are
   * invalid, or if there is an issue with the API request.
   */
  async create(
    organizationId: string,
    projectRegion: string,
    params?: ProjectCreateRequest,
  ): Promise<Subscription> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkProjectRegion(projectRegion);

    return await this.subApi.createOrgSubscription({
      organizationId,
      createOrgSubscriptionRequest: { projectRegion, ...params },
    });
  }

  /**
   * Checks if a new project subscription can be created under the specified organization. This method is used to verify
   * whether the organization is eligible to create a new project subscription based on factors such as the
   * organization's current subscription status, limits, and any other relevant criteria.
   * @param organizationId - The ID of the organization to check for project subscription creation eligibility.
   * @return A response indicating whether a new project subscription can be created under the specified organization,
   * along with any relevant details or reasons if the creation is not allowed.
   */
  async canCreate(organizationId: string): Promise<CanCreateNewOrgSubscription200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.subApi.canCreateNewOrgSubscription({ organizationId });
  }

  /**
   * Deletes a project subscription. This will effectively delete the project associated with the subscription, along
   * with any related resources and data.
   * @param projectId - The ID of the project to delete.
   * @return A promise that resolves when the project deletion request has been accepted. The client should check the
   * status of the operation through the activity details to confirm whether the deletion was executed successfully or
   * if there was an error.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async delete(projectId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);

    const project = await this.prjApi.getProjects({ projectId });
    //TODO Why not using Project.subscription.id directly? FHK: Because it's empty
    const subscriptionId = TaskBase.extractSubscriptionId(project.subscription.licenseUri);
    TaskBase.checkSubscriptionId(subscriptionId);

    return await this.subApi.deleteOrgSubscription({
      organizationId: project.organization as string,
      subscriptionId,
    });
  }

  /**
   * Get or update a project.
   * @param projectId - The ID of the project to retrieve or update.
   * @param params - Optional parameters to update the project with. If provided, the project will be updated with these
   * parameters and the updated project details will be returned. If not provided, the current project details will be
   * returned without any modifications.
   * @return The details of the project after applying any updates if parameters were provided, or the current project
   * details if no updates were made.
   * @throws An error if the project ID is invalid, if the parameters are invalid, or if there is an issue with the API
   * request.
   */
  async info(projectId: string, params?: ProjectPatch): Promise<Project> {
    TaskBase.checkProjectId(projectId);

    if (params && Object.keys(params).length > 0) {
      return await this.update(projectId, params);
    } else {
      return await this.prjApi.getProjects({ projectId });
    }
  }

  /**
   * Get the details of a project by its ID.
   * @param projectId - The ID of the project to retrieve.
   * @return The details of the specified project.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async get(projectId: string): Promise<Project> {
    TaskBase.checkProjectId(projectId);

    return await this.prjApi.getProjects({ projectId });
  }

  /**
   * Update the details of a project. This allows you to modify the project's information such as its name, description,
   * or other attributes that can be updated. The method will return the updated project details after applying the
   * changes.
   * @param projectId - The ID of the project to update.
   * @param params - The parameters to update the project with. This should include the fields that you want to modify
   * and their new values.
   * @return The details of the project after applying the updates.
   * @throws An error if the project ID is invalid, if the parameters are invalid, or if there is an issue with the API
   * request.
   */
  async update(projectId: string, params: ProjectPatch): Promise<Project> {
    TaskBase.checkProjectId(projectId);

    await this.prjApi.updateProjects({ projectId, projectPatch: params });
    return await this.get(projectId);
  }

  /**
   * List the projects for an organization. This method retrieves a list of projects that belong to the specified
   * organization, with optional filtering based on criteria such as project name, creation date, or other attributes.
   * The returned list includes the details of each project that matches the specified filters.
   * @param organizationId - The ID of the organization to list projects for.
   * @param filters - Optional filters to apply to the list of projects.
   * @return A list of projects that belong to the specified organization and match the provided filters.
   * @throws An error if the organization ID is invalid, if the filters are invalid, or if there is an issue with the
   * API request.
   */
  async list(
    organizationId: string,
    filters?: FilterListOrgProjects,
  ): Promise<ListOrgProjects200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.orgPrjApi.listOrgProjects({ organizationId, ...filters });
  }

  // Add more project-related methods as needed

  /**
   * Get the subscription details for a project. This method retrieves the subscription information associated with the
   * project, including details such as the subscription ID, status, plan, and other relevant information about the
   * subscription that is linked to the project.
   * @param projectId - The ID of the project to retrieve the subscription details for.
   * @return The subscription details associated with the specified project.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async getSubscription(organizationId: string, subscriptionId: string): Promise<Subscription> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkSubscriptionId(subscriptionId);

    return await this.subApi.getOrgSubscription({ organizationId, subscriptionId });
  }

  /**
   * Retrieves the capabilities that are available for the specified project.
   * @param projectId - The ID of the project to retrieve capabilities for.
   * @return The capabilities that are available for the specified project.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async getCapabilities(projectId: string): Promise<ProjectCapabilities> {
    TaskBase.checkProjectId(projectId);

    return await this.prjApi.getProjectsCapabilities({ projectId });
  }

  /**
   * Cancel an invitation to a project. This will revoke the access that was granted to the invitee through the
   * invitation, and the invite will no longer be valid.
   * @param projectId - The ID of the project to cancel the invitation for.
   * @param invitationId - The ID of the invitation to cancel.
   * @return A promise that resolves when the invitation has been canceled.
   * @throws An error if the project ID or invitation ID is invalid, or if there is an issue with the API request.
   */
  async cancelInvite(projectId: string, inviteId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkInviteId(inviteId);

    await this.client.invitations.cancelProjectInvite(projectId, inviteId);
  }

  /**
   * Create an invitation to a project for a specified email address, with the specified role and permissions.
   * @param projectId - The ID of the project to create the invitation for.
   * @param email - The email address to send the invitation to.
   * @param params - The parameters for the project invitation, including the role to assign to the invitee and any
   * specific permissions to grant within the project.
   * @return The details of the created project invitation.
   * @throws An error if the project ID is invalid, if the email address is invalid, if the parameters are invalid, or
   * if there is an issue with the API request.
   */
  async createInvite(
    projectId: string,
    email: string,
    params: CreateProjectInvite,
  ): Promise<ProjectInvitation> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEmail(email);

    return await this.client.invitations.createProjectInvite(projectId, email, params);
  }

  /**
   * List all invitations for a project.
   * @param projectId - The ID of the project to list invitations for.
   * @return A list of project invitations.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async listInvites(projectId: string): Promise<ProjectInvitation[]> {
    TaskBase.checkProjectId(projectId);

    return await this.client.invitations.listProjectInvites(projectId);
  }

  /**
   * Get project settings.
   * @param projectId - The ID of the project to retrieve settings for.
   * @return The settings of the specified project.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async getSettings(projectId: string): Promise<ProjectSettings> {
    TaskBase.checkProjectId(projectId);

    return await this.settingsApi.getProjectsSettings({ projectId });
  }

  /**
   * Update project settings.
   * @param projectId - The ID of the project to update settings for.
   * @param settings - The new settings to apply to the project.
   * @return An AcceptedResponse indicating that the request to update the project settings has been accepted.
   * The client should check the status of the update to confirm when it has been applied.
   * @throws An error if the project ID is invalid, if the settings are invalid, or if there is an issue with the API
   * request.
   */
  async updateSettings(projectId: string, settings: ProjectSettings): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);

    return await this.settingsApi.updateProjectsSettings({
      projectId,
      projectSettingsPatch: settings,
    });
  }

  /**
   * Create a new project variable. This allows you to add a new variable to the project, which can be used for
   * configuration, secrets, or other purposes within the project. The method will return an AcceptedResponse indicating
   * that the request to create the variable has been accepted, and the client should check the status of the operation
   * to confirm when the variable has been created and is available for use.
   * @param projectId - The ID of the project to create the variable for.
   * @param name - The name of the variable to create. This should be a unique identifier for the variable within the
   * project.
   * @param value - The value of the variable to create. This can be any string value that you want to associate with
   * the variable.
   * @param params - Optional parameters for creating the variable, such as whether the variable is protected, masked,
   * or other attributes.
   * @return An AcceptedResponse indicating that the request to create the variable has been accepted. The client should
   * check the status of the operation to confirm when the variable has been created and is available for use.
   * @throws An error if the project ID is invalid, if the name or value is invalid, if the parameters are invalid, or
   * if there is an issue with the API request.
   */
  async createVariable(
    projectId: string,
    name: string,
    value: string,
    params?: EnvironmentVariableCreateInput,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);

    return await this.client.variables.createProjectVariable(projectId, name, value, params);
  }

  /**
   * Get the details of a project variable by its ID.
   * @param projectId - The ID of the project to retrieve the variable from.
   * @param variableId - The ID of the variable to retrieve.
   * @return The details of the specified project variable.
   * @throws An error if the project ID or variable ID is invalid, or if there is an issue with the API request.
   */
  async getVariable(projectId: string, variableId: string): Promise<ProjectVariable> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkVariableId(variableId);

    return await this.client.variables.getProjectVariable(projectId, variableId);
  }

  /**
   * Delete a project variable by its ID. This will remove the variable from the project, and it will no longer be
   * available for use within the project. The method will return a promise that resolves when the deletion request has
   * been accepted, and the client should check the status of the operation to confirm when the variable has been
   * deleted.
   * @param projectId - The ID of the project to delete the variable from.
   * @param variableId - The ID of the variable to delete.
   * @return A promise that resolves when the deletion request has been accepted. The client should check the status of
   * the operation to confirm when the variable has been deleted.
   * @throws An error if the project ID or variable ID is invalid, or if there is an issue with the API request.
   */
  async deleteVariable(projectId: string, variableId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkVariableId(variableId);

    return await this.client.variables.deleteProjectVariable(projectId, variableId);
  }

  /**
   * List all project variables for a specified project. This method retrieves a list of all variables that are
   * associated with the specified project, including their details such as name, value, and any attributes.
   * The returned list includes the details of each variable that belongs to the project.
   * @param projectId - The ID of the project to list variables for.
   * @return A list of project variables that belong to the specified project.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async listVariables(projectId: string): Promise<ProjectVariable[]> {
    TaskBase.checkProjectId(projectId);

    return await this.client.variables.listProjectVariables(projectId);
  }

  /**
   * Update a project variable by its ID. This allows you to modify the value or attributes of an existing variable
   * within the project. The method will return an AcceptedResponse indicating that the request to update the variable
   * has been accepted, and the client should check the status of the operation to confirm when the variable has been
   * updated and the changes have been applied.
   * @param projectId - The ID of the project to update the variable in.
   * @param variableId - The ID of the variable to update.
   * @param params - The new parameters to apply to the variable, such as a new value or updated attributes.
   * @return An AcceptedResponse indicating that the request to update the variable has been accepted. The client should
   * check the status of the operation to confirm when the variable has been updated and the changes have been applied.
   * @throws An error if the project ID or variable ID is invalid, if the parameters are invalid, or if there is an
   * issue with the API request.
   */
  async updateVariable(
    projectId: string,
    variableId: string,
    params?: EnvironmentVariableCreateInput,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkVariableId(variableId);

    return await this.client.variables.updateProjectVariable(projectId, variableId, params);
  }

  /**
   * List all activities for a project. This method retrieves a list of all activities that have occurred within the
   * specified project, including details such as the type of activity, the user who performed it, the timestamp, and
   * any relevant metadata.
   * @param projectId - The ID of the project to list activities for.
   * @return A list of activities that have occurred within the specified project.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async listActivities(projectId: string): Promise<Activity[]> {
    TaskBase.checkProjectId(projectId);

    return await this.client.activities.list(projectId);
  }

  /**
   * Get the details of a specific activity by its ID within a project. This method retrieves the details of a
   * particular activity, including information such as the type of activity, the user who performed it, the timestamp,
   * and any relevant metadata.
   * @param projectId - The ID of the project to retrieve the activity from.
   * @param activityId - The ID of the activity to retrieve.
   * @return The details of the specified activity within the project.
   * @throws An error if the project ID or activity ID is invalid, or if there is an issue with the API request.
   */
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

  /**
   * Add a custom domain to a project. This allows you to associate a custom domain name with the project, which can be
   * used to access the project.
   * @param projectId - The ID of the project to add the domain to.
   * @param domain - The custom domain name to add to the project. This should be a valid domain name that you want to
   * associate with the project.
   * @param attributes - Optional attributes to associate with the domain, such as SSL configuration, CNAME records, or
   * other relevant settings for the domain.
   * @param isDefault - Optional flag indicating whether this domain should be set as the default domain for the
   * project. If true, this domain will be used as the primary domain for accessing the project. If false or not
   * provided, the domain will be added but not set as the default.
   * @param replacementFor - Optional ID of an existing domain that this new domain should replace. If provided, the new
   * domain will take over the role of the specified existing domain, and the existing domain will be removed or
   * deactivated as part of the process. This is useful for smoothly transitioning from one domain to another without
   * downtime.
   * @return An AcceptedResponse indicating that the request to add the domain has been accepted. The client should
   * check the status of the operation to confirm when the domain has been added and is available for use.
   * @throws An error if the project ID is invalid, if the domain name is invalid, if the attributes are invalid, or if
   * there is an issue with the API request.
   */
  async addDomain(
    projectId: string,
    domain: string,
    attributes?: { [key: string]: string },
    isDefault?: boolean,
    replacementFor?: string,
  ): Promise<AcceptedResponse> {
    return await this.client.domains.add(projectId, domain, attributes, isDefault, replacementFor);
  }

  /**
   * Delete a custom domain from a project. This will remove the association of the specified domain with the project,
   * and the domain will no longer be used to access the project.
   * @param projectId - The ID of the project to delete the domain from.
   * @param domainId - The ID of the domain to delete from the project. This should be a valid identifier for a domain
   * that is associated with the project.
   * @return A promise that resolves when the domain deletion request has been accepted. The client should check the
   * status of the operation to confirm when the domain has been deleted and is no longer available for use.
   * @throws An error if the project ID or domain ID is invalid, or if there is an issue with the API request.
   */
  async deleteDomain(projectId: string, domainId: string): Promise<AcceptedResponse> {
    return await this.client.domains.delete(projectId, domainId);
  }

  /**
   * Get the details of a custom domain associated with a project by its ID. This method retrieves the information about
   * a specific domain that is linked to the project.
   * @param projectId - The ID of the project to retrieve the domain from.
   * @param domainId - The ID of the domain to retrieve. This should be a valid identifier for a domain that is
   * associated with the project.
   * @return A promise that resolves to the details of the specified domain.
   * @throws An error if the project ID or domain ID is invalid, or if there is an issue with the API request.
   */
  async getDomain(projectId: string, domainId: string): Promise<Domain> {
    return await this.client.domains.get(projectId, domainId);
  }

  /**
   * List all custom domains associated with a project. This method retrieves a list of all domains that are linked to
   * the project.
   * @param projectId - The ID of the project to list domains for.
   * @return A list of custom domains that are associated with the specified project, including details such as the
   * domain name, attributes, and status.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async listDomains(projectId: string): Promise<Domain[]> {
    return await this.client.domains.list(projectId);
  }

  /**
   * Update the details of a custom domain associated with a project. This allows you to modify the attributes or
   * settings of an existing domain that is linked to the project. The method will return an AcceptedResponse indicating
   * that the update request has been accepted and is being processed.
   * @param projectId - The ID of the project to update the domain in.
   * @param domainId - The ID of the domain to update. This should be a valid identifier for a domain that is associated
   * with the project.
   * @param params - The new parameters to apply to the domain, such as updated attributes, SSL configuration, or other
   * settings that you want to modify for the domain.
   * @return An AcceptedResponse indicating that the request to update the domain has been accepted. The client should
   * check the status of the operation to confirm when the domain has been updated and the changes have been applied.
   * @throws An error if the project ID or domain ID is invalid, if the parameters are invalid, or if there is an issue
   * with the API request.
   */
  async updateDomain(
    projectId: string,
    domainId: string,
    params?: DomainPatch,
  ): Promise<AcceptedResponse> {
    return await this.client.domains.update(projectId, domainId, params);
  }

  /**
   * Add a custom SSL certificate to a project. This allows you to associate an SSL certificate with the project, which
   * can be used to secure the custom domains that are linked to the project.
   * @param projectId - The ID of the project to add the certificate to.
   * @param certificate - The SSL certificate to add to the project. This should be a valid SSL certificate in PEM
   * format.
   * @returns An AcceptedResponse indicating that the request to add the certificate has been accepted. The client
   * should check the status of the operation to confirm when the certificate has been added and the changes have been
   * applied.
   * @throws An error if the project ID is invalid, if the certificate is invalid, or if there is an issue with the API
   * request.
   */
  async addCertificate(
    projectId: string,
    certificate: string,
    key: string,
    params?: CertificateCreateParams,
  ): Promise<AcceptedResponse> {
    return await this.client.certificates.add(projectId, certificate, key, params);
  }

  /**
   * Delete a custom SSL certificate from a project. This will remove the association of the specified certificate with
   * the project.
   * @param projectId - The ID of the project to delete the certificate from.
   * @param certificateId - The ID of the certificate to delete from the project. This should be a valid identifier for
   * a certificate that is associated with the project.
   * @return A promise that resolves when the certificate deletion request has been accepted. The client should check
   * the status of the operation to confirm when the certificate has been deleted and the changes have been applied.
   * @throws An error if the project ID or certificate ID is invalid, or if there is an issue with the API request.
   */
  async deleteCertificate(projectId: string, certificateId: string): Promise<AcceptedResponse> {
    return await this.client.certificates.delete(projectId, certificateId);
  }

  /**
   * Get the details of a custom SSL certificate associated with a project by its ID. This method retrieves the
   * information about a specific SSL certificate that is linked to the project, including details such as the
   * certificate name, expiration date, associated domains, and any relevant metadata.
   * @param projectId - The ID of the project to retrieve the certificate from.
   * @param certificateId - The ID of the certificate to retrieve. This should be a valid identifier for a certificate
   * that is associated with the project.
   * @return A promise that resolves to the details of the specified certificate.
   * @throws An error if the project ID or certificate ID is invalid, or if there is an issue with the API request.
   */
  async getCertificate(projectId: string, certificateId: string): Promise<Certificate> {
    return await this.client.certificates.get(projectId, certificateId);
  }

  /**
   * List all custom SSL certificates associated with a project. This method retrieves a list of all SSL certificates
   * that are linked to the project.
   * @param projectId - The ID of the project to list certificates for.
   * @return A list of custom SSL certificates that are associated with the specified project, including details such
   * as the certificate name, expiration date, associated domains, and any relevant metadata.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async listCertificates(projectId: string): Promise<Certificate[]> {
    return await this.client.certificates.list(projectId);
  }

  /**
   * Get the access details of a team to a project. This method retrieves the access information for a specific team in
   * relation to a project, including the level of access granted to the team, the permissions they have, and any
   * relevant metadata about the team's access to the project.
   * @param projectId - The ID of the project to retrieve the team access for.
   * @param teamId - The ID of the team to retrieve access details for. This should be a valid identifier for a team
   * that is associated with the project.
   * @return The access details of the specified team to the project, including the level of access, permissions, and
   * any relevant metadata.
   * @throws An error if the project ID or team ID is invalid, or if there is an issue with the API request.
   */
  async getTeamProjectAccessByProject(
    projectId: string,
    teamId: string,
  ): Promise<TeamProjectAccess> {
    return await this.client.teams.getTeamProjectAccessByProject(projectId, teamId);
  }

  /**
   * Get the access details of a project to a team. This method retrieves the access information for a specific project
   * in relation to a team, including the level of access granted to the project, the permissions it has, and any
   * relevant metadata about the project's access to the team.
   * @param teamId - The ID of the team to retrieve the project access for.
   * @param projectId - The ID of the project to retrieve access details for. This should be a valid identifier for a
   * project that is associated with the team.
   * @return The access details of the specified project to the team, including the level of access, permissions, and
   * any relevant metadata.
   * @throws An error if the team ID or project ID is invalid, or if there is an issue with the API request.
   */
  async getTeamProjectAccessByTeam(teamId: string, projectId: string): Promise<TeamProjectAccess> {
    return await this.client.teams.getTeamProjectAccessByTeam(teamId, projectId);
  }

  /**
   * Grant access to a project for a team. This method allows you to grant a specific level of access to a project for a
   * team, along with any relevant permissions. The access details will be defined in the request body, and once the
   * request is accepted, the team will have the specified access to the project.
   * @param projectId - The ID of the project to grant access to.
   * @param teamId - The ID of the team to grant access for. This should be a valid identifier for a team that is
   * associated with the project.
   * @param access - The access details to grant to the team for the project, including the level of access,
   * permissions, and any relevant metadata.
   * @return An AcceptedResponse indicating that the request to grant access has been accepted. The client should check
   * the status of the request to confirm that the access has been granted.
   * @throws An error if the project ID or team ID is invalid, if the access details are invalid, or if there is an
   * issue with the API request.
   */
  async grantTeamProjectAccessToProject(
    projectId: string,
    access: GrantProjectTeamAccessRequestInner[],
  ): Promise<void> {
    return await this.client.teams.grantTeamProjectAccessToProject(projectId, access);
  }

  /**
   * Grant access to a team for a project. This method allows you to grant a specific level of access to a team for a
   * project, along with any relevant permissions. The access details will be defined in the request body, and once the
   * request is accepted, the project will have the specified access to the team.
   * @param teamId - The ID of the team to grant access to.
   * @param access - The access details to grant to the project for the team, including the level of access,
   * permissions, and any relevant metadata.
   * @return An AcceptedResponse indicating that the request to grant access has been accepted. The client should check
   * the status of the request to confirm that the access has been granted.
   * @throws An error if the team ID is invalid, if the access details are invalid, or if there is an issue with the API
   * request.
   */
  async grantTeamProjectAccessToTeam(
    teamId: string,
    access: GrantTeamProjectAccessRequestInner[],
  ): Promise<void> {
    return await this.client.teams.grantTeamProjectAccessToTeam(teamId, access);
  }

  /**
   * List the access details of all teams to a project. This method retrieves a list of all teams that have access to a
   * project, along with the access details for each team, including the level of access, permissions, and any relevant
   * metadata about their access to the project.
   * @param projectId - The ID of the project to list team access for.
   * @param params - Optional parameters to filter or paginate the list of team access details.
   * @return A list of team access details for all teams that have access to the specified project, including the level
   * of access, permissions, and any relevant metadata.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async listTeamProjectAccessByProject(
    projectId: string,
    params: ListProjectTeamAccessRequest,
  ): Promise<ListProjectTeamAccess200Response> {
    return await this.client.teams.listTeamProjectAccessByProject(projectId, params);
  }

  /**
   * List the access details of all projects to a team. This method retrieves a list of all projects that a team has
   * access to, along with the access details for each project, including the level of access, permissions, and any
   * relevant metadata about their access to the project.
   * @param teamId - The ID of the team to list project access for.
   * @param params - Optional parameters to filter or paginate the list of project access details.
   * @return A list of project access details for all projects that the specified team has access to, including the
   * level of access, permissions, and any relevant metadata.
   * @throws An error if the team ID is invalid, or if there is an issue with the API request.
   */
  async listTeamProjectAccessByTeam(
    teamId: string,
    params: ListTeamProjectAccessRequest,
  ): Promise<ListProjectTeamAccess200Response> {
    return await this.client.teams.listTeamProjectAccessByTeam(teamId, params);
  }

  /**
   * Revoke access to a project for a team. This method allows you to revoke the access that a team has to a project,
   * which will remove the team's permissions and access to the project. Once the request is accepted, the team will no
   * longer have access to the project.
   * @param projectId - The ID of the project to revoke access from.
   * @param teamId - The ID of the team to revoke access for. This should be a valid identifier for a team that is
   * associated with the project.
   * @return An AcceptedResponse indicating that the request to revoke access has been accepted. The client should check
   * the status of the request to confirm that the access has been revoked.
   * @throws An error if the project ID or team ID is invalid, or if there is an issue with the API request.
   */
  async revokeTeamProjectAccessByProject(projectId: string, teamId: string): Promise<void> {
    return await this.client.teams.revokeTeamProjectAccessByProject(projectId, teamId);
  }

  /**
   * Revoke access to a team for a project. This method allows you to revoke the access that a project has to a team,
   * which will remove the project's permissions and access to the team. Once the request is accepted, the project will
   * no longer have access to the team.
   * @param teamId - The ID of the team to revoke access from.
   * @param projectId - The ID of the project to revoke access for. This should be a valid identifier for a project that
   * is associated with the team.
   * @return An AcceptedResponse indicating that the request to revoke access has been accepted. The client should check
   * the status of the request to confirm that the access has been revoked.
   * @throws An error if the team ID or project ID is invalid, or if there is an issue with the API request.
   */
  async revokeTeamProjectAccessByTeam(teamId: string, projectId: string): Promise<void> {
    return await this.client.teams.revokeTeamProjectAccessByTeam(teamId, projectId);
  }

  /**
   * Get the access details of a user to a project. This method retrieves the access information for a specific user in
   * relation to a project, including the level of access granted to the user, the permissions they have, and any
   * relevant metadata about the user's access to the project.
   * @param projectId - The ID of the project to retrieve the user access for.
   * @param userId - The ID of the user to retrieve access details for. This should be a valid identifier for a user
   * that is associated with the project.
   * @returns The access details of the specified user to the project, including the level of access, permissions, and
   * any relevant metadata.
   * @throws An error if the project ID or user ID is invalid, or if there is an issue with the API request.
   */
  async getUserProjectAccessByProject(
    projectId: string,
    userId: string,
  ): Promise<UserProjectAccess> {
    return await this.client.users.getUserProjectAccessByProject(projectId, userId);
  }

  /**
   * Grant access to a project for a user. This method allows you to grant a specific level of access to a project for a
   * user, along with any relevant permissions. The access details will be defined in the request body, and once the
   * request is accepted, the user will have the specified access to the project.
   * @param projectId - The ID of the project to grant access to.
   * @param access - The access details to grant to users for the project, including the level of access, permissions,
   * and any relevant metadata.
   * @return An AcceptedResponse indicating that the request to grant access has been accepted. The client should check
   * the status of the request to confirm that the access has been granted.
   * @throws An error if the project ID is invalid, if the access details are invalid, or if there is an issue with the
   * API request.
   */
  async grantUserProjectAccessByProject(
    projectId: string,
    access: GrantProjectUserAccessRequestInner[],
  ): Promise<void> {
    return await this.client.users.grantUserProjectAccessByProject(projectId, access);
  }

  /**
   * Revoke access to a project for a user. This method allows you to revoke the access that a user has to a project,
   * which will remove the user's permissions and access to the project. Once the request is accepted, the user will no
   * longer have access to the project.
   * @param projectId - The ID of the project to revoke access from.
   * @param userId - The ID of the user to revoke access for. This should be a valid identifier for a user that is
   * associated with the project.
   * @throws An error if the project ID or user ID is invalid, or if there is an issue with the API request.
   */
  async revokeUserProjectAccessByProject(projectId: string, userId: string): Promise<void> {
    return await this.client.users.revokeUserProjectAccessByProject(projectId, userId);
  }

  /**
   * Update the access details of a user to a project. This method allows you to modify the level of access or
   * permissions that a user has to a project.
   * @param projectId - The ID of the project to update user access for.
   * @param userId - The ID of the user to update access for. This should be a valid identifier for a user that is
   * associated with the project.
   * @param access - The new access details to apply to the user for the project, including the updated level of access,
   * permissions, and any relevant metadata.
   * @throws An error if the project ID or user ID is invalid, if the access details are invalid, or if there is an
   * issue with the API request.
   */
  async updateUserProjectAccessByProject(
    projectId: string,
    userId: string,
    access: GrantProjectUserAccessRequestInner,
  ): Promise<void> {
    return await this.client.users.updateUserProjectAccessByProject(projectId, userId, access);
  }

  /**
   * List the access details of all users to a project. This method retrieves a list of all users that have access to a
   * project, along with the access details for each user, including the level of access, permissions, and any relevant
   * metadata about their access to the project.
   * @param projectId - The ID of the project to list user access for.
   * @param filters - Optional parameters to filter or paginate the list of user access details.
   * @return A list of user access details for all users that have access to the specified project, including the level
   * of access, permissions, and any relevant metadata.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async listUserProjectAccessByProject(
    projectId: string,
    filters?: FilterListProjectUserAccess,
  ): Promise<ListProjectUserAccess200Response> {
    return await this.client.users.listUserProjectAccessByProject(projectId, filters);
  }

  /**
   * List the access details of all projects to a user. This method retrieves a list of all projects that a user has
   * access to, along with the access details for each project, including the level of access, permissions, and any
   * relevant metadata about their access to the projects.
   * @param userId - The ID of the user to list project access for.
   * @param filters - Optional parameters to filter or paginate the list of project access details.
   * @return A list of project access details for all projects that the specified user has access to, including the
   * level of access, permissions, and any relevant metadata.
   * @throws An error if the user ID is invalid, or if there is an issue with the API request.
   */
  async listUserProjectAccessByUser(
    userId: string,
    filters?: FilterListUserProjectAccess,
  ): Promise<ListProjectUserAccess200Response> {
    return await this.client.users.listUserProjectAccessByUser(userId, filters);
  }

  /**
   * List all environments associated with a project. This method retrieves a list of all environments that are linked
   * to the specified project.
   * @param projectId - The ID of the project to list environments for.
   * @return A list of environments that are associated with the specified project, including details such as the
   * environment name, ID, and other relevant metadata.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async listEnvironments(projectId: string): Promise<Environment[]> {
    return await this.client.environments.list(projectId);
  }
}
