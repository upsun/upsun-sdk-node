import { ResourcesTask } from '../../../src/core/tasks/resources.js';
import { UpsunClient } from '../../../src/upsun.js';
import { AutoscalingApi, DeploymentApi } from '../../../src/api/index.js';
import { DeploymentResourceGroup } from '../../../src/core/model.js';

jest.mock('../../../src/upsun.js');
jest.mock('../../../src/api/index.js');

describe('ResourcesTask', () => {
  let resourcesTask: ResourcesTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockDeploymentApi: jest.Mocked<DeploymentApi>;
  let mockAutoscalingApi: jest.Mocked<AutoscalingApi>;

  beforeEach(() => {
    mockDeploymentApi = {
      updateProjectsEnvironmentsDeploymentsNext: jest.fn(),
    } as any;

    mockAutoscalingApi = {
      getAutoscalerSettings: jest.fn(),
      postAutoscalerSettings: jest.fn(),
    } as any;

    (DeploymentApi as jest.MockedClass<typeof DeploymentApi>).mockImplementation(
      () => mockDeploymentApi,
    );
    (AutoscalingApi as jest.MockedClass<typeof AutoscalingApi>).mockImplementation(
      () => mockAutoscalingApi,
    );

    mockClient = {
      apiConfig: { basePath: 'https://api.upsun.com' },
      environments: {
        getDeployment: jest.fn(),
      },
    } as any;

    resourcesTask = new ResourcesTask(mockClient, mockDeploymentApi, mockAutoscalingApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should have get method defined', () => {
      expect(resourcesTask.get).toBeDefined();
      expect(typeof resourcesTask.get).toBe('function');
    });

    it('should return webapp resources from current deployment', async () => {
      const mockResources = { profileSize: 'STANDARD_1X', disk: 512, instanceCount: 1 };
      const mockDeployment = {
        webapps: {
          app: { resources: mockResources },
        },
      };
      (mockClient.environments.getDeployment as jest.Mock).mockResolvedValue(mockDeployment);

      const result = await resourcesTask.get('proj-1', 'main');
      expect(result).toEqual(mockResources);
      expect(mockClient.environments.getDeployment).toHaveBeenCalledWith(
        'proj-1',
        'main',
        'current',
      );
    });

    it('should return resources for a specific app name', async () => {
      const mockResources = { profileSize: 'STANDARD_2X', disk: 1024, instanceCount: 2 };
      const mockDeployment = {
        webapps: {
          backend: { resources: mockResources },
        },
      };
      (mockClient.environments.getDeployment as jest.Mock).mockResolvedValue(mockDeployment);

      const result = await resourcesTask.get(
        'proj-1',
        'main',
        DeploymentResourceGroup.webapps,
        'backend',
      );
      expect(result).toEqual(mockResources);
    });

    it('should return an empty object when deployment is null', async () => {
      (mockClient.environments.getDeployment as jest.Mock).mockResolvedValue(null);

      const result = await resourcesTask.get('proj-1', 'main');
      expect(result).toEqual({});
    });

    it('should return an empty object when app is not found', async () => {
      const mockDeployment = { webapps: {} };
      (mockClient.environments.getDeployment as jest.Mock).mockResolvedValue(mockDeployment);

      const result = await resourcesTask.get('proj-1', 'main');
      expect(result).toEqual({});
    });

    it('should return empty object when selected resource group is missing', async () => {
      const mockDeployment = {
        webapps: {
          app: { resources: { profileSize: 'STANDARD_1X' } },
        },
      };
      (mockClient.environments.getDeployment as jest.Mock).mockResolvedValue(mockDeployment);

      const result = await resourcesTask.get(
        'proj-1',
        'main',
        DeploymentResourceGroup.services,
        'service-1',
      );
      expect(result).toEqual({});
    });
  });

  describe('set', () => {
    it('should have set method defined', () => {
      expect(resourcesTask.set).toBeDefined();
      expect(typeof resourcesTask.set).toBe('function');
    });

    it('should update resource configuration', async () => {
      const mockResponse = { status: 'accepted' };
      mockDeploymentApi.updateProjectsEnvironmentsDeploymentsNext.mockResolvedValue(
        mockResponse as any,
      );

      const webapps = { app: { resources: { profileSize: 'STANDARD_2X' } } } as any;
      const services = {} as any;
      const workers = {} as any;

      const result = await resourcesTask.set('proj-1', 'main', webapps, services, workers);
      expect(result).toBeDefined();
      expect(
        mockDeploymentApi.updateProjectsEnvironmentsDeploymentsNext,
      ).toHaveBeenCalledWith({
        projectId: 'proj-1',
        environmentId: 'main',
        updateProjectsEnvironmentsDeploymentsNextRequest: {
          webapps,
          services,
          workers,
        },
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(resourcesTask.set('', 'main')).rejects.toThrow('Project ID is required');
    });

    it('should throw when environment ID is empty', async () => {
      await expect(resourcesTask.set('proj-1', '')).rejects.toThrow(
        'Environment ID is required',
      );
    });

    it('should handle API error', async () => {
      mockDeploymentApi.updateProjectsEnvironmentsDeploymentsNext.mockRejectedValue(
        new Error('Update failed'),
      );
      await expect(resourcesTask.set('proj-1', 'main')).rejects.toThrow('Update failed');
    });
  });

  describe('getAutoscalerSettings', () => {
    it('should have getAutoscalerSettings method defined', () => {
      expect(resourcesTask.getAutoscalerSettings).toBeDefined();
    });

    it('should return autoscaler settings', async () => {
      const mockSettings = { enabled: true, addresses: [] };
      mockAutoscalingApi.getAutoscalerSettings.mockResolvedValue(mockSettings as any);

      const result = await resourcesTask.getAutoscalerSettings('proj-1', 'main');
      expect(result).toBeDefined();
      expect(mockAutoscalingApi.getAutoscalerSettings).toHaveBeenCalledWith({
        projectId: 'proj-1',
        environmentId: 'main',
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(resourcesTask.getAutoscalerSettings('', 'main')).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when environment ID is empty', async () => {
      await expect(resourcesTask.getAutoscalerSettings('proj-1', '')).rejects.toThrow(
        'Environment ID is required',
      );
    });

    it('should handle API error', async () => {
      mockAutoscalingApi.getAutoscalerSettings.mockRejectedValue(new Error('Fetch failed'));
      await expect(resourcesTask.getAutoscalerSettings('proj-1', 'main')).rejects.toThrow(
        'Fetch failed',
      );
    });
  });

  describe('updateAutoscalerSettings', () => {
    it('should have updateAutoscalerSettings method defined', () => {
      expect(resourcesTask.updateAutoscalerSettings).toBeDefined();
    });

    it('should update autoscaler settings', async () => {
      const mockSettings = { enabled: false, addresses: [] };
      mockAutoscalingApi.postAutoscalerSettings.mockResolvedValue(mockSettings as any);

      const result = await resourcesTask.updateAutoscalerSettings(
        'proj-1',
        'main',
        mockSettings as any,
      );
      expect(result).toBeDefined();
      expect(mockAutoscalingApi.postAutoscalerSettings).toHaveBeenCalledWith({
        projectId: 'proj-1',
        environmentId: 'main',
        autoscalerSettings: mockSettings,
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(
        resourcesTask.updateAutoscalerSettings('', 'main', {} as any),
      ).rejects.toThrow('Project ID is required');
    });

    it('should throw when environment ID is empty', async () => {
      await expect(
        resourcesTask.updateAutoscalerSettings('proj-1', '', {} as any),
      ).rejects.toThrow('Environment ID is required');
    });

    it('should handle API error', async () => {
      mockAutoscalingApi.postAutoscalerSettings.mockRejectedValue(new Error('Update failed'));
      await expect(
        resourcesTask.updateAutoscalerSettings('proj-1', 'main', {} as any),
      ).rejects.toThrow('Update failed');
    });
  });
});
