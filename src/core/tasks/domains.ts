import { DomainManagementApi } from '../../api/index.js';
import { AcceptedResponse, Domain, DomainCollection } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class DomainsTask extends TaskBase {
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
    attributes: { [key: string]: string } = {},
    isDefault: boolean = false,
    replacementFor: string = '',
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
          attributes: attributes,
          isDefault: isDefault,
          replacementFor: replacementFor,
        },
      });
    } else {
      return await this.domApi.createProjectsDomains({
        projectId,
        domainCreateInput: {
          name: domain,
          attributes: attributes,
          isDefault: isDefault,
          replacementFor: replacementFor,
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
    DomainsTask.checkDomainId(domainId);

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
    DomainsTask.checkDomainId(domainId);

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

  async update(
    projectId: string, 
    domainId: string,
    attributes: { [key: string]: string } = {},
    isDefault: boolean = false,
    environmentId: string = '',
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    DomainsTask.checkDomainId(domainId);

    if (environmentId) {
      return await this.domApi.updateProjectsEnvironmentsDomains({
        projectId,
        environmentId,
        domainId,
        domainPatch: {
          attributes: attributes,
          isDefault: isDefault,
        },
      });
    } else {
      return await this.domApi.updateProjectsDomains({
        projectId,
        domainId,
        domainPatch: {
          attributes: attributes,
          isDefault: isDefault,
        },
      });
    }
  }
}