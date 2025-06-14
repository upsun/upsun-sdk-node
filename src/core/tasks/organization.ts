import { CreateOrgOperationRequest, ListUserOrgsRequest, OrganizationsApi } from "../../apis-gen/index.js";
import { UpsunClient } from "../../upsun.js";

export class OrganizationTask {
  
  constructor(private readonly client: UpsunClient) { }

  async create(label: string, ownerId?: string, name?: string, country?: string ) {
    const api = new OrganizationsApi(this.client.apiConfig);
    return await api.createOrg({ createOrgRequest: {  ownerId, name, label, country } } as CreateOrgOperationRequest);
  }

  async delete(organizationId: string) {
    const api = new OrganizationsApi(this.client.apiConfig);
    return await api.deleteOrg({ organizationId });
  }

  async info(organizationId: string) {
    const api = new OrganizationsApi(this.client.apiConfig);
    return await api.getOrg({ organizationId });
  }

  async list() {
    const apiOrg = new OrganizationsApi(this.client.apiConfig);
    return await apiOrg.listUserOrgs({ userId: await this.client.getUserId()} as ListUserOrgsRequest);
  }

}
