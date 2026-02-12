import { RoutingApi } from '../../api/index.js';
import { Route, RouteCollection } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class RoutesTask extends TaskBase {
  
  constructor(
    protected readonly client: UpsunClient,
    private rteApi: RoutingApi,
  ) {
    super(client);
  }

  async get(projectId: string, env_name: string, routeId: string): Promise<Route> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(env_name);
    this.checkRouteId(routeId);

    return await this.rteApi.getProjectsEnvironmentsRoutes({
      projectId,
      environmentId: env_name,
      routeId,
    });
  }

  async list(projectId: string, env_name: string): Promise<RouteCollection> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(env_name);
    
    return await this.rteApi.listProjectsEnvironmentsRoutes({ projectId, environmentId: env_name });
  }

  private checkRouteId(routeId: string): void {
    if (!routeId) {
      throw new Error('Route ID is required');
    }
  }
}
