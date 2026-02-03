import { CertManagementApi, UpdateProjectsProvisionersRequest } from '../../api/index.js';
import { AcceptedResponse, Certificate, CertificateCollection, CertificatePatch } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class CertificateTask extends TaskBase {
  private certApi: CertManagementApi;

  constructor(protected readonly client: UpsunClient) {
    super(client);

    this.certApi = new CertManagementApi(this.client.apiConfig);
  }

  async add(
    projectId: string,
    certificate: string,
    key: string,
    chain: string[] = [],
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    if (!certificate || !key) {
      throw new Error('Certificate and key are required');
    }

    return await this.certApi.createProjectsCertificates({
      projectId,
      certificateCreateInput: {
        certificate,
        key,
        chain,
      },
    });
  }

  async delete(projectId: string, certificateId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkCertificateId(certificateId);

    return await this.certApi.deleteProjectsCertificates({
      projectId,
      certificateId,
    });
  }

  async get(projectId: string, certificateId: string): Promise<Certificate> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkCertificateId(certificateId);

    return await this.certApi.getProjectsCertificates({
      projectId,
      certificateId,
    });
  }

  async list(projectId: string): Promise<CertificateCollection> {
    TaskBase.checkProjectId(projectId);

    return await this.certApi.listProjectsCertificates({
      projectId,
    });
  }

  async update(projectId: string, certificateId: string, chain: string[] = [], isInvalid: boolean = false): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkCertificateId(certificateId);

    return await this.certApi.updateProjectsCertificates({
      projectId,
      certificateId,
      certificatePatch: {
        chain,
        isInvalid
      } as CertificatePatch,
    });
  }
}
