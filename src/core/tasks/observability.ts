import {
  EntrypointApi,
  LogsApi,
  HttpTrafficApi,
  ResourcesApi,
  BlackfireMonitoringApi,
} from '../../api/index.js';
import {
  BlackfirePhpServerCaches200Response,
  BlackfireServerGlobal200Response,
  BlackfireServerTopSpans200Response,
  BlackfireServerTransactionsBreakdown200Response,
  HttpMetricsTimelineIps200Response,
  HttpMetricsTimelineUrls200Response,
  HttpMetricsTimelineUserAgents200Response,
  LogsOverview200Response,
  LogsQuery200Response,
  ObservabilityEntrypoint200Response,
  ResourcesByService200Response,
  ResourcesOverview200Response,
  ResourcesSummary200Response,
} from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import {
  BlackfirePhpServerCachesParams,
  BlackfireServerGlobalParams,
  BlackfireServerTopSpansParams,
  BlackfireServerTransactionsBreakdownParams,
  HttpMetricsTimelineIpsParams,
  HttpMetricsTimelineUrlsParams,
  HttpMetricsTimelineUserAgentsParams,
  LogsOverviewParams,
  LogsQueryParams,
  ResourcesByServiceParams,
  ResourcesOverviewParams,
  ResourcesSummaryParams,
} from '../model.js';
import { TaskBase } from './task_base.js';

export class ObservabilityTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private entrypointApi = new EntrypointApi(client.apiConfig),
    private logsApi = new LogsApi(client.apiConfig),
    private httpTrafficApi = new HttpTrafficApi(client.apiConfig),
    private resourcesApi = new ResourcesApi(client.apiConfig),
    private blackfireMonitoringApi = new BlackfireMonitoringApi(client.apiConfig),
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

  /**
   * Get the HTTP traffic timeline of an environment, by URL.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param params - The time range (`from` and `to`, required) and the filters.
   * @return The HTTP traffic timeline by URL.
   * @throws An error if an ID is empty, or if the API request fails.
   */
  async httpTimelineByUrl(
    projectId: string,
    environmentId: string,
    params: HttpMetricsTimelineUrlsParams,
  ): Promise<HttpMetricsTimelineUrls200Response> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.httpTrafficApi.httpMetricsTimelineUrls({
      ...params,
      projectId,
      environmentId,
    });
  }

  /**
   * Get the HTTP traffic timeline of an environment, by client IP.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param params - The time range (`from` and `to`, required) and the filters.
   * @return The HTTP traffic timeline by IP.
   * @throws An error if an ID is empty, or if the API request fails.
   */
  async httpTimelineByIp(
    projectId: string,
    environmentId: string,
    params: HttpMetricsTimelineIpsParams,
  ): Promise<HttpMetricsTimelineIps200Response> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.httpTrafficApi.httpMetricsTimelineIps({
      ...params,
      projectId,
      environmentId,
    });
  }

  /**
   * Get the HTTP traffic timeline of an environment, by user agent.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param params - The time range (`from` and `to`, required) and the filters.
   * @return The HTTP traffic timeline by user agent.
   * @throws An error if an ID is empty, or if the API request fails.
   */
  async httpTimelineByUserAgent(
    projectId: string,
    environmentId: string,
    params: HttpMetricsTimelineUserAgentsParams,
  ): Promise<HttpMetricsTimelineUserAgents200Response> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.httpTrafficApi.httpMetricsTimelineUserAgents({
      ...params,
      projectId,
      environmentId,
    });
  }

  /**
   * Get an overview of the resource metrics of an environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param params - The time range (`from` and `to`, required) and the filters.
   * @return The resource metrics overview.
   * @throws An error if an ID is empty, or if the API request fails.
   */
  async resourcesOverview(
    projectId: string,
    environmentId: string,
    params: ResourcesOverviewParams,
  ): Promise<ResourcesOverview200Response> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.resourcesApi.resourcesOverview({ ...params, projectId, environmentId });
  }

  /**
   * Get a summary of the resource metrics of an environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param params - The time range (`from` and `to`, required) and the filters.
   * @return The resource metrics summary.
   * @throws An error if an ID is empty, or if the API request fails.
   */
  async resourcesSummary(
    projectId: string,
    environmentId: string,
    params: ResourcesSummaryParams,
  ): Promise<ResourcesSummary200Response> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.resourcesApi.resourcesSummary({ ...params, projectId, environmentId });
  }

  /**
   * Get the resource metrics of one service of an environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param service - The name of the service or application.
   * @param params - The time range (`from` and `to`, required) and the filters.
   * @return The resource metrics of the service.
   * @throws An error if an ID or the service name is empty, or if the API request fails.
   */
  async resourcesByService(
    projectId: string,
    environmentId: string,
    service: string,
    params: ResourcesByServiceParams,
  ): Promise<ResourcesByService200Response> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    if (!service) {
      throw new Error('Service name is required');
    }

    return await this.resourcesApi.resourcesByService({
      ...params,
      projectId,
      environmentId,
      service,
    });
  }

  /**
   * Get the server monitoring overview of an environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param params - The time range (`from` and `to`, required), the metrics to get (`keys`, required) and the
   * filters.
   * @return The server monitoring overview.
   * @throws An error if an ID is empty, or if the API request fails.
   */
  async serverOverview(
    projectId: string,
    environmentId: string,
    params: BlackfireServerGlobalParams,
  ): Promise<BlackfireServerGlobal200Response> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.blackfireMonitoringApi.blackfireServerGlobal({
      ...params,
      projectId,
      environmentId,
    });
  }

  /**
   * Get the server cache metrics of an environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param params - The time range (`from` and `to`, required) and the filters.
   * @return The server cache metrics.
   * @throws An error if an ID is empty, or if the API request fails.
   */
  async serverCaches(
    projectId: string,
    environmentId: string,
    params: BlackfirePhpServerCachesParams,
  ): Promise<BlackfirePhpServerCaches200Response> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.blackfireMonitoringApi.blackfirePhpServerCaches({
      ...params,
      projectId,
      environmentId,
    });
  }

  /**
   * Get the top spans of an environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param params - The time range (`from` and `to`, required) and the filters.
   * @return The top spans.
   * @throws An error if an ID is empty, or if the API request fails.
   */
  async serverTopSpans(
    projectId: string,
    environmentId: string,
    params: BlackfireServerTopSpansParams,
  ): Promise<BlackfireServerTopSpans200Response> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.blackfireMonitoringApi.blackfireServerTopSpans({
      ...params,
      projectId,
      environmentId,
    });
  }

  /**
   * Get the server transaction breakdown of an environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param params - The time range (`from` and `to`, required) and the filters.
   * @return The server transaction breakdown.
   * @throws An error if an ID is empty, or if the API request fails.
   */
  async serverTransactionsBreakdown(
    projectId: string,
    environmentId: string,
    params: BlackfireServerTransactionsBreakdownParams,
  ): Promise<BlackfireServerTransactionsBreakdown200Response> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.blackfireMonitoringApi.blackfireServerTransactionsBreakdown({
      ...params,
      projectId,
      environmentId,
    });
  }
}
