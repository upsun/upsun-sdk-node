import { CreateOrgOperationRequest, ListUserOrgsRequest, OrganizationsApi } from "../../apis-gen/index.js";
import { UpsunClient } from "../../upsun.js";
import { TaskBase } from "./taskBase.js";

export class OrganizationTask extends TaskBase {
  private orgApi: OrganizationsApi;
  
  constructor(protected readonly client: UpsunClient) {
    super(client);

    this.orgApi = new OrganizationsApi(this.client.apiConfig);
  }

  async create(label: string, ownerId?: string, name?: string, country?: string ) {
    return await this.orgApi.createOrg({ createOrgRequest: {  ownerId, name, label, country } } as CreateOrgOperationRequest);
  }

  async delete(organizationId: string) {
    return await this.orgApi.deleteOrg({ organizationId });
  }

  async info(organizationId: string) {
    return await this.orgApi.getOrg({ organizationId });
  }

  async list() {
    return await this.orgApi.listUserOrgs({ userId: await this.client.getUserId()} as ListUserOrgsRequest);
  }

}
