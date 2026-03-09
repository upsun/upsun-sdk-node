import { ApplicationsTask } from '../../../src/core/tasks/applications.js';
import { UpsunClient } from '../../../src/upsun.js';

// Mock the UpsunClient
jest.mock('../../../src/upsun.js');

describe('ApplicationsTask', () => {
  let applicationsTask: ApplicationsTask;
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

    applicationsTask = new ApplicationsTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize properly', () => {
      expect(applicationsTask).toBeDefined();
      expect(applicationsTask).toBeInstanceOf(ApplicationsTask);
    });

    it('should inherit from TaskBase', () => {
      expect(applicationsTask).toHaveProperty('client');
    });
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(applicationsTask.list).toBeDefined();
      expect(typeof applicationsTask.list).toBe('function');
    });

    it('should return webapps from current deployment', async () => {
      const mockWebapps = {
        app: { type: 'nodejs:20', disk: 512 },
        worker: { type: 'nodejs:20', disk: 256 },
      };
      const mockDeployment = { webapps: mockWebapps };
      (mockClient.environments.getDeployment as jest.Mock).mockResolvedValue(mockDeployment);

      const result = await applicationsTask.list('proj-1', 'main');
      expect(result).toEqual(mockWebapps);
      expect(mockClient.environments.getDeployment).toHaveBeenCalledWith(
        'proj-1',
        'main',
        'current',
      );
    });

    it('should return an empty object when deployment has no webapps', async () => {
      (mockClient.environments.getDeployment as jest.Mock).mockResolvedValue({});

      const result = await applicationsTask.list('proj-1', 'main');
      expect(result).toEqual({});
    });

    it('should handle API error', async () => {
      (mockClient.environments.getDeployment as jest.Mock).mockRejectedValue(
        new Error('Not found'),
      );
      await expect(applicationsTask.list('proj-1', 'main')).rejects.toThrow('Not found');
    });
  });

  describe('configGet', () => {
    it('should have configGet method defined', () => {
      expect(applicationsTask.configGet).toBeDefined();
      expect(typeof applicationsTask.configGet).toBe('function');
    });

    it('should return config for a specific application', async () => {
      const mockApp = { type: 'nodejs:20', disk: 512 };
      const mockDeployment = { webapps: { app: mockApp } };
      (mockClient.environments.getDeployment as jest.Mock).mockResolvedValue(mockDeployment);

      const result = await applicationsTask.configGet('proj-1', 'main', 'app');
      expect(result).toEqual(mockApp);
    });

    it('should return null when application is not found', async () => {
      const mockDeployment = { webapps: {} };
      (mockClient.environments.getDeployment as jest.Mock).mockResolvedValue(mockDeployment);

      const result = await applicationsTask.configGet('proj-1', 'main', 'missing-app');
      expect(result).toBeNull();
    });

    it('should throw when project ID is empty', async () => {
      await expect(applicationsTask.configGet('', 'main', 'app')).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when environment ID is empty', async () => {
      await expect(applicationsTask.configGet('proj-1', '', 'app')).rejects.toThrow(
        'Environment ID is required',
      );
    });

    it('should throw when application ID is empty', async () => {
      await expect(applicationsTask.configGet('proj-1', 'main', '')).rejects.toThrow(
        'Application ID is required',
      );
    });
  });
});
