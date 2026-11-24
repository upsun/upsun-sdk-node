import { ContinuousProfilingApi } from '../../api/index.js';
import {
  GetApplicationFilter200Response,
  GetApplicationMerge200ResponseFromJSON,
  GetApplicationTimeline200Response,
  ListApplications200Response,
} from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import {
  ContinuousProfilingFilterParams,
  ContinuousProfilingListParams,
  ContinuousProfilingMergeParams,
  ContinuousProfilingMergeResult,
  ContinuousProfilingTimelineParams,
} from '../model.js';
import { TaskBase } from './task_base.js';

export class ContinuousProfilingTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private continuousProfilingApi = new ContinuousProfilingApi(client.apiConfig),
  ) {
    super(client);
  }

  /**
   * List the applications that send continuous profiling data on an environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param params - The optional time range (`from` and `to`).
   * @return The profiled applications, keyed by name. Pass a key as `app` to `timeline`, `filters` and `merge`,
   * and a key of its `profileTypes` as `profileType`. The name comes from the probe: it can differ from the
   * Upsun application name.
   * @throws An error if an ID is empty, or if the API request fails.
   */
  async listApplications(
    projectId: string,
    environmentId: string,
    params: ContinuousProfilingListParams = {},
  ): Promise<ListApplications200Response> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.continuousProfilingApi.listApplications({
      ...params,
      projectId,
      envId: environmentId,
    });
  }

  /**
   * Get the continuous profiling timeline of an application.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param app - The application name, from `listApplications`.
   * @param params - The time range, the profile type and the runtime filters.
   * @return The timeline points of the application.
   * @throws An error if an ID or the application name is empty, or if the API request fails.
   */
  async timeline(
    projectId: string,
    environmentId: string,
    app: string,
    params: ContinuousProfilingTimelineParams = {},
  ): Promise<GetApplicationTimeline200Response> {
    ContinuousProfilingTask.checkIds(projectId, environmentId, app);

    return await this.continuousProfilingApi.getApplicationTimeline({
      ...params,
      projectId,
      envId: environmentId,
      app,
    });
  }

  /**
   * Get the values that the runtime filters accept for an application.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param app - The application name, from `listApplications`.
   * @param params - The time range, the profile type and the runtime filters.
   * @return The filter values. Pass a `fields.<dimension>.values[].value` as the matching filter param of
   * `timeline` and `merge` (for example `runtimeVersion`).
   * @throws An error if an ID or the application name is empty, or if the API request fails.
   */
  async filters(
    projectId: string,
    environmentId: string,
    app: string,
    params: ContinuousProfilingFilterParams = {},
  ): Promise<GetApplicationFilter200Response> {
    ContinuousProfilingTask.checkIds(projectId, environmentId, app);

    return await this.continuousProfilingApi.getApplicationFilter({
      ...params,
      projectId,
      envId: environmentId,
      app,
    });
  }

  /**
   * Get the merged continuous profile of an application.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param app - The application name, from `listApplications`.
   * @param params - The time range, the profile type, the output format (`out`) and the runtime filters.
   * @return The merged profile, tagged by format: `pprof` bytes (gzipped protobuf), `dot` text, or the parsed
   * `flamebearerv2` model.
   * @throws An error if an ID or the application name is empty, if the API request fails, or if the response
   * content type is unknown.
   */
  async merge(
    projectId: string,
    environmentId: string,
    app: string,
    params: ContinuousProfilingMergeParams = {},
  ): Promise<ContinuousProfilingMergeResult> {
    ContinuousProfilingTask.checkIds(projectId, environmentId, app);

    const response = await this.continuousProfilingApi.getApplicationMergeRaw({
      ...params,
      projectId,
      envId: environmentId,
      app,
    });
    const raw = response.raw;
    const contentType = raw.headers.get('Content-Type') ?? '';

    if (contentType.startsWith('application/json')) {
      return {
        format: 'flamebearerv2',
        data: GetApplicationMerge200ResponseFromJSON(await raw.json()),
      };
    }
    if (contentType.startsWith('text/vnd.graphviz')) {
      return { format: 'dot', text: await raw.text() };
    }
    if (contentType.startsWith('application/octet-stream')) {
      return {
        format: 'pprof',
        data: new Uint8Array(await raw.arrayBuffer()),
        filename: ContinuousProfilingTask.filenameOf(raw.headers.get('Content-Disposition')),
      };
    }

    throw new Error(`Unexpected content type for a merged profile: "${contentType}"`);
  }

  private static checkIds(projectId: string, environmentId: string, app: string): void {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    if (!app) {
      throw new Error('Application name is required');
    }
  }

  private static filenameOf(contentDisposition: string | null): string | undefined {
    const match = contentDisposition?.match(/filename="?([^";]+)"?/);
    return match?.[1];
  }
}
