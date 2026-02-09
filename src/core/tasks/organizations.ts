import {
  AddOnsApi,
  CreateOrgOperationRequest,
  EstimateNewOrgSubscriptionFormatEnum,
  GetOrgOrderModeEnum,
  InvoicesApi,
  ListOrgInvoicesFilterStatusEnum,
  ListOrgInvoicesFilterTypeEnum,
  ListOrgOrdersFilterStatusEnum,
  ListOrgOrdersModeEnum,
  ListOrgPlanRecordsFilterPlanEnum,
  ListOrgPlanRecordsFilterStatusEnum,
  ListOrgsRequest,
  ListOrgUsageRecordsFilterUsageGroupEnum,
  ListTeamsRequest,
  ListUserTeamsSortEnum,
  MfaApi,
  OrdersApi,
  OrganizationMembersApi,
  OrganizationProjectsApi,
  OrganizationsApi,
  ProfilesApi,
  RecordsApi,
  SubscriptionsApi,
  VouchersApi,
} from '../../api/index.js';
import { Address, CanCreateNewOrgSubscription200Response, CreateAuthorizationCredentials200Response, CreateOrgMemberRequest, EstimationObject, Invoice, ListOrgInvoices200Response, ListOrgMembers200Response, ListOrgOrders200Response, ListOrgPlanRecords200Response, ListOrgs200Response, ListOrgSubscriptions200Response, ListTeams200Response, ListUserOrgs200Response, Order, Organization, OrganizationAddonsObject, OrganizationMember, OrganizationMfaEnforcement, Profile, Project, Subscription, SubscriptionCurrentUsageObject, UpdateOrgAddonsRequest, UpdateOrgProfileRequest, UpdateOrgRequest } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';
import { StringFilter } from '../../model/StringFilter.js';
import { ArrayFilter } from '../../model/ArrayFilter.js';
import { DateTimeFilter } from '../../model/DateTimeFilter.js';
import { FilterListOrgProjects } from './projects.js';

export interface FilterListUserOrgs {
  filterId?: StringFilter;
  filterType?: StringFilter;
  filterVendor?: StringFilter;
  filterStatus?: StringFilter;
  filterUpdatedAt?: DateTimeFilter;
  pageSize?: number;
  pageBefore?: string;
  pageAfter?: string;
  sort?: string;
}

export interface FilterListOrgMembers {
  filterPermissions?: ArrayFilter;
  pageSize?: number;
  pageBefore?: string;
  pageAfter?: string;
  sort?: string;
}

export interface FilterListUserTeams {
  filterOrganizationId?: StringFilter;
  filterUpdatedAt?: DateTimeFilter;
  pageSize?: number;
  pageBefore?: string;
  pageAfter?: string;
  sort?: ListUserTeamsSortEnum;
}

export interface FilterListOrgOrders {
  filterStatus?: ListOrgOrdersFilterStatusEnum;
  filterTotal?: number;
  page?: number;
  mode?: ListOrgOrdersModeEnum;
}

export interface FilterListOrgPlanRecords {
  filterSubscriptionId?: string;
  filterPlan?: ListOrgPlanRecordsFilterPlanEnum;
  filterStatus?: ListOrgPlanRecordsFilterStatusEnum;
  filterStart?: Date;
  filterEnd?: Date;
  filterStartedAt?: Date;
  filterEndedAt?: Date;
  page?: number;
}

