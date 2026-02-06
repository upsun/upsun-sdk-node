import { UpsunClient } from '../../upsun.js';

export abstract class TaskBase {
  constructor(protected readonly client: UpsunClient) {}

  static checkUserId(userId: string): void {
    if (!userId) {
      throw new Error('User ID is required');
    }
  }

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

  static checkSubscriptionId(subscriptionId: string): void {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }
  }

  static checkTeamId(teamId: string): void {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
  }

  // works for URIs like /subscriptions/{subscriptionId} to extract subscriptionId
  // as the subscriptionId is not returned directly in the project object (emty field)
  // e.g. /subscriptions/abc123
  static extractSubscriptionId(projectLicenceUri: string): string {
    const url = new URL(projectLicenceUri);
    const path = url.pathname;
    return path.substring(path.lastIndexOf('/') + 1);
  }
}
