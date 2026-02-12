import { CertManagementApi } from '../../api/index.js';
import {
  AcceptedResponse,
  Certificate,
  CertificateCollection,
  CertificatePatch
} from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { CertificateCreateParams } from '../model.js';
import { TaskBase } from './task_base.js';

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
   * @param projectId - The ID of the project.
   * @param certificate - The certificate to add, in PEM format.
   * @param key - The private key for the certificate, in PEM format.
   * @param params - (Optional) Additional parameters for the certificate creation, such as a name or description.
   * @returns An AcceptedResponse indicating that the certificate creation request has been accepted.
   * @throws An error if the project ID is invalid, or if the certificate or key is missing or invalid.
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
   * @param projectId - The ID of the project.
   * @param certificateId - The ID of the certificate to delete.
   * @returns An AcceptedResponse indicating that the certificate deletion request has been accepted.
   * @throws An error if the project ID or certificate ID is invalid.
   */
  async delete(projectId: string, certificateId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkCertificateId(certificateId);

    return await this.certApi.deleteProjectsCertificates({ projectId, certificateId });
  }

  /**
   * Get the details of a certificate for a project.
   * @param projectId - The ID of the project.
   * @param certificateId - The ID of the certificate to retrieve.
   * @returns The details of the specified certificate.
   * @throws An error if the project ID or certificate ID is invalid, or if there is an issue retrieving the 
   * certificate details.
   */
  async get(projectId: string, certificateId: string): Promise<Certificate> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkCertificateId(certificateId);

    return await this.certApi.getProjectsCertificates({ projectId, certificateId });
  }

  /**
   * List the certificates for a project.
   * @param projectId - The ID of the project.
   * @returns A collection of certificates for the specified project.
   * @throws An error if the project ID is invalid, or if there is an issue retrieving the certificates.
   */
  async list(projectId: string): Promise<CertificateCollection> {
    TaskBase.checkProjectId(projectId);

    return await this.certApi.listProjectsCertificates({ projectId });
  }

  /**
   * Update a certificate for a project. The API will return a 202 Accepted response if the update request has been 
   * accepted and is being processed.
   * @param projectId - The ID of the project.
   * @param certificateId - The ID of the certificate to update.
   * @param params - The parameters to update for the certificate.
   * @returns An AcceptedResponse indicating that the certificate update request has been accepted.
   * @throws An error if the project ID or certificate ID is invalid.
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
