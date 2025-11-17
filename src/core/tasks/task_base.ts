import { UpsunClient } from '../../upsun.js';

export abstract class TaskBase {
  constructor(protected readonly client: UpsunClient) {}

  static checkProjectId(projectId: string): void {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
  }

  static checkOrganizationId(organizationId: string): void {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }
  }

  static checkEnvironmentId(environmentId: string): void {
    if (!environmentId) {
      throw new Error('Environment ID is required');
    }
  }

  static checkActivityId(activityId: string): void {
    if (!activityId) {
      throw new Error('Activity ID is required');
    }
  }

  static checkApplicationId(applicationId: string): void {
    if (!applicationId) {
      throw new Error('Application ID is required');
    }
  }

  static checkBackupId(backupId: string): void {
    if (!backupId) {
      throw new Error('Backup ID is required');
    }
  }

  static checkCertificateId(certificateId: string): void {
    if (!certificateId) {
      throw new Error('Certificate ID is required');
    }
  }
}
