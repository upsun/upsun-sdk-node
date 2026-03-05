import { VariablesTask } from '../../../src/core/tasks/variables.js';
import { ProjectVariablesApi } from '../../../src/api/ProjectVariablesApi.js';
import { EnvironmentVariablesApi } from '../../../src/index.js';
import { UpsunClient } from '../../../src/upsun';

// Mock the UpsunClient
jest.mock('../../../src/upsun');
jest.mock('../../../src/api/ProjectVariablesApi.js');
jest.mock('../../../src/index.js', () => {
  const actual = jest.requireActual('../../../src/index.js');
  return {
    ...actual,
    EnvironmentVariablesApi: jest.fn(),
  };
});

describe('VariablesTask', () => {
  let variablesTask: VariablesTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockProjVarApi: jest.Mocked<ProjectVariablesApi>;
  let mockEnvVarApi: jest.Mocked<EnvironmentVariablesApi>;

  beforeEach(() => {
    mockProjVarApi = {
      createProjectsVariables: jest.fn(),
      deleteProjectsVariables: jest.fn(),
      getProjectsVariables: jest.fn(),
      listProjectsVariables: jest.fn(),
      updateProjectsVariables: jest.fn(),
    } as any;

    mockEnvVarApi = {
      createProjectsEnvironmentsVariables: jest.fn(),
      deleteProjectsEnvironmentsVariables: jest.fn(),
      getProjectsEnvironmentsVariables: jest.fn(),
      listProjectsEnvironmentsVariables: jest.fn(),
      updateProjectsEnvironmentsVariables: jest.fn(),
    } as any;

    (ProjectVariablesApi as jest.MockedClass<typeof ProjectVariablesApi>).mockImplementation(
      () => mockProjVarApi,
    );
    (
      EnvironmentVariablesApi as jest.MockedClass<typeof EnvironmentVariablesApi>
    ).mockImplementation(() => mockEnvVarApi);

    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    variablesTask = new VariablesTask(mockClient, mockProjVarApi, mockEnvVarApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize properly', () => {
      expect(variablesTask).toBeDefined();
      expect(variablesTask).toBeInstanceOf(VariablesTask);
    });
  });

  describe('createProjectVariable', () => {
    it('should require projectId', async () => {
      await expect(variablesTask.createProjectVariable('', 'NAME', 'VALUE')).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should require name', async () => {
      await expect(variablesTask.createProjectVariable('prj-1', '', 'VALUE')).rejects.toThrow(
        'Variable name is required',
      );
    });

    it('should require value', async () => {
      await expect(variablesTask.createProjectVariable('prj-1', 'NAME', '')).rejects.toThrow(
        'Variable value is required',
      );
    });

    it('should call api with create payload', async () => {
      const response = { ok: true } as any;
      mockProjVarApi.createProjectsVariables.mockResolvedValue(response);

      const result = await variablesTask.createProjectVariable('prj-1', 'NAME', 'VALUE', {
        attributes: { env: 'true' },
        isJson: true,
        isSensitive: false,
        visibleBuild: true,
        visibleRuntime: false,
        applicationScope: ['app'],
      });

      expect(result).toBe(response);
      expect(mockProjVarApi.createProjectsVariables).toHaveBeenCalledWith({
        projectId: 'prj-1',
        projectVariableCreateInput: {
          name: 'NAME',
          value: 'VALUE',
          attributes: { env: 'true' },
          isJson: true,
          isSensitive: false,
          visibleBuild: true,
          visibleRuntime: false,
          applicationScope: ['app'],
        },
      });
    });
  });

  describe('deleteProjectVariable', () => {
    it('should require variableId', async () => {
      await expect(variablesTask.deleteProjectVariable('prj-1', '')).rejects.toThrow(
        'Variable ID is required',
      );
    });

    it('should call api with delete payload', async () => {
      await variablesTask.deleteProjectVariable('prj-1', 'var-1');
      expect(mockProjVarApi.deleteProjectsVariables).toHaveBeenCalledWith({
        projectId: 'prj-1',
        projectVariableId: 'var-1',
      });
    });
  });

  describe('getProjectVariable', () => {
    it('should require variableId', async () => {
      await expect(variablesTask.getProjectVariable('prj-1', '')).rejects.toThrow(
        'Variable ID is required',
      );
    });

    it('should call api with get payload', async () => {
      const response = { id: 'var-1', name: 'NAME' } as any;
      mockProjVarApi.getProjectsVariables.mockResolvedValue(response);

      const result = await variablesTask.getProjectVariable('prj-1', 'var-1');
      expect(result).toBe(response);
      expect(mockProjVarApi.getProjectsVariables).toHaveBeenCalledWith({
        projectId: 'prj-1',
        projectVariableId: 'var-1',
      });
    });
  });

  describe('listProjectVariables', () => {
    it('should call api with list payload', async () => {
      const response = [{ id: 'var-1' }] as any;
      mockProjVarApi.listProjectsVariables.mockResolvedValue(response);

      const result = await variablesTask.listProjectVariables('prj-1');
      expect(result).toBe(response);
      expect(mockProjVarApi.listProjectsVariables).toHaveBeenCalledWith({
        projectId: 'prj-1',
      });
    });
  });

  describe('updateProjectVariable', () => {
    it('should require variableId', async () => {
      await expect(variablesTask.updateProjectVariable('prj-1', '')).rejects.toThrow(
        'Variable ID is required',
      );
    });

    it('should call api with update payload', async () => {
      const response = { ok: true } as any;
      mockProjVarApi.updateProjectsVariables.mockResolvedValue(response);

      const result = await variablesTask.updateProjectVariable('prj-1', 'var-1', {
        name: 'NAME',
        value: 'VALUE',
        attributes: { env: 'true' },
        isJson: true,
        isSensitive: true,
        visibleBuild: false,
        visibleRuntime: true,
        applicationScope: ['app'],
      });

      expect(result).toBe(response);
      expect(mockProjVarApi.updateProjectsVariables).toHaveBeenCalledWith({
        projectId: 'prj-1',
        projectVariableId: 'var-1',
        projectVariablePatch: {
          name: 'NAME',
          value: 'VALUE',
          attributes: { env: 'true' },
          isJson: true,
          isSensitive: true,
          visibleBuild: false,
          visibleRuntime: true,
          applicationScope: ['app'],
        },
      });
    });

    it('should send empty patch when params are omitted', async () => {
      const response = { ok: true } as any;
      mockProjVarApi.updateProjectsVariables.mockResolvedValue(response);

      await variablesTask.updateProjectVariable('prj-1', 'var-1');
      expect(mockProjVarApi.updateProjectsVariables).toHaveBeenCalledWith({
        projectId: 'prj-1',
        projectVariableId: 'var-1',
        projectVariablePatch: {},
      });
    });
  });

  describe('createEnvironmentVariable', () => {
    it('should require projectId', async () => {
      await expect(
        variablesTask.createEnvironmentVariable('', 'env-1', 'NAME', 'VALUE'),
      ).rejects.toThrow('Project ID is required');
    });

    it('should require environmentId', async () => {
      await expect(
        variablesTask.createEnvironmentVariable('prj-1', '', 'NAME', 'VALUE'),
      ).rejects.toThrow('Environment ID is required');
    });

    it('should require name', async () => {
      await expect(
        variablesTask.createEnvironmentVariable('prj-1', 'env-1', '', 'VALUE'),
      ).rejects.toThrow('Variable name is required');
    });

    it('should require value', async () => {
      await expect(
        variablesTask.createEnvironmentVariable('prj-1', 'env-1', 'NAME', ''),
      ).rejects.toThrow('Variable value is required');
    });

    it('should call api with create payload', async () => {
      const response = { ok: true } as any;
      mockEnvVarApi.createProjectsEnvironmentsVariables.mockResolvedValue(response);

      const result = await variablesTask.createEnvironmentVariable(
        'prj-1',
        'env-1',
        'NAME',
        'VALUE',
        {
          attributes: { env: 'true' },
          isJson: true,
          isSensitive: false,
          visibleBuild: true,
          visibleRuntime: false,
          applicationScope: ['app'],
        },
      );

      expect(result).toBe(response);
      expect(mockEnvVarApi.createProjectsEnvironmentsVariables).toHaveBeenCalledWith({
        projectId: 'prj-1',
        environmentId: 'env-1',
        environmentVariableCreateInput: {
          name: 'NAME',
          value: 'VALUE',
          attributes: { env: 'true' },
          isJson: true,
          isSensitive: false,
          visibleBuild: true,
          visibleRuntime: false,
          applicationScope: ['app'],
        },
      });
    });
  });

  describe('deleteEnvironmentVariable', () => {
    it('should require variableId', async () => {
      await expect(variablesTask.deleteEnvironmentVariable('prj-1', 'env-1', '')).rejects.toThrow(
        'Variable ID is required',
      );
    });

    it('should call api with delete payload', async () => {
      await variablesTask.deleteEnvironmentVariable('prj-1', 'env-1', 'var-1');
      expect(mockEnvVarApi.deleteProjectsEnvironmentsVariables).toHaveBeenCalledWith({
        projectId: 'prj-1',
        environmentId: 'env-1',
        variableId: 'var-1',
      });
    });
  });

  describe('getEnvironmentVariable', () => {
    it('should require variableId', async () => {
      await expect(variablesTask.getEnvironmentVariable('prj-1', 'env-1', '')).rejects.toThrow(
        'Variable ID is required',
      );
    });

    it('should call api with get payload', async () => {
      const response = { id: 'var-1', name: 'NAME' } as any;
      mockEnvVarApi.getProjectsEnvironmentsVariables.mockResolvedValue(response);

      const result = await variablesTask.getEnvironmentVariable('prj-1', 'env-1', 'var-1');
      expect(result).toBe(response);
      expect(mockEnvVarApi.getProjectsEnvironmentsVariables).toHaveBeenCalledWith({
        projectId: 'prj-1',
        environmentId: 'env-1',
        variableId: 'var-1',
      });
    });
  });

  describe('listEnvironmentVariables', () => {
    it('should call api with list payload', async () => {
      const response = [{ id: 'var-1' }] as any;
      mockEnvVarApi.listProjectsEnvironmentsVariables.mockResolvedValue(response);

      const result = await variablesTask.listEnvironmentVariables('prj-1', 'env-1');
      expect(result).toBe(response);
      expect(mockEnvVarApi.listProjectsEnvironmentsVariables).toHaveBeenCalledWith({
        projectId: 'prj-1',
        environmentId: 'env-1',
      });
    });
  });

  describe('updateEnvironmentVariable', () => {
    it('should require variableId', async () => {
      await expect(
        variablesTask.updateEnvironmentVariable('prj-1', 'env-1', '', 'NAME', 'VALUE'),
      ).rejects.toThrow('Variable ID is required');
    });

    it('should require name', async () => {
      await expect(
        variablesTask.updateEnvironmentVariable('prj-1', 'env-1', 'var-1', '', 'VALUE'),
      ).rejects.toThrow('Variable name is required');
    });

    it('should require value', async () => {
      await expect(
        variablesTask.updateEnvironmentVariable('prj-1', 'env-1', 'var-1', 'NAME', ''),
      ).rejects.toThrow('Variable value is required');
    });

    it('should call api with update payload', async () => {
      const response = { ok: true } as any;
      mockEnvVarApi.updateProjectsEnvironmentsVariables.mockResolvedValue(response);

      const result = await variablesTask.updateEnvironmentVariable(
        'prj-1',
        'env-1',
        'var-1',
        'NAME',
        'VALUE',
        {
          attributes: { env: 'true' },
          isJson: true,
          isSensitive: true,
          visibleBuild: false,
          visibleRuntime: true,
          applicationScope: ['app'],
        },
      );

      expect(result).toBe(response);
      expect(mockEnvVarApi.updateProjectsEnvironmentsVariables).toHaveBeenCalledWith({
        projectId: 'prj-1',
        environmentId: 'env-1',
        variableId: 'var-1',
        environmentVariablePatch: {
          name: 'NAME',
          value: 'VALUE',
          attributes: { env: 'true' },
          isJson: true,
          isSensitive: true,
          visibleBuild: false,
          visibleRuntime: true,
          applicationScope: ['app'],
        },
      });
    });
  });
});
