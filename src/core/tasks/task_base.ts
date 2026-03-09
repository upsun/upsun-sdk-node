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

  static checkDeploymentId(deploymentId: string): void {
    if (!deploymentId) {
      throw new Error('Deployment ID is required');
    }
  }

  static checkInvoiceId(invoiceId: string): void {
    if (!invoiceId) {
      throw new Error('Invoice ID is required');
    }
  }

  static checkOrderId(orderId: string): void {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
  }

  static checkVoucherCode(code: string): void {
    if (!code) {
      throw new Error('Voucher code is required');
    }
  }

  static checkProjectRegion(region: string): void {
    if (!region) {
      throw new Error('Project region is required');
    }
  }

  static checkVariableId(variableId: string): void {
    if (!variableId) {
      throw new Error('Variable ID is required');
    }
  }

  static checkRepositoryBlobId(repositoryBlobId: string): void {
    if (!repositoryBlobId) {
      throw new Error('Repository Blob ID is required');
    }
  }

  static checkRepositoryCommitId(repositoryCommitId: string): void {
    if (!repositoryCommitId) {
      throw new Error('Repository Commit ID is required');
    }
  }

  static checkRepositoryRefId(repositoryRefId: string): void {
    if (!repositoryRefId) {
      throw new Error('Repository Ref ID is required');
    }
  }

  static checkRepositoryTreeId(repositoryTreeId: string): void {
    if (!repositoryTreeId) {
      throw new Error('Repository Tree ID is required');
    }
  }

  static checkIntegrationId(integrationId: string): void {
    if (!integrationId) {
      throw new Error('Integration ID is required');
    }
  }

  static checkDomainId(domainId: string): void {
    if (!domainId) {
      throw new Error('Domain ID is required');
    }
  }

  static checkApiTokenId(tokenId: string): void {
    if (!tokenId) {
      throw new Error('API Token ID is required');
    }
  }

  static checkEmail(email: string): void {
    if (!email) {
      throw new Error('Email is required');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  static checkInviteId(inviteId: string): void {
    if (!inviteId) {
      throw new Error('Invite ID is required');
    }
  }

  static checkUsername(username: string): void {
    if (!username) {
      throw new Error('Username is required');
    }
  }

  static checkSshKeyId(keyId: number): void {
    if (!keyId || keyId <= 0) {
      throw new Error('Key ID must be a positive integer');
    }
  }

  static checkEnvironmentTypeId(environmentTypeId: string): void {
    if (!environmentTypeId) {
      throw new Error('Environment Type ID is required');
    }
  }

  static checkRouteId(routeId: string): void {
    if (!routeId) {
      throw new Error('Route ID is required');
    }
  }

  static checkTicketId(ticketId: string): void {
    if (!ticketId) {
      throw new Error('Ticket ID is required');
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
