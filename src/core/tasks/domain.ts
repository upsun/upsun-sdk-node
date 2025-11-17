import { DomainManagementApi } from '../../api/index.js';
import { AcceptedResponse, Domain, DomainCollection } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class DomainTask extends TaskBase {
  private domApi: DomainManagementApi;

  constructor(protected readonly client: UpsunClient) {
    super(client);

    this.domApi = new DomainManagementApi(this.client.apiConfig);
  }

  static checkDomainId(domainId: string): void {
    if (!domainId) {
      throw new Error('Domain ID is required');
    }
  }

  async add(
    projectId: string,
    domain: string,
    environmentId: string = '',
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    if (!domain) {
      throw new Error('Domain must be a non-empty string');
    }

    if (environmentId) {
      return await this.domApi.createProjectsEnvironmentsDomains({
        projectId,
        environmentId,
        domainCreateInput: {
          name: domain,
        },
      });
    } else {
      return await this.domApi.createProjectsDomains({
        projectId,
        domainCreateInput: {
          name: domain,
        },
      });
    }
  }

  async delete(
    projectId: string,
    domainId: string,
    environmentId: string = '',
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    DomainTask.checkDomainId(domainId);

    if (environmentId) {
      return await this.domApi.deleteProjectsEnvironmentsDomains({
        projectId,
        environmentId,
        domainId,
      });
    } else {
      return await this.domApi.deleteProjectsDomains({
        projectId,
        domainId,
      });
    }
  }

  async get(projectId: string, domainId: string, environmentId: string = ''): Promise<Domain> {
    TaskBase.checkProjectId(projectId);
    DomainTask.checkDomainId(domainId);

    if (environmentId) {
      return await this.domApi.getProjectsEnvironmentsDomains({
        projectId,
        environmentId,
        domainId,
      });
    } else {
      return await this.domApi.getProjectsDomains({
        projectId,
        domainId,
      });
    }
  }

  async list(projectId: string, environmentId: string = ''): Promise<DomainCollection> {
    TaskBase.checkProjectId(projectId);

    if (environmentId) {
      return await this.domApi.listProjectsEnvironmentsDomains({
        projectId,
        environmentId,
      });
    } else {
      return await this.domApi.listProjectsDomains({
        projectId,
      });
    }
  }

  async update(projectId: string, arg1: string): Promise<never> {
    throw new Error('Method not implemented.');
  }
}
