import { EnvironmentActivityApi, ProjectActivityApi } from '../../api/index.js';
import { AcceptedResponse, Activity } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class ActivitiesTask extends TaskBase {
  private prjApi: ProjectActivityApi;
  private envApi: EnvironmentActivityApi;

  constructor(protected readonly client: UpsunClient) {
    super(client);

    this.prjApi = new ProjectActivityApi(this.client.apiConfig);
    this.envApi = new EnvironmentActivityApi(this.client.apiConfig);
  }

  async cancel(
    projectId: string,
    activityId: string,
    environmentId: string = '',
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkActivityId(activityId);

    if (environmentId) {
      return await this.envApi.actionProjectsEnvironmentsActivitiesCancel({
        projectId,
        environmentId,
        activityId,
      });
    } else {
      return await this.prjApi.actionProjectsActivitiesCancel({ projectId, activityId });
    }
  }

  async get(projectId: string, activityId: string, environmentId: string = ''): Promise<Activity> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkActivityId(activityId);

    if (environmentId) {
      return await this.envApi.getProjectsEnvironmentsActivities({
        projectId,
        environmentId,
        activityId,
      });
    } else {
      return await this.prjApi.getProjectsActivities({ projectId, activityId });
    }
  }

  async list(projectId: string, environmentId: string = ''): Promise<Activity[]> {
    TaskBase.checkProjectId(projectId);

    if (environmentId) {
      return await this.envApi.listProjectsEnvironmentsActivities({ projectId, environmentId });
    } else {
      return await this.prjApi.listProjectsActivities({ projectId });
    }
  }

  async log(projectId: string, activityId: string): Promise<void> {
    if (!projectId || !activityId) {
      throw new Error('Project ID and Activity ID are required');
    }

    //TODO clarify this message as the activity.logs contains "Log for this activity is available in the streaming logs endpoint"
    throw new Error('Not implemented, prefere use get() (containes log)'); 
  }
}
