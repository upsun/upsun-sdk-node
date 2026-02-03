import { RoutingApi } from '../../api/index.js';
import { Route, RouteCollection } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class RoutesTask extends TaskBase {
  private rteApi: RoutingApi;

  constructor(protected readonly client: UpsunClient) {
    super(client);

    this.rteApi = new RoutingApi(this.client.apiConfig);
  }

  async get(projectId: string, env_name: string, routeId: string): Promise<Route> {
    return await this.rteApi.getProjectsEnvironmentsRoutes({
      projectId,
      environmentId: env_name,
      routeId,
    });
  }

  async list(projectId: string, env_name: string): Promise<RouteCollection> {
    return await this.rteApi.listProjectsEnvironmentsRoutes({ projectId, environmentId: env_name });
  }

  // async web(projectId: string) {
  //   const api = new ProjectDiscoveryApi(this.client.apiConfig);
  //   return await api.locateProject({ projectId });
  // }
}
