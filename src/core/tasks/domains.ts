import { DomainManagementApi } from '../../api/index.js';
import { AcceptedResponse, Domain, DomainCollection, DomainPatch } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class DomainsTask extends TaskBase {
  
  constructor(
    protected readonly client: UpsunClient,
    private domApi: DomainManagementApi,
  ) {
    super(client);
  }

  /**
   * Add a domain to a project or environment. The API will return a 202 Accepted response if the domain creation 
   * request has been accepted and is being processed. However, the client should check the domain's details to confirm 
   * whether the creation was successful or not.
   */
  async add(
    projectId: string,
    domain: string,
    attributes?: { [key: string]: string },
    isDefault?: boolean,
    replacementFor?: string,
    environmentId?: string,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);

    if (!domain) {
      throw new Error('Domain must be a non-empty string');
    }

    const domainCreateInput = { name: domain, attributes, isDefault, replacementFor };

    if (!environmentId) {
      return await this.domApi.createProjectsDomains({ projectId, domainCreateInput });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.domApi.createProjectsEnvironmentsDomains({ projectId, environmentId, domainCreateInput });
    }
  }

  /**
   * Delete a domain from a project or environment. The API will return a 202 Accepted response if the deletion request 
   * has been accepted and is being processed. However, the client should check the domain's details to confirm whether 
   * the deletion was successful or not.
   */
  async delete( projectId: string, domainId: string, environmentId?: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkDomainId(domainId);

    if (!environmentId) {
      return await this.domApi.deleteProjectsDomains({ projectId, domainId });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.domApi.deleteProjectsEnvironmentsDomains({ projectId, environmentId, domainId });
    }
  }

  /**
   * Get the details of a domain for a project or environment.
   */
  async get(projectId: string, domainId: string, environmentId?: string): Promise<Domain> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkDomainId(domainId);

    if (!environmentId) {
      return await this.domApi.getProjectsDomains({ projectId, domainId });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.domApi.getProjectsEnvironmentsDomains({ projectId, environmentId, domainId });
    }
  }

  /**
   * List the domains for a project or environment. The returned list is ordered by creation date, with the most recent 
   * domain appearing first in the list.
   */
  async list(projectId: string, environmentId?: string): Promise<DomainCollection> {
    TaskBase.checkProjectId(projectId);

    if (!environmentId) {
      return await this.domApi.listProjectsDomains({ projectId });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.domApi.listProjectsEnvironmentsDomains({ projectId, environmentId });
    }
  }

  /**
   * Update a domain for a project or environment. The API will return a 202 Accepted response if the update request has
   * been accepted and is being processed. However, the client should check the domain's details to confirm whether the 
   * update was successful or not.
   */
  async update(
    projectId: string, 
    domainId: string,
    params?: DomainPatch,
    environmentId?: string,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkDomainId(domainId);

    if (!environmentId) {
      return await this.domApi.updateProjectsDomains({ projectId, domainId, domainPatch: params || {} });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.domApi.updateProjectsEnvironmentsDomains({
        projectId,
        environmentId,
        domainId,
        domainPatch: params || {},
      });
    }
  }
}
