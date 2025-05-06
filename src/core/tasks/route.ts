import { ProjectDiscoveryApi, RoutingApi } from "../../apis-gen/index.js";
import { UpsunClient } from "../../upsun.js";

export class Route {

  constructor(private readonly client: UpsunClient) { }

  async get(projectId: string, env_name: string, routeId: string) {
    const api = new RoutingApi(this.client.apiConfig);
    return await api.getProjectsEnvironmentsRoutes({ projectId, environmentId: env_name, routeId });
  }

  async list(projectId: string, env_name: string) {
    const api = new RoutingApi(this.client.apiConfig);
    return await api.listProjectsEnvironmentsRoutes({ projectId, environmentId: env_name });
  }

  async web(projectId: string) {
    const api = new ProjectDiscoveryApi(this.client.apiConfig);
    return await api.locateProject({ projectId });
  }
}
