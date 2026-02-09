import {
  AddOnsApi,
  CreateOrgOperationRequest,
  EstimateNewOrgSubscriptionFormatEnum,
  InvoicesApi,
  ListOrgsRequest,
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
import { CanCreateNewOrgSubscription200Response, EstimationObject, ListOrgMembers200Response, ListOrgs200Response, ListTeams200Response, ListUserOrgs200Response, Organization, OrganizationMember, OrganizationProject, Project, Subscription } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';
import { StringFilter } from '../../model/StringFilter.js';
import { ArrayFilter } from '../../model/ArrayFilter.js';
import { DateTimeFilter } from '../../model/DateTimeFilter.js';

export interface ListUserOrgsRequest {
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

export class OrganizationsTask extends TaskBase {
  
  constructor(
    protected readonly client: UpsunClient,
    private orgApi: OrganizationsApi,
    private orgProjApi: OrganizationProjectsApi,
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

  //TODO get function in SDK PHP
  async info(organizationId: string): Promise<Organization> {
    return await this.orgApi.getOrg({ organizationId });
  }

  //TODO see how to handle filters as array
  // filterId?: string[], filterType?: string[], filterOwnerId?: string[], filterName?: string[], filterLabel?: string[], filterVendor?: string[], filterCapabilities?: string[], filterStatus?: string[], filterUpdatedAt?: Date[]
  async list( params?: ListOrgsRequest): Promise<ListOrgs200Response> {
    return await this.orgApi.listOrgs(params || {});
  }

  //TODO see how to handle filters as array
  async listUserOrgs(
    userId: string,
    params?: ListUserOrgsRequest
  ): Promise<ListUserOrgs200Response> {
    TaskBase.checkUserId(userId);

    return await this.orgApi.listUserOrgs(
      { userId, ...params }
    );
  }

  async listCurrentUserOrgs(
    filterId?: StringFilter,
    filterType?: StringFilter,
    filterVendor?: StringFilter,
    filterStatus?: StringFilter,
    filterUpdatedAt?: DateTimeFilter,
    pageSize?: number,
    pageBefore?: string,
    pageAfter?: string,
    sort?: string,
  ): Promise<ListUserOrgs200Response> {
    return await this.listUserOrgs(
      (await this.client.users.me()).id,
      filterId,
      filterType,
      filterVendor,
      filterStatus,
      filterUpdatedAt,
      pageSize,
      pageBefore,
      pageAfter,
      sort
    );
  }

  async update(organizationId: string, label?: string, name?: string, country?: string, securityContact?: string): Promise<Organization> {
    return await this.orgApi.updateOrg({
      organizationId,
      updateOrgRequest: {
        label: label,
        name: name,
        country: country,
        securityContact: securityContact
      }
    });
  }

  async listTeams(
    organizationId: string,
    filterId?: StringFilter,
    filterUpdatedAt?: DateTimeFilter,
    pageSize?: number,
    pageBefore?: string,
    pageAfter?: string,
    sort?: string,
  ): Promise<ListTeams200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.client.teams.list(
      organizationId ? ['eq', organizationId] as StringFilter : undefined,
      filterId,
      filterUpdatedAt,
      pageSize,
      pageBefore,
      pageAfter,
      sort
    );
  }

  async listUserTeams(
    userId: string,
    organizationId?: StringFilter,
    filterUpdatedAt?: DateTimeFilter,
    pageSize?: number,
    pageBefore?: string,
    pageAfter?: string,
    sort?: string,
  ): Promise<ListTeams200Response> {
    TaskBase.checkUserId(userId);
    
    return await this.client.teams.listUserTeams(
      userId,
      organizationId,
      filterUpdatedAt,
      pageSize,
      pageBefore,
      pageAfter,
      sort
    );
  }

  async getProject( organizationId: string, projectId: string ): Promise<Project> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkProjectId(projectId);

    return await this.client.projects.get(projectId);
  }

  /**
   * TODO add filters for projects list (id, title, region, updatedAt) and pagination
   * @param organizationId 
   * @param filterId 
   * @param filterTitle 
   * @param filterRegion 
   * @param filterUpdatedAt 
   * @param pageSize 
   * @param pageBefore 
   * @param pageAfter 
   * @param sort 
   * 
   filterId?: StringFilter, 
   filterTitle?: StringFilter, 
   filterRegion?: StringFilter, 
   filterUpdatedAt?: DateTimeFilter, 
   pageSize?: number, 
   pageBefore?: string, 
   pageAfter?: string, 
   sort?: string 
   */
  async listProjects(
    organizationId: string, 
  ): Promise<Project[]> {
    TaskBase.checkOrganizationId(organizationId);

    const projects = await this.client.projects.list(organizationId);
    return Promise.all((projects.items ?? []).map(project => this.client.projects.get(project.id!)));
  }

  async createMember(
    organizationId: string,
    userId: string,
    permissions?: string[],
  ): Promise<OrganizationMember> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkUserId(userId);

    return await this.membersApi.createOrgMember({
      organizationId,
      createOrgMemberRequest: {
        userId: userId,
        permissions: permissions,
      }
    });
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

  async getMember(organizationId: string, userId: string): Promise<OrganizationMember> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkUserId(userId);

    return await this.membersApi.getOrgMember({
      organizationId,
      userId,
    });
  }

  async listMembers(
    organizationId: string,
    filterPermissions?: ArrayFilter,
    pageSize?: number,
    pageBefore?: string,
    pageAfter?: string,
    sort?: string,
  ): Promise<ListOrgMembers200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.membersApi.listOrgMembers({ 
      organizationId: organizationId,
      filterPermissions: filterPermissions,
      pageSize: pageSize,
      pageBefore: pageBefore,
      pageAfter: pageAfter,
      sort: sort
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
    environment: number = 3,
    storage: number = 500,
    userLicenses: number = 1,
    format?: EstimateNewOrgSubscriptionFormatEnum,
  ): Promise<EstimationObject> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.subApi.estimateNewOrgSubscription({
      organizationId,
      environments: environment,
      storage: storage,
      userLicenses: userLicenses,
      format: format,
      plan: 'upsun/flexible'
    });
  }
}