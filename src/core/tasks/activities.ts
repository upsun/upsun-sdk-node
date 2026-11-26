import {
  EnvironmentActivityApi,
  LogsQueryLogKindsEnum,
  ProjectActivityApi,
} from '../../api/index.js';
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
   * Get the log of an activity (the deployment process), read from the observability logs of the `deployment` and
   * `platform` kinds between the start and the end of the activity (the `Activity.log` field is deprecated).
   * For the application logs, use `environments.logs()`.
   * @param projectId - The ID of the project.
   * @param activityId - The ID of the activity to retrieve the log for.
   * @param environmentId - (Optional) The ID of the environment. Defaults to the first environment of the activity.
   * @returns The log lines of the activity, oldest first, one per line.
   * @throws An error if an ID is invalid, if the activity is not linked to an environment or has not started, or if
   * the API request fails.
   */
  async log(projectId: string, activityId: string, environmentId?: string): Promise<string> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkActivityId(activityId);
    if (environmentId) {
      TaskBase.checkEnvironmentId(environmentId);
    }

    const activity = await this.get(projectId, activityId, environmentId);

    const targetEnvironmentId = environmentId ?? activity.environments?.[0];
    if (!targetEnvironmentId) {
      throw new Error('The activity is not linked to an environment, its log is not available');
    }

    const start = activity.startedAt ?? activity.createdAt;
    if (!start) {
      throw new Error('The activity has not started, its log is not available');
    }
    const end = activity.completedAt ?? activity.cancelledAt ?? new Date();

    const lines: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await this.client.observability.logsQuery(projectId, targetEnvironmentId, {
        from: Math.floor(start.getTime() / 1000),
        to: Math.ceil(end.getTime() / 1000),
        order: 'ASC',
        logKinds: [LogsQueryLogKindsEnum.DEPLOYMENT, LogsQueryLogKindsEnum.PLATFORM],
        logKindsMode: '1',
        cursor,
      });
      lines.push(...page.data.map(entry => entry.content));
      cursor = page.hasMoreResults && page.cursor ? page.cursor : undefined;
    } while (cursor);

    return lines.join('\n');
  }
}
