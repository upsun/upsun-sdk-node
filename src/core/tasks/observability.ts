import { EntrypointApi, LogsApi } from '../../api/index.js';
import {
  LogsOverview200Response,
  LogsQuery200Response,
  ObservabilityEntrypoint200Response,
} from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { LogsOverviewParams, LogsQueryParams } from '../model.js';
import { TaskBase } from './task_base.js';

export class ObservabilityTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private entrypointApi = new EntrypointApi(client.apiConfig),
    private logsApi = new LogsApi(client.apiConfig),
  ) {
    super(client);
  }

  /**
   * Get the observability entrypoint of an environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @return The links to the observability resources of the environment.
   * @throws An error if an ID is empty, or if the API request fails.
   */
  async entrypoint(
    projectId: string,
    environmentId: string,
  ): Promise<ObservabilityEntrypoint200Response> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.entrypointApi.observabilityEntrypoint({ projectId, environmentId });
  }

  /**
   * Get an overview of the logs of an environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param params - The time range (`from` and `to`, required) and the filters.
   * @return The logs overview.
   * @throws An error if an ID is empty, or if the API request fails.
   */
  async logsOverview(
    projectId: string,
    environmentId: string,
    params: LogsOverviewParams,
  ): Promise<LogsOverview200Response> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.logsApi.logsOverview({ ...params, projectId, environmentId });
  }

  /**
   * Query the log entries of an environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param params - The time range (`from` and `to`, required), the filters, the order and the cursor.
   * @return One page of log entries.
   * @throws An error if an ID is empty, or if the API request fails.
   */
  async logsQuery(
    projectId: string,
    environmentId: string,
    params: LogsQueryParams,
  ): Promise<LogsQuery200Response> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.logsApi.logsQuery({ ...params, projectId, environmentId });
  }
}
