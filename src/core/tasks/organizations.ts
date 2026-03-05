import {
  AddOnsApi,
  EstimateNewOrgSubscriptionFormatEnum,
  GetOrgOrderModeEnum,
  InvoicesApi,
  ListOrgInvoicesFilterStatusEnum,
  ListOrgInvoicesFilterTypeEnum,
  ListTeamsRequest,
  MfaApi,
  OrdersApi,
  OrganizationMembersApi,
  OrganizationsApi,
  ProfilesApi,
  RecordsApi,
  SubscriptionsApi,
  VouchersApi,
} from '../../api/index.js';
import {
  Address,
  CanCreateNewOrgSubscription200Response,
  CreateAuthorizationCredentials200Response,
  CreateOrgRequestTypeEnum,
  EstimationObject,
  Invoice,
  ListOrgInvoices200Response,
  ListOrgMembers200Response,
  ListOrgOrders200Response,
  ListOrgPlanRecords200Response,
  ListOrgProjects200Response,
  ListOrgs200Response,
  ListOrgSubscriptions200Response,
  ListTeams200Response,
  ListUserOrgs200Response,
  Order,
  Organization,
  OrganizationAddonsObject,
  OrganizationMember,
  OrganizationMfaEnforcement,
  Permissions,
  Profile,
  Project,
  Subscription,
  SubscriptionCurrentUsageObject,
  UpdateOrgAddonsRequest,
  UpdateOrgProfileRequest,
  UpdateOrgRequest,
} from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';
import {} from './projects.js';
import {
  FilterListMembers,
  FilterListOrders,
  FilterListOrgProjects,
  FilterListOrgs,
  FilterListPlanRecords,
  FilterListUsageRecords,
  FilterListUser,
  FilterListUserTeams,
  ProjectCreateRequest,
} from '../model.js';

