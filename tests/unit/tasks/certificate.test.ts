import { CertificateTask } from '../../../src/core/tasks/certificate.js';
import { UpsunClient } from '../../../src/upsun.js';
import { CertManagementApi } from '../../../src/apis-gen/index.js';

// Mock the UpsunClient and CertManagementApi
jest.mock('../../../src/upsun');
jest.mock('../../../src/apis-gen/index.js');

describe('CertificateTask', () => {
  let certificateTask: CertificateTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockCertApi: jest.Mocked<CertManagementApi>;

  beforeEach(() => {
    mockCertApi = {
      createProjectsCertificates: jest.fn(),
      deleteProjectsCertificates: jest.fn(),
      getProjectsCertificates: jest.fn(),
      listProjectsCertificates: jest.fn()
    } as any;

    (CertManagementApi as jest.MockedClass<typeof CertManagementApi>).mockImplementation(() => mockCertApi);

    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com'
      }
    } as any;
    
    certificateTask = new CertificateTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add', () => {
    it('should have add method defined', () => {
      expect(certificateTask.add).toBeDefined();
      expect(typeof certificateTask.add).toBe('function');
    });

    it('should add a certificate to project', async () => {
      const mockCertificate = {
        id: 'cert-123',
        certificate: '-----BEGIN CERTIFICATE-----',
        created_at: '2023-01-01T00:00:00Z'
      };

      mockCertApi.createProjectsCertificates.mockResolvedValue(mockCertificate as any);

      const cert = '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAK\n-----END CERTIFICATE-----';
      const key = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQ\n-----END PRIVATE KEY-----';
      
      const result = await certificateTask.add('project-123', cert, key);
      expect(result).toBeDefined();
      expect(mockCertApi.createProjectsCertificates).toHaveBeenCalledWith({
        projectId: 'project-123',
        certificateCreateInput: {
          certificate: cert,
          key: key,
          chain: []
        }
      });
    });

    it('should add a certificate with chain to project', async () => {
      const mockCertificate = {
        id: 'cert-123',
        certificate: '-----BEGIN CERTIFICATE-----',
        created_at: '2023-01-01T00:00:00Z'
      };

      mockCertApi.createProjectsCertificates.mockResolvedValue(mockCertificate as any);

      const cert = '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----';
      const key = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
      const chain = ['-----BEGIN CERTIFICATE-----\nchain\n-----END CERTIFICATE-----'];
      
      const result = await certificateTask.add('project-123', cert, key, chain);
      expect(result).toBeDefined();
      expect(mockCertApi.createProjectsCertificates).toHaveBeenCalledWith({
        projectId: 'project-123',
        certificateCreateInput: {
          certificate: cert,
          key: key,
          chain: chain
        }
      });
    });

    it('should handle certificate addition errors', async () => {
      mockCertApi.createProjectsCertificates.mockRejectedValue(new Error('Invalid certificate'));

      const cert = '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----';
      const key = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';

      await expect(certificateTask.add('project-123', cert, key)).rejects.toThrow('Invalid certificate');
    });

    it('should throw error when certificate is missing', async () => {
      await expect(certificateTask.add('project-123', '', 'key')).rejects.toThrow('Certificate and key are required');
    });

    it('should throw error when key is missing', async () => {
      await expect(certificateTask.add('project-123', 'cert', '')).rejects.toThrow('Certificate and key are required');
    });
  });

  describe('delete', () => {
    it('should have delete method defined', () => {
      expect(certificateTask.delete).toBeDefined();
      expect(typeof certificateTask.delete).toBe('function');
    });

    it('should delete a certificate from project', async () => {
      const mockResult = { success: true };

      mockCertApi.deleteProjectsCertificates.mockResolvedValue(mockResult as any);

      const result = await certificateTask.delete('project-123', 'cert-456');
      expect(result).toBeDefined();
      expect(mockCertApi.deleteProjectsCertificates).toHaveBeenCalledWith({
        projectId: 'project-123',
        certificateId: 'cert-456'
      });
    });

    it('should handle certificate deletion errors', async () => {
      mockCertApi.deleteProjectsCertificates.mockRejectedValue(new Error('Certificate not found'));

      await expect(certificateTask.delete('project-123', 'cert-456')).rejects.toThrow('Certificate not found');
    });
  });

  describe('get', () => {
    it('should have get method defined', () => {
      expect(certificateTask.get).toBeDefined();
      expect(typeof certificateTask.get).toBe('function');
    });

    it('should get certificate information', async () => {
      const mockCertificate = {
        id: 'cert-123',
        certificate: '-----BEGIN CERTIFICATE-----',
        domains: ['example.com'],
        created_at: '2023-01-01T00:00:00Z'
      };

      mockCertApi.getProjectsCertificates.mockResolvedValue(mockCertificate as any);

      const result = await certificateTask.get('project-123', 'cert-456');
      expect(result).toBeDefined();
      expect((result as any).id).toBe('cert-123');
      expect(mockCertApi.getProjectsCertificates).toHaveBeenCalledWith({
        projectId: 'project-123',
        certificateId: 'cert-456'
      });
    });
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(certificateTask.list).toBeDefined();
      expect(typeof certificateTask.list).toBe('function');
    });

    it('should list project certificates', async () => {
      const mockCertificates = [
        { id: 'cert-123', domains: ['example.com'], created_at: '2023-01-01T00:00:00Z' },
        { id: 'cert-456', domains: ['test.com'], created_at: '2023-01-02T00:00:00Z' }
      ];

      mockCertApi.listProjectsCertificates.mockResolvedValue(mockCertificates as any);

      const result = await certificateTask.list('project-123');
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect((result[0] as any).id).toBe('cert-123');
      expect(mockCertApi.listProjectsCertificates).toHaveBeenCalledWith({
        projectId: 'project-123'
      });
    });

    it('should handle empty certificate list', async () => {
      mockCertApi.listProjectsCertificates.mockResolvedValue([]);

      const result = await certificateTask.list('project-123');
      expect(result).toEqual([]);
    });
  });
});
