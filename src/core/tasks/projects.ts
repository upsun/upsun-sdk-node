import { UpsunClient } from "../../upsun.js";
import { SubscriptionsApi } from "../../apis-gen/apis/SubscriptionsApi.js";

export class Projects {
  
  constructor(private readonly client: UpsunClient) { }

  async getProject(organizationId: string) {
    try {
      const api = new SubscriptionsApi(this.client.apiConfig);

      return await api.listOrgSubscriptions({ organizationId });
    } catch (error: any) {
      console.error("Error fetching projects:", error.error);
      throw error;
    }
  }
}
