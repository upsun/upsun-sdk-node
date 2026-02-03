import { CertificatesTask } from '../../../src/core/tasks/certificates.js';
import { UpsunClient } from '../../../src/upsun.js';
import { CertManagementApi } from '../../../src/api/index.js';

// Mock the UpsunClient and CertManagementApi
jest.mock('../../../src/upsun');
jest.mock('../../../src/api/index.js');

describe('CertificatesTask', () => {
  let certificatesTask: CertificatesTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockCertApi: jest.Mocked<CertManagementApi>;

  beforeEach(() => {
    mockCertApi = {
      createProjectsCertificates: jest.fn(),
      deleteProjectsCertificates: jest.fn(),
      getProjectsCertificates: jest.fn(),
      listProjectsCertificates: jest.fn(),
    } as any;

    (CertManagementApi as jest.MockedClass<typeof CertManagementApi>).mockImplementation(
      () => mockCertApi,
    );

    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    certificatesTask = new CertificatesTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add', () => {
    it('should have add method defined', () => {
      expect(certificatesTask.add).toBeDefined();
      expect(typeof certificatesTask.add).toBe('function');
    });

    it('should add a certificate to project', async () => {
      const mockCertificate = {
        id: 'cert-123',
        certificate: '-----BEGIN CERTIFICATE-----',
        created_at: '2023-01-01T00:00:00Z',
      };

      mockCertApi.createProjectsCertificates.mockResolvedValue(mockCertificate as any);

      const cert = '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAK\n-----END CERTIFICATE-----';
      const key =
        '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQ\n-----END PRIVATE KEY-----';

      const result = await certificatesTask.add('project-123', cert, key);
      expect(result).toBeDefined();
      expect(mockCertApi.createProjectsCertificates).toHaveBeenCalledWith({
        projectId: 'project-123',
        certificateCreateInput: {
          certificate: cert,
          key: key,
          chain: [],
        },
      });
    });

    it('should add a certificate with chain to project', async () => {
      const mockCertificate = {
        id: 'cert-123',
        certificate: '-----BEGIN CERTIFICATE-----',
        created_at: '2023-01-01T00:00:00Z',
      };

      mockCertApi.createProjectsCertificates.mockResolvedValue(mockCertificate as any);

      const cert = '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----';
      const key = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
      const chain = ['-----BEGIN CERTIFICATE-----\nchain\n-----END CERTIFICATE-----'];

      const result = await certificatesTask.add('project-123', cert, key, chain);
      expect(result).toBeDefined();
      expect(mockCertApi.createProjectsCertificates).toHaveBeenCalledWith({
        projectId: 'project-123',
        certificateCreateInput: {
          certificate: cert,
          key: key,
          chain: chain,
        },
      });
    });

    it('should handle certificate addition errors', async () => {
      mockCertApi.createProjectsCertificates.mockRejectedValue(new Error('Invalid certificate'));

      const cert = '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----';
      const key = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';

      await expect(certificatesTask.add('project-123', cert, key)).rejects.toThrow(
        'Invalid certificate',
      );
    });

    it('should throw error when certificate is missing', async () => {
      await expect(certificatesTask.add('project-123', '', 'key')).rejects.toThrow(
        'Certificate and key are required',
      );
    });

    it('should throw error when key is missing', async () => {
      await expect(certificatesTask.add('project-123', 'cert', '')).rejects.toThrow(
        'Certificate and key are required',
      );
    });
  });

  describe('delete', () => {
    it('should have delete method defined', () => {
      expect(certificatesTask.delete).toBeDefined();
      expect(typeof certificatesTask.delete).toBe('function');
    });

    it('should delete a certificate from project', async () => {
      const mockResult = { success: true };

      mockCertApi.deleteProjectsCertificates.mockResolvedValue(mockResult as any);

      const result = await certificatesTask.delete('project-123', 'cert-456');
      expect(result).toBeDefined();
      expect(mockCertApi.deleteProjectsCertificates).toHaveBeenCalledWith({
        projectId: 'project-123',
        certificateId: 'cert-456',
      });
    });

    it('should handle certificate deletion errors', async () => {
      mockCertApi.deleteProjectsCertificates.mockRejectedValue(new Error('Certificate not found'));

      await expect(certificatesTask.delete('project-123', 'cert-456')).rejects.toThrow(
        'Certificate not found',
      );
    });
  });

  describe('get', () => {
    it('should have get method defined', () => {
      expect(certificatesTask.get).toBeDefined();
      expect(typeof certificatesTask.get).toBe('function');
    });

    it('should get certificate information', async () => {
      const mockCertificate = {
        id: 'cert-123',
        certificate: '-----BEGIN CERTIFICATE-----',
        domains: ['example.com'],
        created_at: '2023-01-01T00:00:00Z',
      };

      mockCertApi.getProjectsCertificates.mockResolvedValue(mockCertificate as any);

      const result = await certificatesTask.get('project-123', 'cert-456');
      expect(result).toBeDefined();
      expect((result as any).id).toBe('cert-123');
      expect(mockCertApi.getProjectsCertificates).toHaveBeenCalledWith({
        projectId: 'project-123',
        certificateId: 'cert-456',
      });
    });
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(certificatesTask.list).toBeDefined();
      expect(typeof certificatesTask.list).toBe('function');
    });

    it('should list project certificates', async () => {
      const mockCertificates = [
        { id: 'cert-123', domains: ['example.com'], created_at: '2023-01-01T00:00:00Z' },
        { id: 'cert-456', domains: ['test.com'], created_at: '2023-01-02T00:00:00Z' },
      ];

      mockCertApi.listProjectsCertificates.mockResolvedValue(mockCertificates as any);

      const result = await certificatesTask.list('project-123');
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect((result[0] as any).id).toBe('cert-123');
      expect(mockCertApi.listProjectsCertificates).toHaveBeenCalledWith({
        projectId: 'project-123',
      });
    });

    it('should handle empty certificate list', async () => {
      mockCertApi.listProjectsCertificates.mockResolvedValue([]);

      const result = await certificatesTask.list('project-123');
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should have update method defined', () => {
      expect(certificatesTask.update).toBeDefined();
      expect(typeof certificatesTask.update).toBe('function');
    });

    it('should update a certificate', async () => {
      const mockResponse = { status: 'ok' };
      mockCertApi.updateProjectsCertificates = jest.fn().mockResolvedValue(mockResponse);

      const isInvalid = false;
      const chain = ['-----BEGIN CERTIFICATE-----\nchain\n-----END CERTIFICATE-----'];

      const result = await certificatesTask.update('project-123', 'cert-456', chain, isInvalid);
      expect(result).toBe(mockResponse);
      expect(mockCertApi.updateProjectsCertificates).toHaveBeenCalledWith({
        projectId: 'project-123',
        certificateId: 'cert-456',
        certificatePatch: { chain: chain, isInvalid: isInvalid },
      });
    });

    it('should handle update errors', async () => {
      mockCertApi.updateProjectsCertificates = jest.fn().mockRejectedValue(new Error('Update failed'));
      const chain = ['-----BEGIN CERTIFICATE-----\nchain\n-----END CERTIFICATE-----'];
      const isInvalid = false;
      await expect(certificatesTask.update('project-123', 'cert-456', chain, isInvalid)).rejects.toThrow('Update failed');
    });
  });

  
});