export class OrganizationsTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private orgApi: OrganizationsApi,
    private membersApi: OrganizationMembersApi,
    private subApi: SubscriptionsApi,
    private invApi: InvoicesApi,
    private mfaApi: MfaApi,
    private ordApi: OrdersApi,
    private profApi: ProfilesApi,
    private recApi: RecordsApi,
    private vouchApi: VouchersApi,
    private addOnsApi: AddOnsApi,
  ) {
    super(client);
  }

  /**
   * Create a new organization with the specified label and optional parameters such as type, owner ID, name,
   * and country.
   * @param label - The label for the new organization (required).
   * @param type - The type of the organization (optional). This can be used to specify different types of
   * organizations, such as "business", "personal", etc., depending on the API's supported organization types.
   * @param ownerId - The ID of the user who will be the owner of the organization (optional). If not provided, the
   * organization will be owned by the user making the API request.
   * @param name - The name of the organization (optional). This can be a more descriptive name for the organization,
   * in addition to the label.
   * @param country - The country associated with the organization (optional). This can be used for localization or
   * billing purposes, depending on the API's requirements.
   * @return The details of the created organization.
   * @throws An error if the label is missing or invalid, if any of the optional parameters are invalid, or if there is
   * an issue with the API request.
   */
  async create(
    label: string,
    type?: CreateOrgRequestTypeEnum,
    ownerId?: string,
    name?: string,
    country?: string,
  ): Promise<Organization> {
    if (!label) {
      throw new Error('Label is required');
    }

    return await this.orgApi.createOrg({
      createOrgRequest: {
        label,
        type,
        ownerId,
        name,
        country,
      },
    });
  }

  /**
   * Delete an organization by its ID. This will permanently delete the organization and all associated resources, so
   * it should be used with caution.
   * @param organizationId - The ID of the organization to delete.
   */
  async delete(organizationId: string): Promise<void> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.orgApi.deleteOrg({ organizationId });
  }

  /**
   * Get the details of an organization by its ID, or update the organization if update parameters are provided.
   * @param organizationId - The ID of the organization to get or update.
   * @param updateOrgRequest - (Optional) The parameters to update the organization with. If provided, the organization
   * will be updated with these parameters and the updated organization details will be returned. If not provided, the
   * current organization details will be returned without making any changes.
   * @return The details of the organization, either the current details if no update parameters are provided, or the
   * updated details if update parameters are provided and the update is successful.
   */
  async info(organizationId: string, updateOrgRequest?: UpdateOrgRequest): Promise<Organization> {
    TaskBase.checkOrganizationId(organizationId);

    if (
      updateOrgRequest &&
      (updateOrgRequest.country ||
        updateOrgRequest.label ||
        updateOrgRequest.name ||
        updateOrgRequest.securityContact)
    ) {
      return await this.update(organizationId, updateOrgRequest);
    } else {
      return await this.get(organizationId);
    }
  }

  /**
   * Get the details of an organization by its ID.
   * @param organizationId - The ID of the organization to retrieve.
   * @return The details of the specified organization.
   */
  async get(organizationId: string): Promise<Organization> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.orgApi.getOrg({ organizationId });
  }

  /**
   * Update an organization with the specified parameters. Only the parameters provided in the updateOrgRequest will be
   * updated for the organization. For example, if only the label is provided in the updateOrgRequest, then only the
   * label of the organization will be updated, and all other properties of the organization will remain unchanged.
   * @param organizationId - The ID of the organization to update.
   * @param updateOrgRequest - The parameters to update the organization with. Only the provided parameters will be
   * updated.
   * @returns The details of the updated organization.
   */
  async update(organizationId: string, updateOrgRequest?: UpdateOrgRequest): Promise<Organization> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.orgApi.updateOrg({
      organizationId,
      updateOrgRequest,
    });
  }

  /**
   * List organizations with optional filtering. The filters can be used to narrow down the list of organizations based
   * on specific criteria.
   * @param filters - Optional filters to apply to the list of organizations. This can include criteria such as
   * organization name, type, or owner ID.
   * @return A list of organizations that match the specified filters. If no filters are provided, a list of all
   * organizations accessible to the user will be returned.
   */
  async list(filters?: FilterListOrgs): Promise<ListOrgs200Response> {
    return await this.orgApi.listOrgs(filters);
  }

  /**
   * List the subscriptions for an organization. This will return a list of all active and past subscriptions associated
   * with the organization, including details such as the subscription plan, status, and billing information.
   * @param organizationId - The ID of the organization to list subscriptions for.
   * @return A list of subscriptions for the specified organization.
   */
  async listSubscriptions(organizationId: string): Promise<ListOrgSubscriptions200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.subApi.listOrgSubscriptions({ organizationId });
  }

  /**
   * Add a member to an organization with the specified permissions. This will invite the user to join the organization,
   * and the user will need to accept the invitation before they become an active member of the organization.
   * The permissions parameter can be used to specify the level of access the member will have within the organization.
   * @param organizationId - The ID of the organization to add the member to.
   * @param userId - The ID of the user to add as a member of the organization.
   * @param permissions - (Optional) The permissions to assign to the member within the organization.
   * @returns The details of the added organization member, including their user ID, assigned permissions,
   * and membership status.
   */
  async addMember(
    organizationId: string,
    userId: string,
    permissions?: Permissions,
  ): Promise<OrganizationMember> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkUserId(userId);

    return await this.membersApi.createOrgMember({
      organizationId,
      createOrgMemberRequest: { userId, permissions: permissions },
    });
  }

  /**
   * Delete a member from an organization. This will remove the user's membership from the organization, and they will
   * no longer have access to the organization's resources.
   * @param organizationId - The ID of the organization to remove the member from.
   * @param userId - The ID of the user to remove from the organization.
   */
  async deleteMember(organizationId: string, userId: string): Promise<void> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkUserId(userId);

    await this.membersApi.deleteOrgMember({ organizationId, userId });
  }

  /**
   * Get the details of an organization member by their user ID. This will return information about the member's
   * membership in the organization, including their assigned permissions and membership status.
   * @param organizationId - The ID of the organization to get the member from.
   * @param userId - The ID of the user to retrieve as a member of the organization.
   * @returns The details of the specified organization member, including their user ID, assigned permissions, and
   * membership status.
   */
  async getMember(organizationId: string, userId: string): Promise<OrganizationMember> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkUserId(userId);

    return await this.membersApi.getOrgMember({ organizationId, userId });
  }

  /**
   * List the members of an organization with optional filtering.
   * @param organizationId - The ID of the organization to list members for.
   * @param filters - Optional filters to apply to the list of members, such as filtering by user ID or permissions.
   * @returns A list of organization members that match the specified filters. If no filters are provided, a list of all
   * members of the organization will be returned.
   * @throws An error if the organization ID is invalid, if the filters are invalid, or if there is an issue with the
   * API request.
   */
  async listMembers(
    organizationId: string,
    filters?: FilterListMembers,
  ): Promise<ListOrgMembers200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.membersApi.listOrgMembers({ organizationId, ...filters });
  }

  /**
   * Update an organization member's permissions. This will modify the member's access level within the organization
   * based on the specified permissions.
   * @param organizationId - The ID of the organization to update the member in.
   * @param userId - The ID of the user whose membership is being updated.
   * @param permissions - The new permissions to assign to the member within the organization.
   * @returns The details of the updated organization member, including their user ID, assigned permissions, and
   * membership status.
   * @throws An error if the organization ID or user ID is invalid, if the permissions are invalid, or if there is an
   * issue with the API request.
   */
  async updateMember(
    organizationId: string,
    userId: string,
    permissions?: string[],
  ): Promise<OrganizationMember> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkUserId(userId);

    return await this.membersApi.updateOrgMember({
      organizationId,
      userId,
      updateOrgMemberRequest: {
        permissions: permissions,
      },
    });
  }

  /**
   * List the organizations that a user belongs to, with optional filtering. This will return a list of organizations
   * that the specified user is a member of, and the filters can be used to narrow down the list based on specific
   * criteria.
   * @param userId - The ID of the user to list organizations for.
   * @param filters - Optional filters to apply to the list of organizations.
   * @return A list of organizations that the specified user belongs to, matching the provided filters.
   *
   * @todo(@micka): check if this function needs to land in the usersTask or here?
   */
  async listUserOrgs(userId: string, filters?: FilterListUser): Promise<ListUserOrgs200Response> {
    TaskBase.checkUserId(userId);

    return await this.orgApi.listUserOrgs({ userId, ...filters });
  }

  /**
   * List organization accessible to the current user, with optional filtering.
   * This will return a list of organizations that the current user has access to, and the filters can be used to narrow
   * down the list based on specific criteria.
   * @param filters - Optional filters to apply to the list of organizations.
   * @return A list of organizations that the current user has access to, matching the provided filters.
   */
  async listCurrentUserOrgs(filters?: FilterListUser): Promise<ListUserOrgs200Response> {
    return await this.listUserOrgs((await this.client.users.me()).id, filters);
  }

  /**
   * List teams within an organization, with optional filtering. This will return a list of teams that belong to the
   * specified organization, and the filters can be used to narrow down the list based on specific criteria.
   * @param params - Optional parameters to apply to the list of teams, such as filtering by team name or member count.
   * @returns A list of teams within the organization that match the specified filters. If no filters are provided, a
   * list of all teams within the organization will be returned.
   * @throws An error if there is an issue with the API request or if the filters are invalid.
   */
  async listTeams(params?: ListTeamsRequest): Promise<ListTeams200Response> {
    return await this.client.teams.list(params || {});
  }

  /**
   * Retrieves teams that the specified user is a member of.
   * @param userId - The ID of the user to retrieve teams for.
   * @param filters - Optional filters to apply to the list of teams.
   * @returns A list of teams that the specified user is a member of, matching the provided filters.
   * @throws An error if there is an issue with the API request or if the filters are invalid.
   */
  async listTeamsByMember(
    userId: string,
    filters?: FilterListUserTeams,
  ): Promise<ListTeams200Response> {
    return await this.client.teams.listByMember(userId, filters);
  }

  /**
   * Get a project by its ID. This will return the details of the specified project.
   * @param projectId - The ID of the project to retrieve.
   * @return The details of the specified project.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async getProject(projectId: string): Promise<Project> {
    TaskBase.checkProjectId(projectId);
    
    return await this.client.projects.get(projectId);
  }

  /**
   * List projects within an organization, with optional filtering. This will return a list of projects that belong to
   * the specified organization, and the filters can be used to narrow down the list based on specific criteria.
   * @param organizationId - The ID of the organization to list projects for.
   * @param filters - Optional filters to apply to the list of projects, such as filtering by project name or region.
   * @return A list of projects within the organization that match the specified filters. If no filters are provided, a
   * list of all projects within the organization will be returned.
   * @throws An error if the organization ID is invalid, if the filters are invalid, or if there is an issue with the
   * API request.
   */
  async listProjects(
    organizationId: string,
    filters?: FilterListOrgProjects,
  ): Promise<ListOrgProjects200Response> {
    return await this.client.projects.list(organizationId, filters);
  }

  /**
   * Check if a new project can be created within the specified organization. This will return information about whether
   * the organization is eligible to create a new project, based on factors such as the organization's current
   * subscription status, project limits, and any other relevant criteria defined by the API.
   * @param organizationId - The ID of the organization to check for project creation eligibility.
   * @return A response indicating whether a new project can be created within the organization, along with any relevant
   * details or reasons if project creation is not allowed.
   * @throws An error if the organization ID is invalid, or if there is an issue with the API request.
   */
  async canCreateProject(organizationId: string): Promise<CanCreateNewOrgSubscription200Response> {
    return await this.client.projects.canCreate(organizationId);
  }

  /**
   * Create a new project within the specified organization, in the specified region, and with optional parameters such
   * as project name and subscription plan.
   * @param organizationId - The ID of the organization to create the project in.
   * @param projectRegion - The region to create the project in.
   * @param params - Optional parameters for the project creation, such as the project name and subscription plan.
   * @return The details of the created project, including its ID, name, region, and subscription information.
   * @throws An error if the organization ID is invalid, if the project region is invalid, if the parameters are
   * invalid, or if there is an issue with the API request.
   */
  async createProject(
    organizationId: string,
    projectRegion: string,
    params?: ProjectCreateRequest,
  ): Promise<Subscription> {
    return await this.client.projects.create(organizationId, projectRegion, params);
  }

  /**
   * Delete a project by its ID. This will permanently delete the project and all associated resources, so it should be
   * used with caution.
   * @param projectId - The ID of the project to delete.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async deleteProject(projectId: string): Promise<void> {
    await this.client.projects.delete(projectId);
  }

  /**
   * Estimate the cost of creating a new project within the specified organization, based on parameters such as the
   * number of environments, storage, and user licenses.
   * @param organizationId - The ID of the organization to estimate the new project for.
   * @param environments - The number of environments to include in the project (default is 3).
   * @param storage - The amount of storage to include in the project, in GB (default is 500).
   * @param userLicenses - The number of user licenses to include in the project (default is 1).
   * @param format - (Optional) The format to return the estimation in, such as "detailed" or "summary".
   * @return An estimation object containing the estimated cost and details of the new project based on the provided
   * parameters.
   */
  async estimateNewProject(
    organizationId: string,
    environments: number = 3,
    storage: number = 500,
    userLicenses: number = 1,
    format?: EstimateNewOrgSubscriptionFormatEnum,
  ): Promise<EstimationObject> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.subApi.estimateNewOrgSubscription({
      organizationId,
      environments,
      storage,
      userLicenses,
      format,
      plan: 'upsun/flexible',
    });
  }

  /**
   * Estimate the cost of a project based on its current subscription and parameters such as the number of environments,
   * storage, and user licenses. This can be used to get an estimate of the cost of the project if changes are made to
   * its resources or subscription plan.
   * @param organizationId - The ID of the organization that the project belongs to.
   * @param projectId - The ID of the project to estimate the cost for.
   * @param environments - The number of environments to include in the estimation (default is 3).
   * @param storage - The amount of storage to include in the estimation, in GB (default is 500).
   * @param userLicenses - The number of user licenses to include in the estimation (default is 1).
   * @param format - (Optional) The format to return the estimation in, such as "detailed" or "summary".
   * @return An estimation object containing the estimated cost and details of the project based on the provided
   * parameters and its current subscription.
   * @throws An error if the organization ID or project ID is invalid, if the parameters are invalid, or if there is an
   * issue with the API request.
   */
  async estimateProject(
    organizationId: string,
    projectId: string,
    environments: number = 3,
    storage: number = 500,
    userLicenses: number = 1,
    format?: EstimateNewOrgSubscriptionFormatEnum,
  ): Promise<EstimationObject> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkProjectId(projectId);

    const project = await this.getProject(projectId);
    const subscriptionId = TaskBase.extractSubscriptionId(project.subscription.licenseUri);
    TaskBase.checkSubscriptionId(subscriptionId);

    return await this.subApi.estimateOrgSubscription({
      organizationId,
      subscriptionId,
      plan: 'upsun/flexible',
      environments,
      storage,
      userLicenses,
      format,
    });
  }

  /**
   * Get the current usage of a project based on its subscription, including details such as the number of environments,
   * storage used, and user licenses in use. This can be used to monitor the project's resource usage and ensure it
   * stays within the allocated limits.
   * @param organizationId - The ID of the organization that the project belongs to.
   * @param projectId - The ID of the project to get the usage for.
   * @param usageGroups - (Optional) Specific usage groups to include in the response, such as "environments",
   * "storage", or "userLicenses".
   * @param includeNotCharged - (Optional) Whether to include usage that is not currently being charged for in the
   * response.
   * @return An object containing the current usage details of the project based on its subscription, including metrics
   * such as the number of environments, storage used, and user licenses in use.
   * @throws An error if the organization ID or project ID is invalid, if the parameters are invalid, or if there is an
   * issue with the API request.
   */
  async getProjectUsage(
    organizationId: string,
    projectId: string,
    usageGroups?: string,
    includeNotCharged?: boolean,
  ): Promise<SubscriptionCurrentUsageObject> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkProjectId(projectId);

    const project = await this.getProject(projectId);
    const subscriptionId = TaskBase.extractSubscriptionId(project.subscription.licenseUri);
    TaskBase.checkSubscriptionId(subscriptionId);

    return await this.subApi.getOrgSubscriptionCurrentUsage({
      organizationId,
      subscriptionId,
      usageGroups,
      includeNotCharged,
    });
  }

  /**
   * Disable MFA enforcement for an organization. This will allow members of the organization to log in without being
   * required to use multi-factor authentication (MFA). This should be used with caution, as it can reduce the security
   * of the organization.
   * @param organizationId - The ID of the organization to disable MFA enforcement for.
   * @throws An error if the organization ID is invalid, or if there is an issue with the API request.
   */
  async disableMfaEnforcement(organizationId: string): Promise<void> {
    TaskBase.checkOrganizationId(organizationId);

    await this.mfaApi.disableOrgMfaEnforcement({ organizationId });
  }

  /**
   * Enable MFA enforcement for an organization. This will require all members of the organization to use multi-factor
   * authentication (MFA) when logging in, which can enhance the security of the organization.
   * @param organizationId - The ID of the organization to enable MFA enforcement for.
   * @throws An error if the organization ID is invalid, or if there is an issue with the API request.
   */
  async enableMfaEnforcement(organizationId: string): Promise<void> {
    TaskBase.checkOrganizationId(organizationId);

    await this.mfaApi.enableOrgMfaEnforcement({ organizationId });
  }

  /**
   * Get the current MFA enforcement status for an organization. This will return information about whether MFA
   * enforcement is enabled or disabled.
   * @param organizationId - The ID of the organization to get the MFA enforcement status for.
   * @return An object containing the current MFA enforcement status for the organization, indicating whether MFA
   * enforcement is enabled or disabled.
   * @throws An error if the organization ID is invalid, or if there is an issue with the API request.
   */
  async getMfaEnforcement(organizationId: string): Promise<OrganizationMfaEnforcement> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.mfaApi.getOrgMfaEnforcement({ organizationId });
  }

  /**
   * Send MFA reminders to specified users within an organization. This can be used to prompt users to set up or use MFA
   * if MFA enforcement is enabled for the organization and some users have not yet set up MFA or are not using it.
   * @param organizationId - The ID of the organization to send MFA reminders for.
   * @param userIds - A list of user IDs to send MFA reminders to. These should be users who are members of the
   * organization and are expected to use MFA based on the organization's MFA enforcement settings.
   * @throws An error if the organization ID is invalid, if the user IDs are invalid, or if there is an issue with the
   * API request.
   */
  async sendMfaReminders(organizationId: string, userIds?: string[]): Promise<void> {
    TaskBase.checkOrganizationId(organizationId);

    await this.mfaApi.sendOrgMfaReminders({
      organizationId,
      sendOrgMfaRemindersRequest: {
        userIds,
      },
    });
  }

  /**
   * Get the details of an invoice by its ID for a specific organization. This will return information about the
   * invoice, including the invoice amount, status, billing period, and any associated order or subscription details.
   * @param invoiceId - The ID of the invoice to retrieve.
   * @param organizationId - The ID of the organization that the invoice belongs to.
   * @return The details of the specified invoice for the organization.
   * @throws An error if the invoice ID or organization ID is invalid, or if there is an issue with the API request.
   */
  async getInvoice(invoiceId: string, organizationId: string): Promise<Invoice> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkInvoiceId(invoiceId);

    return await this.invApi.getOrgInvoice({ invoiceId, organizationId });
  }

  /**
   * List the invoices for a specific organization, with optional filtering by status, type, or associated order ID.
   * This will return a paginated list of invoices matching the specified criteria.
   * @param organizationId - The ID of the organization to list invoices for.
   * @param filterStatus - (Optional) Filter invoices by their status, such as "paid", "unpaid", "overdue", etc.
   * @param filterType - (Optional) Filter invoices by their type, such as "subscription", "one-time", etc.
   * @param filterOrderId - (Optional) Filter invoices by the associated order ID, to get invoices related to a specific
   * order.
   * @param page - (Optional) The page number to retrieve for paginated results (default is 1).
   * @return A paginated list of invoices for the specified organization that match the provided filters.
   * If no filters are provided, all invoices for the organization will be returned.
   * @throws An error if the organization ID is invalid, if the filters are invalid, or if there is an issue with the
   * API request.
   */
  async listInvoices(
    organizationId: string,
    filterStatus?: ListOrgInvoicesFilterStatusEnum,
    filterType?: ListOrgInvoicesFilterTypeEnum,
    filterOrderId?: string,
    page?: number,
  ): Promise<ListOrgInvoices200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.invApi.listOrgInvoices({
      organizationId,
      filterStatus,
      filterType,
      filterOrderId,
      page,
    });
  }

  //TODO manage binaryResponse (blob?)
  /**
   * {{#responses}}
      {{#isBinary}}
        async {{operationId}}({{params}}): Promise<ArrayBuffer> {
          const response = await this.request({ ... });
          return await response.arrayBuffer();
        }
      {{/isBinary}}
      {{^isBinary}}
        async {{operationId}}({{params}}): Promise<{{returnType}}> {
          // ...code normal...
        }
      {{/isBinary}}
    {{/responses}}
   */
  async downloadInvoice(token: string): Promise<string> {
    throw new Error('Method not implemented.');
    //return await this.ordApi.downloadInvoice({ token });
  }

  /**
   * Create authorization credentials for a specific order within an organization. This will return credentials that
   * can be used to authorize actions related to the order.
   * @param organizationId - The ID of the organization that the order belongs to.
   * @param orderId - The ID of the order to create authorization credentials for.
   * @return The created authorization credentials for the specified order within the organization.
   * @throws An error if the organization ID or order ID is invalid, or if there is an issue with the API request.
   */
  async createAuthorizationCredentials(
    organizationId: string,
    orderId: string,
  ): Promise<CreateAuthorizationCredentials200Response> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkOrderId(orderId);

    return await this.ordApi.createAuthorizationCredentials({
      organizationId,
      orderId,
    });
  }

  /**
   * Get the details of an order by its ID for a specific organization. This will return information about the order,
   * including the order status, items, total amount, and any associated invoice or subscription details.
   * @param organizationId - The ID of the organization that the order belongs to.
   * @param orderId - The ID of the order to retrieve.
   * @param mode - (Optional) The mode to retrieve the order in, which can affect the level of detail or format of the
   * returned order information.
   * @return The details of the specified order for the organization.
   * @throws An error if the organization ID or order ID is invalid, or if there is an issue with the API request.
   */
  async getOrder(
    organizationId: string,
    orderId: string,
    mode?: GetOrgOrderModeEnum,
  ): Promise<Order> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkOrderId(orderId);

    return await this.ordApi.getOrgOrder({ organizationId, orderId, mode });
  }

  /**
   * List the orders for a specific organization, with optional filtering by order status, date range, or associated
   * subscription ID. This will return a paginated list of orders matching the specified criteria.
   * @param organizationId - The ID of the organization to list orders for.
   * @param filterStatus - (Optional) Filter orders by their status, such as "pending", "completed", "canceled", etc.
   * @param filterStartDate - (Optional) Filter orders by a start date, to get orders created on or after this date.
   * @param filterEndDate - (Optional) Filter orders by an end date, to get orders created on or before this date.
   * @param filterSubscriptionId - (Optional) Filter orders by the associated subscription ID, to get orders related to a
   * specific subscription.
   * @param page - (Optional) The page number to retrieve for paginated results (default is 1).
   * @return A paginated list of orders for the specified organization that match the provided filters. If no filters
   * are provided, all orders for the organization will be returned.
   * @throws An error if the organization ID is invalid, if the filters are invalid, or if there is an issue with the
   * API request.
   */
  async listOrders(
    organizationId: string,
    filters?: FilterListOrders,
  ): Promise<ListOrgOrders200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.ordApi.listOrgOrders({ organizationId, ...filters });
  }

  /**
   * Get the address details for a specific organization. This will return information about the organization's address,
   * including fields such as street, city, state, postal code, and country.
   * @param organizationId - The ID of the organization to get the address for.
   * @return The address details for the specified organization.
   * @throws An error if the organization ID is invalid, or if there is an issue with the API request.
   */
  async getAddress(organizationId: string): Promise<Address> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.profApi.getOrgAddress({ organizationId });
  }

  /**
   * Get the profile details for a specific organization. This will return information about the organization's profile,
   * including fields such as name, description, contact information, and other relevant details.
   * @param organizationId - The ID of the organization to get the profile for.
   * @return The profile details for the specified organization.
   * @throws An error if the organization ID is invalid, or if there is an issue with the API request.
   */
  async getProfile(organizationId: string): Promise<Profile> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.profApi.getOrgProfile({ organizationId });
  }

  /**
   * Update the address details for a specific organization. This will modify the organization's address information
   * based on the provided address object.
   * @param organizationId - The ID of the organization to update the address for.
   * @param address - The new address details to update for the organization, including fields such as street, city,
   * state, postal code, and country.
   * @return The updated address details for the organization after the update is applied.
   * @throws An error if the organization ID is invalid, if the address details are invalid, or if there is an issue
   * with the API request.
   */
  async updateAddress(organizationId: string, address?: Address): Promise<Address> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.profApi.updateOrgAddress({ organizationId, address });
  }

  /**
   * Update the profile details for a specific organization. This will modify the organization's profile information
   * based on the provided profile object.
   * @param organizationId - The ID of the organization to update the profile for.
   * @param profile - The new profile details to update for the organization, including fields such as name,
   * description, contact information, and other relevant details.
   * @return The updated profile details for the organization after the update is applied.
   * @throws An error if the organization ID is invalid, if the profile details are invalid, or if there is an issue
   * with the API request.
   */
  async updateProfile(organizationId: string, profile?: UpdateOrgProfileRequest): Promise<Profile> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.profApi.updateOrgProfile({
      organizationId,
      updateOrgProfileRequest: profile,
    });
  }

  /**
   * List the plan records for a specific organization, with optional filtering by date range, record type, or
   * associated subscription ID. This will return a paginated list of plan records matching the specified criteria.
   * @param organizationId - The ID of the organization to list plan records for.
   * @param filters - Optional filters to apply to the list of plan records, such as filtering by date range, record
   * type, or associated subscription ID.
   * @return A paginated list of plan records for the specified organization that match the provided filters. If no
   * filters are provided, all plan records for the organization will be returned.
   * @throws An error if the organization ID is invalid, if the filters are invalid, or if there is an issue with the
   * API request.
   */
  async listRecords(
    organizationId: string,
    filters?: FilterListPlanRecords,
  ): Promise<ListOrgPlanRecords200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.recApi.listOrgPlanRecords({ organizationId, ...filters });
  }

  /**
   * List the usage records for a specific organization, with optional filtering by date range, usage type, or
   * associated subscription ID. This will return a paginated list of usage records matching the specified criteria.
   * @param organizationId - The ID of the organization to list usage records for.
   * @param filters - Optional filters to apply to the list of usage records, such as filtering by date range, usage
   * type, or associated subscription ID.
   * @return A paginated list of usage records for the specified organization that match the provided filters. If no
   * filters are provided, all usage records for the organization will be returned.
   * @throws An error if the organization ID is invalid, if the filters are invalid, or if there is an issue with the
   * API request.
   */
  async listUsageRecords(
    organizationId: string,
    filters?: FilterListUsageRecords,
  ): Promise<ListOrgPlanRecords200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.recApi.listOrgUsageRecords({ organizationId, ...filters });
  }

  /**
   * Apply a voucher code to an organization. This will attempt to apply the specified voucher code to the
   * organization's account, which may result in discounts, credits, or other benefits being applied to the
   * organization's subscription.
   * @param organizationId - The ID of the organization to apply the voucher to.
   * @param code - The voucher code to apply to the organization. This should be a valid voucher code that is eligible
   * for use.
   * @throws An error if the organization ID is invalid, if the voucher code is invalid or ineligible, or if there is
   * an issue with the API request.
   */
  async applyVoucher(organizationId: string, code: string): Promise<void> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkVoucherCode(code);

    await this.vouchApi.applyOrgVoucher({
      organizationId,
      applyOrgVoucherRequest: { code: code },
    });
  }

  /**
   * List the vouchers that have been applied to an organization. This will return a list of vouchers that are currently
   * applied to the organization's account, along with details about each voucher such as the code, discount amount,
   * expiration date, and any associated benefits or restrictions.
   * @param organizationId - The ID of the organization to list vouchers for.
   * @return A list of vouchers that have been applied to the specified organization, including details about each
   * voucher.
   * @throws An error if the organization ID is invalid, or if there is an issue with the API request.
   */
  async listVouchers(organizationId: string): Promise<ListOrgSubscriptions200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.vouchApi.listOrgVouchers({ organizationId });
  }

  /**
   * Get the add-ons that are currently enabled for a specific organization. This will return a list of add-ons that are
   * currently active for the organization, along with details about each add-on such as its name, description, and any
   * associated benefits or features that it provides to the organization.
   * @param organizationId - The ID of the organization to get add-ons for.
   * @return A list of add-ons that are currently enabled for the specified organization, including details about each
   * add-on.
   * @throws An error if the organization ID is invalid, or if there is an issue with the API request.
   */
  async getAddons(organizationId: string): Promise<OrganizationAddonsObject> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.addOnsApi.getOrgAddons({ organizationId });
  }

  /**
   * Update the add-ons for a specific organization. This will modify the organization's enabled add-ons based on the
   * provided add-ons object, which may include enabling new add-ons or disabling existing ones. The response will
   * return the updated list of add-ons that are currently enabled for the organization after the update is applied.
   * @param organizationId - The ID of the organization to update add-ons for.
   * @param addons - The add-ons details to update for the organization, including which add-ons to enable or disable.
   * @return The updated list of add-ons that are currently enabled for the organization after the update is applied.
   * @throws An error if the organization ID is invalid, if the add-ons details are invalid, or if there is an issue
   * with the API request.
   */
  async updateAddons(
    organizationId: string,
    addons?: UpdateOrgAddonsRequest,
  ): Promise<OrganizationAddonsObject> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.addOnsApi.updateOrgAddons({ organizationId, updateOrgAddonsRequest: addons || {} });
  }
}
