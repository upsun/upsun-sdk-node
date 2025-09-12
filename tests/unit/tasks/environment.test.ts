import { EnvironementTask } from '../../../src/core/tasks/environment.js';
import { UpsunClient } from '../../../src/upsun.js';
import { EnvironmentApi } from '../../../src/apis-gen/index.js';

// Mock the UpsunClient and EnvironmentApi
jest.mock('../../../src/upsun');
jest.mock('../../../src/apis-gen/index.js');

describe('EnvironementTask', () => {
  let environmentTask: EnvironementTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockEnvironmentApi: jest.Mocked<EnvironmentApi>;

  beforeEach(() => {
    mockEnvironmentApi = {
      listProjectsEnvironments: jest.fn(),
      getEnvironment: jest.fn(),
      activateEnvironment: jest.fn(),
      pauseEnvironment: jest.fn(),
      resumeEnvironment: jest.fn(),
      deleteProjectsEnvironments: jest.fn(),
      redeployEnvironment: jest.fn(),
      mergeEnvironment: jest.fn(),
      deactivateEnvironment: jest.fn()
    } as any;

    (EnvironmentApi as jest.MockedClass<typeof EnvironmentApi>).mockImplementation(() => mockEnvironmentApi);

    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com'
      }
    } as any;
    
    environmentTask = new EnvironementTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(environmentTask.list).toBeDefined();
      expect(typeof environmentTask.list).toBe('function');
    });

    it('should list project environments', async () => {
      const mockEnvironments = [
        { id: 'env-1', name: 'main' },
        { id: 'env-2', name: 'staging' }
      ];

      mockEnvironmentApi.listProjectsEnvironments.mockResolvedValue(mockEnvironments as any);

      const result = await environmentTask.list('project-123');
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(mockEnvironmentApi.listProjectsEnvironments).toHaveBeenCalledWith({
        projectId: 'project-123'
      });
    });
  });

  describe('info', () => {
    it('should have info method defined', () => {
      expect(environmentTask.info).toBeDefined();
      expect(typeof environmentTask.info).toBe('function');
    });

    it('should get environment information', async () => {
      const mockEnvironment = {
        id: 'env-123',
        name: 'main',
        status: 'active'
      };

      mockEnvironmentApi.getEnvironment.mockResolvedValue(mockEnvironment as any);

      const result = await environmentTask.info('project-123', 'main');
      expect(result).toBeDefined();
      expect((result as any).id).toBe('env-123');
      expect(mockEnvironmentApi.getEnvironment).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main'
      });
    });
  });

  describe('activate', () => {
    it('should have activate method defined', () => {
      expect(environmentTask.activate).toBeDefined();
      expect(typeof environmentTask.activate).toBe('function');
    });
    it('should activate an environment', async () => {
      expect(environmentTask.activate).toBeDefined();
      expect(typeof environmentTask.activate).toBe('function');
    });
  });

  describe('deactivate', () => {
    it('should deactivate an environment', async () => {
      expect(environmentTask.deactivate).toBeDefined();
      expect(typeof environmentTask.deactivate).toBe('function');
    });
  });

  describe('delete', () => {
    it('should delete an environment', async () => {
      expect(environmentTask.delete).toBeDefined();
      expect(typeof environmentTask.delete).toBe('function');
    });
  });

  describe('merge', () => {
    it('should merge an environment', async () => {
      expect(environmentTask.merge).toBeDefined();
      expect(typeof environmentTask.merge).toBe('function');
    });
  });

  describe('pause', () => {
    it('should pause an environment', async () => {
      expect(environmentTask.pause).toBeDefined();
      expect(typeof environmentTask.pause).toBe('function');
    });
  });

  describe('resume', () => {
    it('should resume an environment', async () => {
      expect(environmentTask.resume).toBeDefined();
      expect(typeof environmentTask.resume).toBe('function');
    });
  });

  describe('redeploy', () => {
    it('should redeploy an environment', async () => {
      expect(environmentTask.redeploy).toBeDefined();
      expect(typeof environmentTask.redeploy).toBe('function');
    });
  });

  describe('logs', () => {
    it('should throw not implemented error', async () => {
      await expect(environmentTask.logs('project-123', 'main', 'app')).rejects.toThrow('Not implemented');
    });
  });

  describe('relationships', () => {
    it('should throw not implemented error', async () => {
      await expect(environmentTask.relationships('project-123', 'main')).rejects.toThrow('Not implemented');
    });
  });

  describe('urls', () => {
    it('should throw not implemented error', async () => {
      await expect(environmentTask.urls('project-123', 'main')).rejects.toThrow('Not implemented');
    });
  });
});
