import { CertManagementApi, UpdateProjectsProvisionersRequest } from '../../api/index.js';
import { AcceptedResponse, Certificate, CertificateCollection, CertificatePatch } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class CertificatesTask extends TaskBase {
  
  constructor(
    protected readonly client: UpsunClient,
    private certApi: CertManagementApi,
  ) {
    super(client);
  }

  async add(
    projectId: string,
    certificate: string,
    key: string,
    chain?: string[],
    isInvalid?: boolean,
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
        isInvalid,
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

  async update(projectId: string, certificateId: string, chain?: string[], isInvalid?: boolean): Promise<AcceptedResponse> {
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
