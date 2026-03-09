import { WorkersTask } from '../../../src/core/tasks/workers.js';
import { UpsunClient } from '../../../src/upsun.js';

// Mock the UpsunClient
jest.mock('../../../src/upsun.js');

describe('WorkersTask', () => {
  let workersTask: WorkersTask;
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

    workersTask = new WorkersTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should have WorkersTask instance defined', () => {
      expect(workersTask).toBeDefined();
      expect(workersTask).toBeInstanceOf(WorkersTask);
    });

    it('should inherit from TaskBase', () => {
      expect(workersTask).toHaveProperty('client');
    });
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(workersTask.list).toBeDefined();
      expect(typeof workersTask.list).toBe('function');
    });

    it('should return workers from current deployment', async () => {
      const mockWorkers = {
        'queue-worker': { type: 'nodejs:20', commands: { start: 'node worker.js' } },
      };
      const mockDeployment = { workers: mockWorkers };
      (mockClient.environments.getDeployment as jest.Mock).mockResolvedValue(mockDeployment);

      const result = await workersTask.list('proj-1', 'main');
      expect(result).toEqual(mockWorkers);
      expect(mockClient.environments.getDeployment).toHaveBeenCalledWith(
        'proj-1',
        'main',
        'current',
      );
    });

    it('should throw when project ID is empty', async () => {
      await expect(workersTask.list('', 'main')).rejects.toThrow('Project ID is required');
    });

    it('should throw when environment ID is empty', async () => {
      await expect(workersTask.list('proj-1', '')).rejects.toThrow('Environment ID is required');
    });

    it('should handle API error', async () => {
      (mockClient.environments.getDeployment as jest.Mock).mockRejectedValue(
        new Error('Not found'),
      );
      await expect(workersTask.list('proj-1', 'main')).rejects.toThrow('Not found');
    });
  });
});
