import { IntegrationsTask } from '../../../src/core/tasks/integrations.js';
import { UpsunClient } from '../../../src/upsun.js';
import { ThirdPartyIntegrationsApi } from '../../../src/api/index.js';

jest.mock('../../../src/upsun.js');
jest.mock('../../../src/api/index.js');

describe('IntegrationsTask', () => {
  let integrationsTask: IntegrationsTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockApi: jest.Mocked<ThirdPartyIntegrationsApi>;

  beforeEach(() => {
    mockApi = {
      createProjectsIntegrations: jest.fn(),
      deleteProjectsIntegrations: jest.fn(),
      listProjectsIntegrations: jest.fn(),
      getProjectsIntegrations: jest.fn(),
      updateProjectsIntegrations: jest.fn(),
    } as any;

    (
      ThirdPartyIntegrationsApi as jest.MockedClass<typeof ThirdPartyIntegrationsApi>
    ).mockImplementation(() => mockApi);

    mockClient = {
      apiConfig: { basePath: 'https://api.upsun.com' },
    } as any;

    integrationsTask = new IntegrationsTask(mockClient, mockApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createIntegration', () => {
    it('should have createIntegration method defined', () => {
      expect(integrationsTask.createIntegration).toBeDefined();
      expect(typeof integrationsTask.createIntegration).toBe('function');
    });

    it('should create an integration', async () => {
      const mockResponse = { id: 'int-1', type: 'github' };
      mockApi.createProjectsIntegrations.mockResolvedValue(mockResponse as any);

      const result = await integrationsTask.createIntegration('proj-1', 'github', {
        token: 'tok',
      } as any);

      expect(result).toBeDefined();
      expect(mockApi.createProjectsIntegrations).toHaveBeenCalledWith({
        projectId: 'proj-1',
        integrationCreateInput: { type: 'github', token: 'tok' },
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(integrationsTask.createIntegration('', 'github', {} as any)).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when type is empty', async () => {
      await expect(integrationsTask.createIntegration('proj-1', '', {} as any)).rejects.toThrow(
        'Integration type is required',
      );
    });

    it('should handle API error', async () => {
      mockApi.createProjectsIntegrations.mockRejectedValue(new Error('API error'));

      await expect(
        integrationsTask.createIntegration('proj-1', 'github', {} as any),
      ).rejects.toThrow('API error');
    });
  });

  describe('deleteIntegration', () => {
    it('should have deleteIntegration method defined', () => {
      expect(integrationsTask.deleteIntegration).toBeDefined();
    });

    it('should delete an integration', async () => {
      const mockResponse = { status: 'ok' };
      mockApi.deleteProjectsIntegrations.mockResolvedValue(mockResponse as any);

      const result = await integrationsTask.deleteIntegration('proj-1', 'int-1');
      expect(result).toBeDefined();
      expect(mockApi.deleteProjectsIntegrations).toHaveBeenCalledWith({
        projectId: 'proj-1',
        integrationId: 'int-1',
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(integrationsTask.deleteIntegration('', 'int-1')).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when integration ID is empty', async () => {
      await expect(integrationsTask.deleteIntegration('proj-1', '')).rejects.toThrow(
        'Integration ID is required',
      );
    });

    it('should handle API error', async () => {
      mockApi.deleteProjectsIntegrations.mockRejectedValue(new Error('Not found'));
      await expect(integrationsTask.deleteIntegration('proj-1', 'int-1')).rejects.toThrow(
        'Not found',
      );
    });
  });

  describe('listIntegrations', () => {
    it('should have listIntegrations method defined', () => {
      expect(integrationsTask.listIntegrations).toBeDefined();
    });

    it('should list integrations for a project', async () => {
      const mockList = [
        { id: 'int-1', type: 'github' },
        { id: 'int-2', type: 'gitlab' },
      ];
      mockApi.listProjectsIntegrations.mockResolvedValue(mockList as any);

      const result = await integrationsTask.listIntegrations('proj-1');
      expect(result).toBeDefined();
      expect(mockApi.listProjectsIntegrations).toHaveBeenCalledWith({ projectId: 'proj-1' });
    });

    it('should throw when project ID is empty', async () => {
      await expect(integrationsTask.listIntegrations('')).rejects.toThrow('Project ID is required');
    });

    it('should handle API error', async () => {
      mockApi.listProjectsIntegrations.mockRejectedValue(new Error('Server error'));
      await expect(integrationsTask.listIntegrations('proj-1')).rejects.toThrow('Server error');
    });
  });

  describe('getIntegration', () => {
    it('should have getIntegration method defined', () => {
      expect(integrationsTask.getIntegration).toBeDefined();
    });

    it('should get a specific integration', async () => {
      const mockIntegration = { id: 'int-1', type: 'github' };
      mockApi.getProjectsIntegrations.mockResolvedValue(mockIntegration as any);

      const result = await integrationsTask.getIntegration('proj-1', 'int-1');
      expect(result).toBeDefined();
      expect((result as any).id).toBe('int-1');
      expect(mockApi.getProjectsIntegrations).toHaveBeenCalledWith({
        projectId: 'proj-1',
        integrationId: 'int-1',
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(integrationsTask.getIntegration('', 'int-1')).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when integration ID is empty', async () => {
      await expect(integrationsTask.getIntegration('proj-1', '')).rejects.toThrow(
        'Integration ID is required',
      );
    });

    it('should handle API error', async () => {
      mockApi.getProjectsIntegrations.mockRejectedValue(new Error('Not found'));
      await expect(integrationsTask.getIntegration('proj-1', 'int-1')).rejects.toThrow('Not found');
    });
  });

  describe('updateIntegration', () => {
    it('should have updateIntegration method defined', () => {
      expect(integrationsTask.updateIntegration).toBeDefined();
    });

    it('should update an integration', async () => {
      const mockResponse = { status: 'ok' };
      mockApi.updateProjectsIntegrations.mockResolvedValue(mockResponse as any);

      const result = await integrationsTask.updateIntegration('proj-1', 'int-1', 'github', {
        token: 'new-tok',
      } as any);
      expect(result).toBeDefined();
      expect(mockApi.updateProjectsIntegrations).toHaveBeenCalledWith({
        projectId: 'proj-1',
        integrationId: 'int-1',
        integrationPatch: { type: 'github', token: 'new-tok' },
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(
        integrationsTask.updateIntegration('', 'int-1', 'github', {} as any),
      ).rejects.toThrow('Project ID is required');
    });

    it('should throw when integration ID is empty', async () => {
      await expect(
        integrationsTask.updateIntegration('proj-1', '', 'github', {} as any),
      ).rejects.toThrow('Integration ID is required');
    });

    it('should throw when type is empty', async () => {
      await expect(
        integrationsTask.updateIntegration('proj-1', 'int-1', '', {} as any),
      ).rejects.toThrow('Integration type is required');
    });

    it('should handle API error', async () => {
      mockApi.updateProjectsIntegrations.mockRejectedValue(new Error('Update failed'));
      await expect(
        integrationsTask.updateIntegration('proj-1', 'int-1', 'github', {} as any),
      ).rejects.toThrow('Update failed');
    });
  });
});
