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

  /**
   * Get the details of a specific route for an environment. This method retrieves the details of a specific route that 
   * is associated with the specified environment.
   * @param projectId - The ID of the project to get the route details for.
   * @param environmentId - The ID of the environment to get the route details for.
   * @param routeId - The ID of the route to retrieve details for. This should be a valid identifier for a route that is
   * associated with the specified environment.
   * @return The details of the specified route, including information such as the route pattern, target service, and 
   * other relevant details.
   * @throws An error if the project ID, environment ID, or route ID is invalid, or if there is an issue with the API 
   * request.
   */
  async get(projectId: string, environmentId: string, routeId: string): Promise<Route> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    RoutesTask.checkRouteId(routeId);

    return await this.rteApi.getProjectsEnvironmentsRoutes({
      projectId,
      environmentId,
      routeId,
    });
  }

  /**
   * List all routes for an environment. This method retrieves a list of all routes that are associated with the 
   * specified environment.
   * @param projectId - The ID of the project to list routes for.
   * @param environmentId - The ID of the environment to list routes for.
   * @return A list of routes that are associated with the specified environment, including details such as the route 
   * pattern, target service, and other relevant details for each route.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async list(projectId: string, environmentId: string): Promise<RouteCollection> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.rteApi.listProjectsEnvironmentsRoutes({ projectId, environmentId });
  }

  /**
   * Static method to validate a route ID. This method checks if the provided route ID is valid and throws an error if 
   * it is not.
   * @param routeId 
   */
  static checkRouteId(routeId: string): void {
    if (!routeId) {
      throw new Error('Route ID is required');
    }
  }
}
