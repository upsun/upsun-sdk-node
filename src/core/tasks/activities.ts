import { EnvironmentActivityApi, ProjectActivityApi } from '../../api/index.js';
import { AcceptedResponse, Activity } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class ActivitiesTask extends TaskBase {

  constructor(
    protected readonly client: UpsunClient,
    private prjApi: ProjectActivityApi,
    private envApi: EnvironmentActivityApi,
  ) {
    super(client);
  }

  /**
   * Cancel an activity for a project or environment. The API will return a 202 Accepted response if the cancellation 
   * request has been accepted, but the client should check the activity's details to confirm whether the cancellation 
   * was successful or not.
   */
  async cancel( projectId: string, activityId: string, environmentId?: string ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkActivityId(activityId);

    if (!environmentId) {
      return await this.prjApi.actionProjectsActivitiesCancel({ projectId, activityId });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.envApi.actionProjectsEnvironmentsActivitiesCancel({ projectId, environmentId, activityId });
    }
  }

  /**
   * Get the details of an activity for a project or environment.
   */
  async get(projectId: string, activityId: string, environmentId?: string): Promise<Activity> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkActivityId(activityId);

    if (!environmentId) {
      return await this.prjApi.getProjectsActivities({ projectId, activityId });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.envApi.getProjectsEnvironmentsActivities({ projectId, environmentId, activityId });
    }
  }

  /**
   * List the activities for a project or environment.
   */
  async list(projectId: string, environmentId?: string): Promise<Activity[]> {
    TaskBase.checkProjectId(projectId);

    if (!environmentId) {
      return await this.prjApi.listProjectsActivities({ projectId });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.envApi.listProjectsEnvironmentsActivities({ projectId, environmentId });
    }
  }

  /**
   * Get the log output for an activity. 
   * @todo clarify this message as the activity.logs contains "Log for this activity is available in the streaming 
   * logs endpoint" 
   * @see https://linear.app/platformsh/issue/GIT-826/document-git-activity-log-endpoint-in-api-specs
   */
  async log(projectId: string, activityId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkActivityId(activityId);

    throw new Error('Not implemented, prefere use get() (contains log)'); 
  }
}
