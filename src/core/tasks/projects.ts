import { UpsunClient } from '../../upsun.js';
import { ListOrgSubscriptionsFilterStatusEnum, ProjectApi, SubscriptionsApi } from '../../api/index.js';
import {
  AcceptedResponse,
  CanCreateNewOrgSubscription200Response,
  DateTimeFilter,
  Project,
  StringFilter,
  Subscription,
} from '../../model/index.js';
import { TaskBase } from './task_base.js';

export interface FilterListOrgProjects {
  filterStatus?: ListOrgSubscriptionsFilterStatusEnum;
  filterId?: StringFilter;
  filterProjectId?: StringFilter;
  filterProjectTitle?: StringFilter;
  filterRegion?: StringFilter;
  filterUpdatedAt?: DateTimeFilter;
  pageSize?: number;
  pageBefore?: string;
  pageAfter?: string;
  sort?: string;
}

export class ProjectsTask extends TaskBase {
  
  constructor(
    protected readonly client: UpsunClient,
    private prjApi: ProjectApi,
    private subApi: SubscriptionsApi,
  ) {
    super(client);
  }

  async clearBuildCache(projectId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);

    return await this.prjApi.actionProjectsClearBuildCache({ projectId });
  }

  async create(
    organizationId: string,
    projectRegion: string,
    plan: string = 'upsun/flexible',
    projectTitle?: string,
    defaultBranch?: string,
    environmentCount?: number,
    storage?: number,
  ): Promise<Subscription> {
    TaskBase.checkOrganizationId(organizationId);
    
    return await this.subApi.createOrgSubscription({
      organizationId,
      createOrgSubscriptionRequest: {
        plan,
        projectRegion,
        projectTitle,
        defaultBranch,
        environments: environmentCount,
        storage,
      },
    });
  }

  async canCreate(organizationId: string): Promise<CanCreateNewOrgSubscription200Response> {
    return await this.subApi.canCreateNewOrgSubscription({ organizationId });
  }

  async delete(projectId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    
    const project = await this.prjApi.getProjects({ projectId });

    const subscriptionId = TaskBase.extractSubscriptionId(project.subscription.licenseUri);
    TaskBase.checkSubscriptionId(subscriptionId);

    return await this.subApi.deleteOrgSubscription({ organizationId: project.organization as string, subscriptionId });
  }

  async get(projectId: string): Promise<Project> {
    TaskBase.checkProjectId(projectId);

    return await this.prjApi.getProjects({ projectId });
  }

  async getSubscription(organizationId: string, subscriptionId: string): Promise<Subscription> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkSubscriptionId(subscriptionId);

    return await this.subApi.getOrgSubscription({ organizationId, subscriptionId });
  }

  async info(projectId: string): Promise<Project> {
    TaskBase.checkProjectId(projectId);

    return await this.prjApi.getProjects({ projectId });
  }

  //TODO missing from PHP SDK
  //TODO change to return list of projects instead of subscriptions
  //TODO do we return ListOrgSubscriptions200Response or Project[]
  async list(
    organizationId: string,
    filters?: FilterListOrgProjects,
  ): Promise<Project[]> {
    TaskBase.checkOrganizationId(organizationId);

    const subscriptions = await this.subApi.listOrgSubscriptions({ organizationId, ...filters });
    return Promise.all((subscriptions.items ?? []).map(subscription => this.client.projects.get(subscription.id!)));

  }
}
