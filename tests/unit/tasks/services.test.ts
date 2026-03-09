import { ServicesTask } from '../../../src/core/tasks/services.js';
import { UpsunClient } from '../../../src/upsun.js';

// Mock the UpsunClient
jest.mock('../../../src/upsun.js');

describe('ServicesTask', () => {
  let serviceTask: ServicesTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
      environments: {
        getDeployment: jest.fn(),
      },
    } as any;

    serviceTask = new ServicesTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should have ServiceTask instance defined', () => {
      expect(serviceTask).toBeDefined();
      expect(serviceTask).toBeInstanceOf(ServicesTask);
    });

    it('should inherit from TaskBase', () => {
      expect(serviceTask).toHaveProperty('client');
    });
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(serviceTask.list).toBeDefined();
      expect(typeof serviceTask.list).toBe('function');
    });

    it('should return services from current deployment', async () => {
      const mockServices = {
        db: { type: 'postgresql:15', disk: 1024 },
        cache: { type: 'redis:7.0' },
      };
      const mockDeployment = { services: mockServices };
      (mockClient.environments.getDeployment as jest.Mock).mockResolvedValue(mockDeployment);

      const result = await serviceTask.list('proj-1', 'main');
      expect(result).toEqual(mockServices);
      expect(mockClient.environments.getDeployment).toHaveBeenCalledWith(
        'proj-1',
        'main',
        'current',
      );
    });

    it('should return an empty object when deployment has no services', async () => {
      (mockClient.environments.getDeployment as jest.Mock).mockResolvedValue({});

      const result = await serviceTask.list('proj-1', 'main');
      expect(result).toEqual({});
    });

    it('should handle API error', async () => {
      (mockClient.environments.getDeployment as jest.Mock).mockRejectedValue(
        new Error('Not found'),
      );
      await expect(serviceTask.list('proj-1', 'main')).rejects.toThrow('Not found');
    });
  });
});
