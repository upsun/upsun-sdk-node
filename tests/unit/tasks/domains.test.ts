import { DomainsTask } from '../../../src/core/tasks/domains.js';
import { UpsunClient } from '../../../src/upsun.js';
import { DomainManagementApi } from '../../../src/api/index.js';

// Mock the UpsunClient and DomainManagementApi
jest.mock('../../../src/upsun.js');
jest.mock('../../../src/api/index.js');

describe('DomainsTask', () => {
  let domainsTask: DomainsTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockDomainApi: jest.Mocked<DomainManagementApi>;

  beforeEach(() => {
    mockDomainApi = {
      createProjectsDomains: jest.fn(),
      createProjectsEnvironmentsDomains: jest.fn(),
      deleteProjectsDomains: jest.fn(),
      deleteProjectsEnvironmentsDomains: jest.fn(),
      getProjectsDomains: jest.fn(),
      getProjectsEnvironmentsDomains: jest.fn(),
      listProjectsDomains: jest.fn(),
      listProjectsEnvironmentsDomains: jest.fn(),
    } as any;

    (DomainManagementApi as jest.MockedClass<typeof DomainManagementApi>).mockImplementation(
      () => mockDomainApi,
    );

    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    domainsTask = new DomainsTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add', () => {
    it('should have add method defined', () => {
      expect(domainsTask.add).toBeDefined();
      expect(typeof domainsTask.add).toBe('function');
    });

    it('should add a domain to project', async () => {
      const mockDomain = {
        name: 'example.com',
        ssl: { has_certificate: false },
        created_at: '2023-01-01T00:00:00Z',
      };

      mockDomainApi.createProjectsDomains.mockResolvedValue(mockDomain as any);

      const result = await domainsTask.add('project-123', 'example.com');
      expect(result).toBeDefined();
      expect(mockDomainApi.createProjectsDomains).toHaveBeenCalledWith({
        projectId: 'project-123',
        domainCreateInput: { name: 'example.com' },
      });
    });

    it('should add a domain to environment', async () => {
      const mockDomain = {
        name: 'example.com',
        ssl: { has_certificate: false },
        created_at: '2023-01-01T00:00:00Z',
      };

      mockDomainApi.createProjectsEnvironmentsDomains.mockResolvedValue(mockDomain as any);

      const result = await domainsTask.add('project-123', 'example.com', 'env-456');
      expect(result).toBeDefined();
      expect(mockDomainApi.createProjectsEnvironmentsDomains).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'env-456',
        domainCreateInput: { name: 'example.com' },
      });
    });

    it('should handle domain addition errors', async () => {
      mockDomainApi.createProjectsDomains.mockRejectedValue(new Error('Domain already exists'));

      await expect(domainsTask.add('project-123', 'example.com')).rejects.toThrow(
        'Domain already exists',
      );
    });
  });

  describe('delete', () => {
    it('should have delete method defined', () => {
      expect(domainsTask.delete).toBeDefined();
      expect(typeof domainsTask.delete).toBe('function');
    });

    it('should delete a domain from project', async () => {
      const mockResult = { success: true };

      mockDomainApi.deleteProjectsDomains.mockResolvedValue(mockResult as any);

      const result = await domainsTask.delete('project-123', 'domain-456');
      expect(result).toBeDefined();
      expect(mockDomainApi.deleteProjectsDomains).toHaveBeenCalledWith({
        projectId: 'project-123',
        domainId: 'domain-456',
      });
    });

    it('should delete a domain from environment', async () => {
      const mockResult = { success: true };

      mockDomainApi.deleteProjectsEnvironmentsDomains.mockResolvedValue(mockResult as any);

      const result = await domainsTask.delete('project-123', 'domain-456', 'env-789');
      expect(result).toBeDefined();
      expect(mockDomainApi.deleteProjectsEnvironmentsDomains).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'env-789',
        domainId: 'domain-456',
      });
    });

    it('should handle domain deletion errors', async () => {
      mockDomainApi.deleteProjectsDomains.mockRejectedValue(new Error('Domain not found'));

      await expect(domainsTask.delete('project-123', 'domain-456')).rejects.toThrow(
        'Domain not found',
      );
    });
  });

  describe('get', () => {
    it('should have get method defined', () => {
      expect(domainsTask.get).toBeDefined();
      expect(typeof domainsTask.get).toBe('function');
    });

    it('should get domain information', async () => {
      const mockDomain = {
        name: 'example.com',
        ssl: { has_certificate: true },
        created_at: '2023-01-01T00:00:00Z',
      };

      mockDomainApi.getProjectsDomains.mockResolvedValue(mockDomain as any);

      const result = await domainsTask.get('project-123', 'domain-456');
      expect(result).toBeDefined();
      expect((result as any).name).toBe('example.com');
      expect(mockDomainApi.getProjectsDomains).toHaveBeenCalledWith({
        projectId: 'project-123',
        domainId: 'domain-456',
      });
    });

    it('should get environment domain information', async () => {
      const mockDomain = {
        name: 'example.com',
        ssl: { has_certificate: true },
        created_at: '2023-01-01T00:00:00Z',
      };

      mockDomainApi.getProjectsEnvironmentsDomains.mockResolvedValue(mockDomain as any);

      const result = await domainsTask.get('project-123', 'domain-456', 'env-789');
      expect(result).toBeDefined();
      expect((result as any).name).toBe('example.com');
      expect(mockDomainApi.getProjectsEnvironmentsDomains).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'env-789',
        domainId: 'domain-456',
      });
    });
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(domainsTask.list).toBeDefined();
      expect(typeof domainsTask.list).toBe('function');
    });

    it('should list project domains', async () => {
      const mockDomains = [
        { name: 'example.com', ssl: { has_certificate: true } },
        { name: 'test.com', ssl: { has_certificate: false } },
      ];

      mockDomainApi.listProjectsDomains.mockResolvedValue(mockDomains as any);

      const result = await domainsTask.list('project-123');
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect((result[0] as any).name).toBe('example.com');
      expect(mockDomainApi.listProjectsDomains).toHaveBeenCalledWith({
        projectId: 'project-123',
      });
    });

    it('should list environment domains', async () => {
      const mockDomains = [{ name: 'env-example.com', ssl: { has_certificate: true } }];

      mockDomainApi.listProjectsEnvironmentsDomains.mockResolvedValue(mockDomains as any);

      const result = await domainsTask.list('project-123', 'env-456');
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect((result[0] as any).name).toBe('env-example.com');
      expect(mockDomainApi.listProjectsEnvironmentsDomains).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'env-456',
      });
    });

    it('should handle empty domain list', async () => {
      mockDomainApi.listProjectsDomains.mockResolvedValue([]);

      const result = await domainsTask.list('project-123');
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should have update method defined', () => {
      expect(domainsTask.update).toBeDefined();
      expect(typeof domainsTask.update).toBe('function');
    });

    it('should throw "Method not implemented" error', async () => {
      await expect(domainsTask.update('project-123', 'example.com')).rejects.toThrow(
        'Method not implemented.',
      );
    });
  });
});