export interface FilterListOrgUsageRecords {
  filterSubscriptionId?: string;
  filterUsageGroup?: ListOrgUsageRecordsFilterUsageGroupEnum;
  filterStart?: Date;
  filterStartedAt?: Date;
  page?: number;
}

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

  async create(
    label: string,
    type?: string,
    ownerId?: string,
    name?: string,
    country?: string,
  ): Promise<Organization> {
    return await this.orgApi.createOrg({
      createOrgRequest: { 
        label: label, 
        type: type, 
        ownerId: ownerId, 
        name: name, 
        country: country
      },
    } as CreateOrgOperationRequest);
  }

  async delete(organizationId: string): Promise<void> {
    return await this.orgApi.deleteOrg({ organizationId });
  }

  //TODO Shortcut for get or update, depending on the presence of parameters to update
  // may disappear in the future in favor of explicit get and update calls, but it can be convenient for now to avoid an additional call when we want to update an org
  async info(
    organizationId: string,
    updateOrgRequest?: UpdateOrgRequest
  ): Promise<Organization> {
    if (updateOrgRequest && (updateOrgRequest.country || updateOrgRequest.label || updateOrgRequest.name || updateOrgRequest.securityContact)) {
      return await this.update(
        organizationId, 
        updateOrgRequest
      );
    } else {
      return await this.get(organizationId);
    }
  }

  async get(organizationId: string): Promise<Organization> {
    return await this.orgApi.getOrg({ organizationId });
  }

  async update(
    organizationId: string, 
    updateOrgRequest: UpdateOrgRequest
  ): Promise<Organization> {
    return await this.orgApi.updateOrg({
      organizationId,
      updateOrgRequest
    });
  }

  async list( filters?: ListOrgsRequest): Promise<ListOrgs200Response> {
    return await this.orgApi.listOrgs(filters || {});
  }

  async listSubscriptions(organizationId: string): Promise<ListOrgSubscriptions200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.subApi.listOrgSubscriptions({ organizationId });
  }

  async addMember(
    organizationId: string,
    createOrgMemberRequest: CreateOrgMemberRequest,
  ): Promise<OrganizationMember> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkUserId(createOrgMemberRequest.userId);

    return await this.membersApi.createOrgMember({
      organizationId,
      createOrgMemberRequest
    });
  }

  async deleteMember(organizationId: string, userId: string): Promise<void> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkUserId(userId);

    await this.membersApi.deleteOrgMember({
      organizationId,
      userId,
    });
  }
  async getMember(organizationId: string, userId: string): Promise<OrganizationMember> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkUserId(userId);

    return await this.membersApi.getOrgMember({
      organizationId,
      userId,
    });
  }

  async listMembers(organizationId: string, filters?: FilterListOrgMembers): Promise<ListOrgMembers200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.membersApi.listOrgMembers({ organizationId, ...filters });
  }

  async listUserOrgs(
    userId: string,
    filters?: FilterListUserOrgs
  ): Promise<ListUserOrgs200Response> {
    TaskBase.checkUserId(userId);

    return await this.orgApi.listUserOrgs(
      { userId, ...filters }
    );
  }

  async listCurrentUserOrgs(
    filters?: FilterListUserOrgs
  ): Promise<ListUserOrgs200Response> {
    return await this.listUserOrgs(
      (await this.client.users.me()).id,
      filters
    );
  }

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
      }
    });
  }

  //TODO Additional methods for organization projects and members management, and subscription estimation and creation, are implemented below for convenience, but they could be moved to specific tasks if needed (ex: OrganizationProjectsTask, OrganizationMembersTask, SubscriptionsTask)
  
  async listTeams(
    params?: ListTeamsRequest
  ): Promise<ListTeams200Response> {
    TaskBase.checkOrganizationId(
      params?.filterOrganizationId ? params.filterOrganizationId.eq || '' : ''
    );
    return await this.client.teams.list(params || {});
  }

  async listUserTeams(
    userId: string,
    filters?: FilterListUserTeams
  ): Promise<ListTeams200Response> {
    TaskBase.checkUserId(userId);
    
    return await this.client.teams.listUserTeams({ userId, ...filters });
  }

  async getProject( organizationId: string, projectId: string ): Promise<Project> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkProjectId(projectId);

    return await this.client.projects.get(projectId);
  }

  async listProjects(
    organizationId: string,
    filters?: FilterListOrgProjects
  ): Promise<Project[]> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.client.projects.list(organizationId, filters);
  }

  async canCreateProject(organizationId: string): Promise<CanCreateNewOrgSubscription200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.client.projects.canCreate(organizationId);
  }

  async createProject(
    organizationId: string,
    projectRegion: string,
    projectTitle: string,
    plan: string = 'upsun/flexible',
    defaultBranch: string = 'main',
    environmentCount: number = 2,
    storage: number = 5,
  ): Promise<Subscription> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.client.projects.create(
      organizationId,
      projectRegion,
      projectTitle,
      plan,
      defaultBranch,
      environmentCount,
      storage
    );
  }

  async deleteProject(projectId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);

    await this.client.projects.delete(projectId);
  }

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
      plan: 'upsun/flexible'
    });
  }

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

    const project = await this.getProject(organizationId, projectId);
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

  async getProjectUsage(
    organizationId: string,
    projectId: string,
    usageGroups?: string,
    includeNotCharged?: boolean,
  ): Promise<SubscriptionCurrentUsageObject> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkProjectId(projectId);

    const project = await this.getProject(organizationId, projectId);
    const subscriptionId = TaskBase.extractSubscriptionId(project.subscription.licenseUri);
    TaskBase.checkSubscriptionId(subscriptionId);

    return await this.subApi.getOrgSubscriptionCurrentUsage({
      organizationId,
      subscriptionId,
      usageGroups,
      includeNotCharged,
    });
  }

  async disableMfaEnforcement(organizationId: string): Promise<void> {
    TaskBase.checkOrganizationId(organizationId);

    await this.mfaApi.disableOrgMfaEnforcement({ organizationId });
  }

  async enableMfaEnforcement(organizationId: string): Promise<void> {
    TaskBase.checkOrganizationId(organizationId);

    await this.mfaApi.enableOrgMfaEnforcement({ organizationId });
  }

  async getMfaEnforcement(organizationId: string): Promise<OrganizationMfaEnforcement> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.mfaApi.getOrgMfaEnforcement({ organizationId });
  }

  async sendMfaReminders(organizationId: string, userIds: string[]): Promise<void> {
    TaskBase.checkOrganizationId(organizationId);

    await this.mfaApi.sendOrgMfaReminders({ 
      organizationId, 
      sendOrgMfaRemindersRequest: {
        userIds 
      }
    });
  }

  async getInvoice(invoiceId: string, organizationId: string): Promise<Invoice> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkInvoiceId(invoiceId);
    
    return await this.invApi.getOrgInvoice({ invoiceId, organizationId });
  }

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

  async getOrder(organizationId: string, orderId: string, mode?: GetOrgOrderModeEnum): Promise<Order> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkOrderId(orderId);

    return await this.ordApi.getOrgOrder({ organizationId, orderId, mode });
  }

  async listOrders(
    organizationId: string, 
    filters: FilterListOrgOrders,
  ): Promise<ListOrgOrders200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.ordApi.listOrgOrders({ organizationId, ...filters });
  }

  async getAddress(organizationId: string): Promise<Address> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.profApi.getOrgAddress({ organizationId });
  }

  async getProfile(organizationId: string): Promise<Profile> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.profApi.getOrgProfile({ organizationId });
  }

  async updateAddress(
    organizationId: string,
    address: Address,
  ): Promise<Address> {
    TaskBase.checkOrganizationId(organizationId);
    
    return await this.profApi.updateOrgAddress({
      organizationId,
      address,
    });
  }
  
  async updateProfile(
    organizationId: string,
    profile?: UpdateOrgProfileRequest,
  ): Promise<Profile> {
    TaskBase.checkOrganizationId(organizationId);
    
    return await this.profApi.updateOrgProfile({
      organizationId,
      updateOrgProfileRequest: profile,
    });
  }

  async listRecords(
    organizationId: string,
    filters: FilterListOrgPlanRecords,
  ): Promise<ListOrgPlanRecords200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.recApi.listOrgPlanRecords({ organizationId, ...filters });
  }

  async listUsageRecords(
    organizationId: string,
    filters: FilterListOrgUsageRecords,
  ): Promise<ListOrgPlanRecords200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.recApi.listOrgUsageRecords({ organizationId, ...filters });
  }
  
  async applyVoucher(organizationId: string, code: string): Promise<void> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkVoucherCode(code);
    
    await this.vouchApi.applyOrgVoucher({ 
      organizationId, 
      applyOrgVoucherRequest: {code: code} }
    );
  }

  async listVouchers(organizationId: string): Promise<ListOrgSubscriptions200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.vouchApi.listOrgVouchers({ organizationId });
  }

  async getAddons(organizationId: string): Promise<OrganizationAddonsObject> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.addOnsApi.getOrgAddons({ organizationId });
  }

  async updateAddons(
    organizationId: string, 
    addons: UpdateOrgAddonsRequest
  ): Promise<OrganizationAddonsObject> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.addOnsApi.updateOrgAddons({ organizationId, updateOrgAddonsRequest: addons });
  }
}