import { UpsunClient } from '../../upsun.js';
import { ProjectApi, SubscriptionsApi } from '../../api/index.js';
import {
  AcceptedResponse,
  CanCreateNewOrgSubscription200Response,
  ListOrgSubscriptions200Response,
  Project,
  Subscription,
} from '../../model/index.js';
import { TaskBase } from './task_base.js';

export class ProjectsTask extends TaskBase {
  private prjApi: ProjectApi;
  private subApi: SubscriptionsApi;

  constructor(protected readonly client: UpsunClient) {
    super(client);

    this.prjApi = new ProjectApi(this.client.apiConfig);
    this.subApi = new SubscriptionsApi(this.client.apiConfig);
  }

  async clearBuildCache(projectId: string): Promise<AcceptedResponse> {
    return await this.prjApi.actionProjectsClearBuildCache({ projectId });
  }

  async create(
    organizationId: string,
    projectRegion: string,
    projectTitle: string,
    plan: string = 'upsun/flexible',
    defaultBranch: string = 'main',
    environmentCount: number = 2,
    storage: number = 5,
  ): Promise<Subscription> {
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
  async list(organizationId: string): Promise<ListOrgSubscriptions200Response> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.subApi.listOrgSubscriptions({ organizationId });
  }
}
