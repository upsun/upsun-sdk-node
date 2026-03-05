import { TaskBase } from '../../../src/core/tasks/task_base.js';
import { UpsunClient } from '../../../src/upsun.js';

jest.mock('../../../src/upsun.js');

// Concrete subclass to allow instantiation of the abstract class
class ConcreteTask extends TaskBase {
  constructor(client: UpsunClient) {
    super(client);
  }
}

describe('TaskBase', () => {
  let task: ConcreteTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: { basePath: 'https://api.upsun.com' },
    } as any;

    task = new ConcreteTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should store the client', () => {
      expect(task).toHaveProperty('client');
    });
  });

  // ─── ID validators ───────────────────────────────────────────────────────────

  describe('checkUserId', () => {
    it('should not throw for a valid user ID', () => {
      expect(() => TaskBase.checkUserId('user-123')).not.toThrow();
    });

    it('should throw when user ID is empty', () => {
      expect(() => TaskBase.checkUserId('')).toThrow('User ID is required');
    });
  });

  describe('checkProjectId', () => {
    it('should not throw for a valid project ID', () => {
      expect(() => TaskBase.checkProjectId('proj-abc')).not.toThrow();
    });

    it('should throw when project ID is empty', () => {
      expect(() => TaskBase.checkProjectId('')).toThrow('Project ID is required');
    });
  });

  describe('checkOrganizationId', () => {
    it('should not throw for a valid organization ID', () => {
      expect(() => TaskBase.checkOrganizationId('org-1')).not.toThrow();
    });

    it('should throw when organization ID is empty', () => {
      expect(() => TaskBase.checkOrganizationId('')).toThrow('Organization ID is required');
    });
  });

  describe('checkEnvironmentId', () => {
    it('should not throw for a valid environment ID', () => {
      expect(() => TaskBase.checkEnvironmentId('main')).not.toThrow();
    });

    it('should throw when environment ID is empty', () => {
      expect(() => TaskBase.checkEnvironmentId('')).toThrow('Environment ID is required');
    });
  });

  describe('checkActivityId', () => {
    it('should not throw for a valid activity ID', () => {
      expect(() => TaskBase.checkActivityId('act-1')).not.toThrow();
    });

    it('should throw when activity ID is empty', () => {
      expect(() => TaskBase.checkActivityId('')).toThrow('Activity ID is required');
    });
  });

  describe('checkApplicationId', () => {
    it('should not throw for a valid application ID', () => {
      expect(() => TaskBase.checkApplicationId('app')).not.toThrow();
    });

    it('should throw when application ID is empty', () => {
      expect(() => TaskBase.checkApplicationId('')).toThrow('Application ID is required');
    });
  });

  describe('checkBackupId', () => {
    it('should not throw for a valid backup ID', () => {
      expect(() => TaskBase.checkBackupId('bkp-1')).not.toThrow();
    });

    it('should throw when backup ID is empty', () => {
      expect(() => TaskBase.checkBackupId('')).toThrow('Backup ID is required');
    });
  });

  describe('checkCertificateId', () => {
    it('should not throw for a valid certificate ID', () => {
      expect(() => TaskBase.checkCertificateId('cert-1')).not.toThrow();
    });

    it('should throw when certificate ID is empty', () => {
      expect(() => TaskBase.checkCertificateId('')).toThrow('Certificate ID is required');
    });
  });

  describe('checkSubscriptionId', () => {
    it('should not throw for a valid subscription ID', () => {
      expect(() => TaskBase.checkSubscriptionId('sub-1')).not.toThrow();
    });

    it('should throw when subscription ID is empty', () => {
      expect(() => TaskBase.checkSubscriptionId('')).toThrow('Subscription ID is required');
    });
  });

  describe('checkTeamId', () => {
    it('should not throw for a valid team ID', () => {
      expect(() => TaskBase.checkTeamId('team-1')).not.toThrow();
    });

    it('should throw when team ID is empty', () => {
      expect(() => TaskBase.checkTeamId('')).toThrow('Team ID is required');
    });
  });

  describe('checkDeploymentId', () => {
    it('should not throw for "current"', () => {
      expect(() => TaskBase.checkDeploymentId('current')).not.toThrow();
    });

    it('should throw when deployment ID is empty', () => {
      expect(() => TaskBase.checkDeploymentId('')).toThrow('Deployment ID is required');
    });
  });

  describe('checkInvoiceId', () => {
    it('should not throw for a valid invoice ID', () => {
      expect(() => TaskBase.checkInvoiceId('inv-2024-01')).not.toThrow();
    });

    it('should throw when invoice ID is empty', () => {
      expect(() => TaskBase.checkInvoiceId('')).toThrow('Invoice ID is required');
    });
  });

  describe('checkOrderId', () => {
    it('should not throw for a valid order ID', () => {
      expect(() => TaskBase.checkOrderId('ord-1')).not.toThrow();
    });

    it('should throw when order ID is empty', () => {
      expect(() => TaskBase.checkOrderId('')).toThrow('Order ID is required');
    });
  });

  describe('checkVoucherCode', () => {
    it('should not throw for a valid voucher code', () => {
      expect(() => TaskBase.checkVoucherCode('SUMMER2025')).not.toThrow();
    });

    it('should throw when voucher code is empty', () => {
      expect(() => TaskBase.checkVoucherCode('')).toThrow('Voucher code is required');
    });
  });

  describe('checkProjectRegion', () => {
    it('should not throw for a valid project region', () => {
      expect(() => TaskBase.checkProjectRegion('eu-5')).not.toThrow();
    });

    it('should throw when project region is empty', () => {
      expect(() => TaskBase.checkProjectRegion('')).toThrow('Project region is required');
    });
  });

  describe('checkVariableId', () => {
    it('should not throw for a valid variable ID', () => {
      expect(() => TaskBase.checkVariableId('var-1')).not.toThrow();
    });

    it('should throw when variable ID is empty', () => {
      expect(() => TaskBase.checkVariableId('')).toThrow('Variable ID is required');
    });
  });

  describe('checkIntegrationId', () => {
    it('should not throw for a valid integration ID', () => {
      expect(() => TaskBase.checkIntegrationId('int-1')).not.toThrow();
    });

    it('should throw when integration ID is empty', () => {
      expect(() => TaskBase.checkIntegrationId('')).toThrow('Integration ID is required');
    });
  });

  describe('checkDomainId', () => {
    it('should not throw for a valid domain ID', () => {
      expect(() => TaskBase.checkDomainId('dom-1')).not.toThrow();
    });

    it('should throw when domain ID is empty', () => {
      expect(() => TaskBase.checkDomainId('')).toThrow('Domain ID is required');
    });
  });

  describe('checkApiTokenId', () => {
    it('should not throw for a valid token ID', () => {
      expect(() => TaskBase.checkApiTokenId('tok-1')).not.toThrow();
    });

    it('should throw when token ID is empty', () => {
      expect(() => TaskBase.checkApiTokenId('')).toThrow('API Token ID is required');
    });
  });

  describe('checkTicketId', () => {
    it('should not throw for a valid ticket ID', () => {
      expect(() => TaskBase.checkTicketId('tkt-1')).not.toThrow();
    });

    it('should throw when ticket ID is empty', () => {
      expect(() => TaskBase.checkTicketId('')).toThrow('Ticket ID is required');
    });
  });

  describe('checkInviteId', () => {
    it('should not throw for a valid invite ID', () => {
      expect(() => TaskBase.checkInviteId('inv-1')).not.toThrow();
    });

    it('should throw when invite ID is empty', () => {
      expect(() => TaskBase.checkInviteId('')).toThrow('Invite ID is required');
    });
  });

  describe('checkRouteId', () => {
    it('should not throw for a valid route ID', () => {
      expect(() => TaskBase.checkRouteId('route-1')).not.toThrow();
    });

    it('should throw when route ID is empty', () => {
      expect(() => TaskBase.checkRouteId('')).toThrow('Route ID is required');
    });
  });

  describe('checkEnvironmentTypeId', () => {
    it('should not throw for a valid environment type ID', () => {
      expect(() => TaskBase.checkEnvironmentTypeId('production')).not.toThrow();
    });

    it('should throw when environment type ID is empty', () => {
      expect(() => TaskBase.checkEnvironmentTypeId('')).toThrow(
        'Environment Type ID is required',
      );
    });
  });

  describe('checkRepositoryBlobId', () => {
    it('should not throw for a valid blob ID', () => {
      expect(() => TaskBase.checkRepositoryBlobId('abc123')).not.toThrow();
    });

    it('should throw when blob ID is empty', () => {
      expect(() => TaskBase.checkRepositoryBlobId('')).toThrow('Repository Blob ID is required');
    });
  });

  describe('checkRepositoryCommitId', () => {
    it('should not throw for a valid commit ID', () => {
      expect(() => TaskBase.checkRepositoryCommitId('abc123')).not.toThrow();
    });

    it('should throw when commit ID is empty', () => {
      expect(() => TaskBase.checkRepositoryCommitId('')).toThrow(
        'Repository Commit ID is required',
      );
    });
  });

  describe('checkRepositoryRefId', () => {
    it('should not throw for a valid ref ID', () => {
      expect(() => TaskBase.checkRepositoryRefId('heads/main')).not.toThrow();
    });

    it('should throw when ref ID is empty', () => {
      expect(() => TaskBase.checkRepositoryRefId('')).toThrow('Repository Ref ID is required');
    });
  });

  describe('checkRepositoryTreeId', () => {
    it('should not throw for a valid tree ID', () => {
      expect(() => TaskBase.checkRepositoryTreeId('tree-abc')).not.toThrow();
    });

    it('should throw when tree ID is empty', () => {
      expect(() => TaskBase.checkRepositoryTreeId('')).toThrow('Repository Tree ID is required');
    });
  });

  describe('checkProjectRegion', () => {
    it('should not throw for a valid region', () => {
      expect(() => TaskBase.checkProjectRegion('eu-5.platform.sh')).not.toThrow();
    });

    it('should throw when region is empty', () => {
      expect(() => TaskBase.checkProjectRegion('')).toThrow('Project region is required');
    });
  });

  describe('checkUsername', () => {
    it('should not throw for a valid username', () => {
      expect(() => TaskBase.checkUsername('jdoe')).not.toThrow();
    });

    it('should throw when username is empty', () => {
      expect(() => TaskBase.checkUsername('')).toThrow('Username is required');
    });
  });

  // ─── SSH key ID ──────────────────────────────────────────────────────────────

  describe('checkSshKeyId', () => {
    it('should not throw for a positive key ID', () => {
      expect(() => TaskBase.checkSshKeyId(42)).not.toThrow();
    });

    it('should throw when key ID is 0', () => {
      expect(() => TaskBase.checkSshKeyId(0)).toThrow('Key ID must be a positive integer');
    });

    it('should throw when key ID is negative', () => {
      expect(() => TaskBase.checkSshKeyId(-5)).toThrow('Key ID must be a positive integer');
    });
  });

  // ─── Email ───────────────────────────────────────────────────────────────────

  describe('checkEmail', () => {
    it('should not throw for a valid email', () => {
      expect(() => TaskBase.checkEmail('user@example.com')).not.toThrow();
    });

    it('should throw when email is empty', () => {
      expect(() => TaskBase.checkEmail('')).toThrow('Email is required');
    });

    it('should throw for an invalid email format', () => {
      expect(() => TaskBase.checkEmail('not-an-email')).toThrow('Invalid email format');
    });

    it('should throw for an email without domain', () => {
      expect(() => TaskBase.checkEmail('user@')).toThrow('Invalid email format');
    });
  });

  // ─── extractSubscriptionId ───────────────────────────────────────────────────

  describe('extractSubscriptionId', () => {
    it('should extract the subscription ID from a URI', () => {
      const result = TaskBase.extractSubscriptionId(
        'https://api.upsun.com/subscriptions/abc123',
      );
      expect(result).toBe('abc123');
    });

    it('should work with a nested path', () => {
      const result = TaskBase.extractSubscriptionId(
        'https://api.upsun.com/v1/subscriptions/xyz-789',
      );
      expect(result).toBe('xyz-789');
    });
  });
});
