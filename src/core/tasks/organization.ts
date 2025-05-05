import { CreateOrgOperationRequest, OrganizationsApi } from "../../apis-gen/index.js";
import { UpsunClient } from "../../upsun.js";

export class Organization {
  
  constructor(private readonly client: UpsunClient) { }

  async create(name: string) {
    const api = new OrganizationsApi(this.client.apiConfig);
    return await api.createOrg({ createOrgRequest: {  name } } as CreateOrgOperationRequest);
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
    const api = new OrganizationsApi(this.client.apiConfig);
    return await api.listOrgs();
  }

}
