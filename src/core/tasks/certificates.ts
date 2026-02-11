import { CertManagementApi } from '../../api/index.js';
import {
  AcceptedResponse,
  Certificate,
  CertificateCollection,
  CertificateCreateInput,
  CertificatePatch
} from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

// Type creation for request parameters that omit required fields from the original input types
export type CertificateCreateParams = Omit<CertificateCreateInput, 'certificate' | 'key'>;

export class CertificatesTask extends TaskBase {
  
  constructor(
    protected readonly client: UpsunClient,
    private certApi: CertManagementApi,
  ) {
    super(client);
  }

  /**
   * Add a certificate to a project. The API will return a 202 Accepted response if the certificate creation request has 
   * been accepted and is being processed. However, the client should check the certificate's details to confirm whether 
   * the creation was successful or not.
   */
  async add(
    projectId: string,
    certificate: string,
    key: string,
    params?: CertificateCreateParams
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    
    if (!certificate || !key) {
      throw new Error('Certificate and key are required');
    }

    return await this.certApi.createProjectsCertificates({
      projectId,
      certificateCreateInput: {certificate, key, ...params},
    });
  }

  /**
   * Delete a certificate from a project. The API will return a 202 Accepted response if the deletion request has been
   * accepted and is being processed. However, the client should check the certificate's details to confirm whether the 
   * deletion was successful or not.
   */
  async delete(projectId: string, certificateId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkCertificateId(certificateId);

    return await this.certApi.deleteProjectsCertificates({ projectId, certificateId });
  }

  /**
   * Get the details of a certificate for a project.
   */
  async get(projectId: string, certificateId: string): Promise<Certificate> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkCertificateId(certificateId);

    return await this.certApi.getProjectsCertificates({ projectId, certificateId });
  }

  /**
   * List the certificates for a project.
   */
  async list(projectId: string): Promise<CertificateCollection> {
    TaskBase.checkProjectId(projectId);

    return await this.certApi.listProjectsCertificates({ projectId });
  }

  /**
   * Update a certificate for a project. The API will return a 202 Accepted response if the update request has been 
   * accepted and is being processed.
   */
  async update(
    projectId: string, 
    certificateId: string, 
    params?: CertificatePatch
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkCertificateId(certificateId);

    return await this.certApi.updateProjectsCertificates({projectId,certificateId,certificatePatch: params || {}});
  }
}
