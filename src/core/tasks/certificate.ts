import { CertManagementApi } from "../../apis-gen/index.js";
import { UpsunClient } from "../../upsun.js";
import { TaskBase } from "./taskBase.js";

export class CertificateTask extends TaskBase {
  private certApi: CertManagementApi;
  
  constructor(protected readonly client: UpsunClient) {
    super(client);

    this.certApi = new CertManagementApi(this.client.apiConfig);
  }

  async add(projectId: string, certificate: string, key: string, chain: string[] = []) {
    TaskBase.checkProjectId(projectId);
    if (!certificate || !key) {
      throw new Error("Certificate and key are required");
    }

    return await this.certApi.createProjectsCertificates({
      projectId,
      certificateCreateInput: {
        certificate,
        key,
        chain
      }});
  }

  async delete(projectId: string, certificateId: string) {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkCertificateId(certificateId);

    return await this.certApi.deleteProjectsCertificates({
      projectId,
      certificateId
    });
  }

  async get(projectId: string, certificateId: string) {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkCertificateId(certificateId);

    return await this.certApi.getProjectsCertificates({
      projectId,
      certificateId
    });
  }

  async list(projectId: string) {
    TaskBase.checkProjectId(projectId);

    return await this.certApi.listProjectsCertificates({
      projectId
    });
  }
}
