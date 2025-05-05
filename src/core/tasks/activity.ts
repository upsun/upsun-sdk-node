import { ProjectActivityApi } from "../../apis-gen/index.js";
import { UpsunClient } from "../../upsun.js";

export class Activity {
  
  constructor(private readonly client: UpsunClient) { }

  async cancel(projectId: string, activityId: string) {
    const api = new ProjectActivityApi(this.client.apiConfig);
    return await api.actionProjectsActivitiesCancel({ projectId, activityId });
  }

  async get(projectId: string, activityId: string) {
    const api = new ProjectActivityApi(this.client.apiConfig);
    return await api.getProjectsActivities({ projectId, activityId });
  }

  async list(projectId: string) {
    const api = new ProjectActivityApi(this.client.apiConfig);
    return await api.listProjectsActivities({ projectId });
  }

  async log(projectId: string, activityId: string) {
    throw new Error("Not implemented");
  }

}
