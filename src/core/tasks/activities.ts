import { EnvironmentActivityApi, ProjectActivityApi } from '../../api/index.js';
import { AcceptedResponse, Activity } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class ActivitiesTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private prjActApi: ProjectActivityApi,
    private envActApi: EnvironmentActivityApi,
  ) {
    super(client);
  }

  /**
   * Cancel an activity for a project or environment. The API will return a 202 Accepted response if the cancellation
   * request has been accepted, but the client should check the activity's details to confirm whether the cancellation
   * was successful or not.
   *
   * @param projectId - The ID of the project.
   * @param activityId - The ID of the activity to cancel.
   * @param environmentId - (Optional) The ID of the environment. If not provided, the activity is assumed to be a project-level activity.
   * @returns An AcceptedResponse indicating that the cancellation request has been accepted.
   */
  async cancel(
    projectId: string,
    activityId: string,
    environmentId?: string,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkActivityId(activityId);

    if (!environmentId) {
      return await this.prjActApi.actionProjectsActivitiesCancel({ projectId, activityId });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.envActApi.actionProjectsEnvironmentsActivitiesCancel({
        projectId,
        environmentId,
        activityId,
      });
    }
  }

  /**
   * Get the details of an activity for a project or environment.
   * @param projectId - The ID of the project.
   * @param activityId - The ID of the activity to retrieve.
   * @param environmentId - (Optional) The ID of the environment. If not provided, the activity is assumed to be a project-level activity.
   * @returns The details of the specified activity.
   */
  async get(projectId: string, activityId: string, environmentId?: string): Promise<Activity> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkActivityId(activityId);

    if (!environmentId) {
      return await this.prjActApi.getProjectsActivities({ projectId, activityId });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.envActApi.getProjectsEnvironmentsActivities({
        projectId,
        environmentId,
        activityId,
      });
    }
  }

  /**
   * List the activities for a project or environment.
   * @param projectId - The ID of the project.
   * @param environmentId - (Optional) The ID of the environment. If not provided, the activities for the entire project will be listed.
   * @returns A list of activities for the specified project or environment.
   */
  async list(projectId: string, environmentId?: string): Promise<Activity[]> {
    TaskBase.checkProjectId(projectId);

    if (!environmentId) {
      return await this.prjActApi.listProjectsActivities({ projectId });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.envActApi.listProjectsEnvironmentsActivities({ projectId, environmentId });
    }
  }

  /**
   * Get the log output for an activity.
   * @todo clarify this message as the activity.logs contains "Log for this activity is available in the streaming
   * logs endpoint"
   * @see https://linear.app/platformsh/issue/GIT-826/document-git-activity-log-endpoint-in-api-specs
   * @param projectId - The ID of the project.
   * @param activityId - The ID of the activity to retrieve logs for.
   * @returns The log output for the specified activity.
   */
  async log(projectId: string, activityId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkActivityId(activityId);

    throw new Error('Not implemented, prefere use get() (contains log)');
  }
}
