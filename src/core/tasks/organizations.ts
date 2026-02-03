import {
  CreateOrgOperationRequest,
  ListUserOrgsRequest,
  OrganizationsApi,
} from '../../api/index.js';
import { ListUserOrgs200Response, Organization } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class OrganizationsTask extends TaskBase {
  private orgApi: OrganizationsApi;

  constructor(protected readonly client: UpsunClient) {
    super(client);

    this.orgApi = new OrganizationsApi(this.client.apiConfig);
  }

  async create(
    label: string,
    ownerId?: string,
    name?: string,
    country?: string,
  ): Promise<Organization> {
    return await this.orgApi.createOrg({
      createOrgRequest: { ownerId, name, label, country },
    } as CreateOrgOperationRequest);
  }

  async delete(organizationId: string): Promise<void> {
    return await this.orgApi.deleteOrg({ organizationId });
  }

  async info(organizationId: string): Promise<Organization> {
    return await this.orgApi.getOrg({ organizationId });
  }

  async list(): Promise<ListUserOrgs200Response> {
    return await this.orgApi.listUserOrgs({
      userId: await this.client.getUserId(),
    } as ListUserOrgsRequest);
  }
}
