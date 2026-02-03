import { OrganizationsTask } from '../../../src/core/tasks/organizations.js';
import { UpsunClient } from '../../../src/upsun.js';
import { OrganizationsApi } from '../../../src/api/index.js';
import nock from 'nock';

// Mock the UpsunClient and OrganizationsApi
jest.mock('../../../src/upsun');
jest.mock('../../../src/api/index.js');

describe('OrganizationsTask', () => {
  let organizationsTask: OrganizationsTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockOrgApi: jest.Mocked<OrganizationsApi>;

  beforeEach(() => {
    // Mock OAuth2 authentication
    nock('https://auth.upsun.com').post('/oauth2/token').reply(200, {
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
    });

    mockOrgApi = {
      getOrg: jest.fn(),
      createOrg: jest.fn(),
      listUserOrgs: jest.fn(),
      deleteOrg: jest.fn(),
    } as any;

    (OrganizationsApi as jest.MockedClass<typeof OrganizationsApi>).mockImplementation(
      () => mockOrgApi,
    );

    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
      getUserId: jest.fn().mockResolvedValue('user-123'),
    } as any;

    organizationsTask = new OrganizationsTask(mockClient);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(organizationsTask.list).toBeDefined();
      expect(typeof organizationsTask.list).toBe('function');
    });
  });

  describe('info', () => {
    it('should have info method defined', () => {
      expect(organizationsTask.info).toBeDefined();
      expect(typeof organizationsTask.info).toBe('function');
    });
  });

  describe('create', () => {
    it('should have create method defined', () => {
      expect(organizationsTask.create).toBeDefined();
      expect(typeof organizationsTask.create).toBe('function');
    });
  });

  describe('info', () => {
    it('should get organization information', async () => {
      const mockOrganization = {
        id: 'org-123',
        name: 'Test Organization',
        description: 'A test organization',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
      };

      mockOrgApi.getOrg.mockResolvedValue(mockOrganization);

      const result = await organizationsTask.info('org-123');
      expect(result).toEqual(mockOrganization);
      expect(mockOrgApi.getOrg).toHaveBeenCalledWith({ organizationId: 'org-123' });
    });

    it('should handle info errors for non-existent organization', async () => {
      mockOrgApi.getOrg.mockRejectedValue(new Error('Organization not found'));

      await expect(organizationsTask.info('non-existent')).rejects.toThrow('Organization not found');
    });
  });

  describe('create', () => {
    it('should create a new organization', async () => {
      const mockOrganization = {
        id: 'org-123',
        name: 'Test Organization',
        created_at: '2023-01-01T00:00:00Z',
      };

      mockOrgApi.createOrg.mockResolvedValue(mockOrganization);

      const result = await organizationsTask.create('Test Organization');
      expect(result).toEqual(mockOrganization);
      expect(mockOrgApi.createOrg).toHaveBeenCalledWith({
        createOrgRequest: {
          ownerId: undefined,
          name: undefined,
          label: 'Test Organization',
          country: undefined,
        },
      });
    });

    it('should handle creation errors', async () => {
      mockOrgApi.createOrg.mockRejectedValue(new Error('Invalid organization name'));

      await expect(organizationsTask.create('Invalid Name')).rejects.toThrow(
        'Invalid organization name',
      );
    });
  });

  describe('delete', () => {
    it('should have delete method defined', () => {
      expect(organizationsTask.delete).toBeDefined();
      expect(typeof organizationsTask.delete).toBe('function');
    });
  });
});
