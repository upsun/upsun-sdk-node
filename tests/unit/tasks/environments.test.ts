import { EnvironmentsTask } from '../../../src/core/tasks/environments.js';
import { UpsunClient } from '../../../src/upsun.js';
import {
  AutoscalingApi,
  DeploymentApi,
  EnvironmentApi,
  EnvironmentTypeApi,
} from '../../../src/api/index.js';
import {
  EnvironmentPatchTypeEnum,
  Resources2InitEnum,
  Resources3InitEnum,
  Resources4InitEnum,
} from '../../../src/model/index.js';

jest.mock('../../../src/upsun');
jest.mock('../../../src/api/index.js');

describe('EnvironmentsTask', () => {
  let environmentTask: EnvironmentsTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockVariables: {
    createEnvironmentVariable: jest.Mock;
    deleteEnvironmentVariable: jest.Mock;
    getEnvironmentVariable: jest.Mock;
    listEnvironmentVariables: jest.Mock;
    updateEnvironmentVariable: jest.Mock;
  };
  let mockRoutes: {
    get: jest.Mock;
    list: jest.Mock;
  };
  let mockDomains: {
    add: jest.Mock;
    delete: jest.Mock;
    get: jest.Mock;
    list: jest.Mock;
    update: jest.Mock;
  };
  let mockEnvironmentApi: jest.Mocked<EnvironmentApi>;
  let mockEnvironmentTypeApi: jest.Mocked<EnvironmentTypeApi>;
  let mockDeploymentApi: jest.Mocked<DeploymentApi>;
  let mockAutoscalingApi: jest.Mocked<AutoscalingApi>;

  beforeEach(() => {
    mockEnvironmentApi = {
      listProjectsEnvironments: jest.fn(),
      getEnvironment: jest.fn(),
      activateEnvironment: jest.fn(),
      branchEnvironment: jest.fn(),
      initializeEnvironment: jest.fn(),
      deactivateEnvironment: jest.fn(),
      deleteEnvironment: jest.fn(),
      mergeEnvironment: jest.fn(),
      pauseEnvironment: jest.fn(),
      resumeEnvironment: jest.fn(),
      redeployEnvironment: jest.fn(),
      synchronizeEnvironment: jest.fn(),
      updateEnvironment: jest.fn(),
    } as any;

    mockEnvironmentTypeApi = {
      getEnvironmentType: jest.fn(),
    } as any;

    mockDeploymentApi = {
      getProjectsEnvironmentsDeployments: jest.fn(),
      listProjectsEnvironmentsDeployments: jest.fn(),
    } as any;

    mockAutoscalingApi = {} as any;

    (EnvironmentApi as jest.MockedClass<typeof EnvironmentApi>).mockImplementation(
      () => mockEnvironmentApi,
    );
    (EnvironmentTypeApi as jest.MockedClass<typeof EnvironmentTypeApi>).mockImplementation(
      () => mockEnvironmentTypeApi,
    );
    (DeploymentApi as jest.MockedClass<typeof DeploymentApi>).mockImplementation(
      () => mockDeploymentApi,
    );
    (AutoscalingApi as jest.MockedClass<typeof AutoscalingApi>).mockImplementation(
      () => mockAutoscalingApi,
    );

    mockVariables = {
      createEnvironmentVariable: jest.fn(),
      deleteEnvironmentVariable: jest.fn(),
      getEnvironmentVariable: jest.fn(),
      listEnvironmentVariables: jest.fn(),
      updateEnvironmentVariable: jest.fn(),
    };

    mockRoutes = {
      get: jest.fn(),
      list: jest.fn(),
    };

    mockDomains = {
      add: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
    };

    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
      variables: mockVariables,
      routes: mockRoutes,
      domains: mockDomains,
    } as any;

    environmentTask = new EnvironmentsTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize properly', () => {
      expect(environmentTask).toBeDefined();
      expect(environmentTask).toBeInstanceOf(EnvironmentsTask);
    });
  });

  describe('activate', () => {
    it('should call activate API', async () => {
      const mockResponse = { status: 'ok' } as any;
      mockEnvironmentApi.activateEnvironment.mockResolvedValue(mockResponse);

      const result = await environmentTask.activate('project-123', 'main', 'INIT_VAL');
      expect(result).toBe(mockResponse);
      expect(mockEnvironmentApi.activateEnvironment).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
        environmentActivateInput: {
          resources: { init: 'INIT_VAL' },
        },
      });
    });

    it('should use default init if not provided', async () => {
      mockEnvironmentApi.activateEnvironment.mockResolvedValue({} as any);

      await environmentTask.activate('project-123', 'main');
      expect(mockEnvironmentApi.activateEnvironment).toHaveBeenCalledWith(
        expect.objectContaining({
          environmentActivateInput: expect.objectContaining({
            resources: { init: Resources2InitEnum.DEFAULT },
          }),
        }),
      );
    });
  });

  describe('branch', () => {
    it('should branch an environment', async () => {
      const mockResponse = { status: 'ok', code: 202 };
      mockEnvironmentApi.branchEnvironment.mockResolvedValue(mockResponse as any);

      const result = await environmentTask.branch(
        'project-123',
        'main',
        'My Title',
        'my-env',
        true,
        'development',
        'INIT_VAL',
      );
      expect(result).toBe(mockResponse);
      expect(mockEnvironmentApi.branchEnvironment).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
        environmentBranchInput: {
          title: 'My Title',
          name: 'my-env',
          cloneParent: true,
          type: 'development',
          resources: { init: 'INIT_VAL' },
        },
      });
    });

    it('should throw error if title is empty', async () => {
      await expect(environmentTask.branch('project-123', 'main', '', 'my-env')).rejects.toThrow(
        'Title must be a non-empty string',
      );
    });

    it('should throw error if name is empty', async () => {
      await expect(environmentTask.branch('project-123', 'main', 'My Title', '')).rejects.toThrow(
        'Name must be a non-empty string',
      );
    });
  });

  describe('initialize', () => {
    it('should initialize an environment', async () => {
      const mockResponse = { status: 'ok', code: 202 };
      mockEnvironmentApi.initializeEnvironment.mockResolvedValue(mockResponse as any);
      const files: [string, number, string][] = [
        ['file1.txt', 420, 'content1'],
        ['file2.txt', 420, 'content2'],
      ];

      const result = await environmentTask.initialize(
        'project-123',
        'main',
        'profile',
        'repo',
        files,
        'configVal',
        'INIT_VAL',
      );
      expect(result).toBe(mockResponse);
      expect(mockEnvironmentApi.initializeEnvironment).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
        environmentInitializeInput: {
          profile: 'profile',
          repository: 'repo',
          config: 'configVal',
          resources: { init: 'INIT_VAL' },
          files: [
            { path: 'file1.txt', mode: 420, contents: 'content1' },
            { path: 'file2.txt', mode: 420, contents: 'content2' },
          ],
        },
      });
    });

    it('should throw error if profile is empty', async () => {
      await expect(
        environmentTask.initialize('project-123', 'main', '', 'repo', [['f', 420, 'c']]),
      ).rejects.toThrow('Profile must be a non-empty string');
    });

    it('should throw error if repository is empty', async () => {
      await expect(
        environmentTask.initialize('project-123', 'main', 'profile', '', [['f', 420, 'c']]),
      ).rejects.toThrow('Repository must be a non-empty string');
    });

    it('should throw error if files is empty', async () => {
      await expect(
        environmentTask.initialize('project-123', 'main', 'profile', 'repo', []),
      ).rejects.toThrow('Files must be a non-empty array of [filePath, fileMode, fileContents]');
    });

    it('should use default init if not provided', async () => {
      mockEnvironmentApi.initializeEnvironment.mockResolvedValue({} as any);
      await environmentTask.initialize('project-123', 'main', 'profile', 'repo', [['f', 420, 'c']]);
      expect(mockEnvironmentApi.initializeEnvironment).toHaveBeenCalledWith(
        expect.objectContaining({
          environmentInitializeInput: expect.objectContaining({
            resources: { init: Resources4InitEnum.DEFAULT },
          }),
        }),
      );
    });
  });

  describe('list', () => {
    it('should list project environments', async () => {
      const mockEnvironments = [
        { id: 'env-1', name: 'main' },
        { id: 'env-2', name: 'staging' },
      ];

      mockEnvironmentApi.listProjectsEnvironments.mockResolvedValue(mockEnvironments as any);

      const result = await environmentTask.list('project-123');
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(mockEnvironmentApi.listProjectsEnvironments).toHaveBeenCalledWith({
        projectId: 'project-123',
      });
    });
  });

  describe('info', () => {
    it('should get environment information', async () => {
      const mockEnvironment = {
        id: 'env-123',
        name: 'main',
        status: 'active',
      };

      mockEnvironmentApi.getEnvironment.mockResolvedValue(mockEnvironment as any);

      const result = await environmentTask.info('project-123', 'main');
      expect(result).toBeDefined();
      expect((result as any).id).toBe('env-123');
      expect(mockEnvironmentApi.getEnvironment).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
      });
    });
  });

  describe('get', () => {
    it('should get environment information', async () => {
      const mockEnvironment = { id: 'env-1' };
      mockEnvironmentApi.getEnvironment.mockResolvedValue(mockEnvironment as any);

      const result = await environmentTask.get('project-123', 'main');
      expect(result).toBe(mockEnvironment);
      expect(mockEnvironmentApi.getEnvironment).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
      });
    });
  });

  describe('deactivate', () => {
    it('should deactivate an environment', async () => {
      mockEnvironmentApi.deactivateEnvironment.mockResolvedValue({} as any);
      await environmentTask.deactivate('project-123', 'main');
      expect(mockEnvironmentApi.deactivateEnvironment).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
      });
    });
  });

  describe('delete', () => {
    it('should delete an environment', async () => {
      mockEnvironmentApi.deleteEnvironment.mockResolvedValue({} as any);
      await environmentTask.delete('project-123', 'main');
      expect(mockEnvironmentApi.deleteEnvironment).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
      });
    });
  });

  describe('merge', () => {
    it('should merge an environment', async () => {
      mockEnvironmentApi.mergeEnvironment.mockResolvedValue({} as any);
      await environmentTask.merge('project-123', 'main', 'INIT_VAL');
      expect(mockEnvironmentApi.mergeEnvironment).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
        environmentMergeInput: {
          resources: { init: 'INIT_VAL' },
        },
      });
    });

    it('should use default init if not provided', async () => {
      mockEnvironmentApi.mergeEnvironment.mockResolvedValue({} as any);
      await environmentTask.merge('project-123', 'main');
      expect(mockEnvironmentApi.mergeEnvironment).toHaveBeenCalledWith(
        expect.objectContaining({
          environmentMergeInput: expect.objectContaining({
            resources: { init: Resources3InitEnum.DEFAULT },
          }),
        }),
      );
    });
  });

  describe('pause', () => {
    it('should pause an environment', async () => {
      mockEnvironmentApi.pauseEnvironment.mockResolvedValue({} as any);
      await environmentTask.pause('project-123', 'main');
      expect(mockEnvironmentApi.pauseEnvironment).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
      });
    });
  });

  describe('resume', () => {
    it('should resume an environment', async () => {
      mockEnvironmentApi.resumeEnvironment.mockResolvedValue({} as any);
      await environmentTask.resume('project-123', 'main');
      expect(mockEnvironmentApi.resumeEnvironment).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
      });
    });
  });

  describe('redeploy', () => {
    it('should redeploy an environment', async () => {
      mockEnvironmentApi.redeployEnvironment.mockResolvedValue({} as any);
      await environmentTask.redeploy('project-123', 'main');
      expect(mockEnvironmentApi.redeployEnvironment).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
      });
    });
  });

  describe('synchronize', () => {
    it('should synchronize an environment', async () => {
      mockEnvironmentApi.synchronizeEnvironment.mockResolvedValue({} as any);
      await environmentTask.synchronize('project-123', 'main', false, true, false, true);
      expect(mockEnvironmentApi.synchronizeEnvironment).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
        environmentSynchronizeInput: {
          synchronizeCode: false,
          rebase: true,
          synchronizeData: false,
          synchronizeResources: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update an environment', async () => {
      mockEnvironmentApi.updateEnvironment.mockResolvedValue({} as any);
      await environmentTask.update(
        'project-123',
        'main',
        'parent',
        'name',
        'title',
        { key: 'value' },
        'DEVELOPMENT',
        true,
        {
          isEnabled: true,
          addresses: [{ address: '1.2.3.4', permission: 'ALLOW' }],
          basicAuth: { username: 'user', password: 'pass' },
        },
        true,
        false,
      );

      expect(mockEnvironmentApi.updateEnvironment).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
        environmentPatch: {
          name: 'name',
          title: 'title',
          parent: 'parent',
          attributes: { key: 'value' },
          type: EnvironmentPatchTypeEnum.DEVELOPMENT,
          cloneParentOnCreate: true,
          httpAccess: {
            isEnabled: true,
            addresses: [{ address: '1.2.3.4', permission: 'allow' }],
            basicAuth: { username: 'user', password: 'pass' },
          },
          enableSmtp: true,
          restrictRobots: false,
        },
      });
    });
  });

  describe('getType', () => {
    it('should get environment type', async () => {
      const response = { id: 'type-1' } as any;
      mockEnvironmentTypeApi.getEnvironmentType.mockResolvedValue(response);

      const result = await environmentTask.getType('project-123', 'type-1');
      expect(result).toBe(response);
      expect(mockEnvironmentTypeApi.getEnvironmentType).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentTypeId: 'type-1',
      });
    });
  });

  describe('variables passthrough', () => {
    it('should create environment variable via client', async () => {
      const response = { ok: true } as any;
      mockVariables.createEnvironmentVariable.mockResolvedValue(response);

      const result = await environmentTask.createVariables(
        'project-123',
        'main',
        'NAME',
        'VALUE',
        { env: 'true' },
        true,
        false,
        true,
        false,
        ['app'],
      );
      expect(result).toBe(response);
      expect(mockVariables.createEnvironmentVariable).toHaveBeenCalledWith(
        'project-123',
        'main',
        'NAME',
        'VALUE',
        { env: 'true' },
        true,
        false,
        true,
        false,
        ['app'],
      );
    });

    it('should delete environment variable via client', async () => {
      mockVariables.deleteEnvironmentVariable.mockResolvedValue({} as any);
      await environmentTask.deleteVariable('project-123', 'main', 'var-1');
      expect(mockVariables.deleteEnvironmentVariable).toHaveBeenCalledWith(
        'project-123',
        'main',
        'var-1',
      );
    });

    it('should get environment variable via client', async () => {
      const response = { id: 'var-1' } as any;
      mockVariables.getEnvironmentVariable.mockResolvedValue(response);
      const result = await environmentTask.getVariable('project-123', 'main', 'var-1');
      expect(result).toBe(response);
      expect(mockVariables.getEnvironmentVariable).toHaveBeenCalledWith(
        'project-123',
        'main',
        'var-1',
      );
    });

    it('should list environment variables via client', async () => {
      const response = [{ id: 'var-1' }] as any;
      mockVariables.listEnvironmentVariables.mockResolvedValue(response);
      const result = await environmentTask.listVariables('project-123', 'main');
      expect(result).toBe(response);
      expect(mockVariables.listEnvironmentVariables).toHaveBeenCalledWith('project-123', 'main');
    });

    it('should update environment variable via client', async () => {
      const response = { ok: true } as any;
      mockVariables.updateEnvironmentVariable.mockResolvedValue(response);
      const result = await environmentTask.updateVariable(
        'project-123',
        'main',
        'var-1',
        'NAME',
        'VALUE',
        { env: 'true' },
        true,
        false,
        true,
        false,
        ['app'],
      );
      expect(result).toBe(response);
      expect(mockVariables.updateEnvironmentVariable).toHaveBeenCalledWith(
        'project-123',
        'main',
        'var-1',
        'NAME',
        'VALUE',
        { env: 'true' },
        true,
        false,
        true,
        false,
        ['app'],
      );
    });
  });

  describe('routes passthrough', () => {
    it('should get route via client', async () => {
      const response = { id: 'route-1' } as any;
      mockRoutes.get.mockResolvedValue(response);
      const result = await environmentTask.getRoute('project-123', 'main', 'route-1');
      expect(result).toBe(response);
      expect(mockRoutes.get).toHaveBeenCalledWith('project-123', 'main', 'route-1');
    });

    it('should list routes via client', async () => {
      const response = [{ id: 'route-1' }] as any;
      mockRoutes.list.mockResolvedValue(response);
      const result = await environmentTask.listRoutes('project-123', 'main');
      expect(result).toBe(response);
      expect(mockRoutes.list).toHaveBeenCalledWith('project-123', 'main');
    });
  });

  describe('domains passthrough', () => {
    it('should require domain name on create', async () => {
      await expect(environmentTask.createDomain('project-123', 'main', '')).rejects.toThrow(
        'Domain name must be a non-empty string',
      );
    });

    it('should create domain via client', async () => {
      const response = { ok: true } as any;
      mockDomains.add.mockResolvedValue(response);
      const result = await environmentTask.createDomain(
        'project-123',
        'main',
        'example.com',
        { env: 'true' },
        true,
        'old.example.com',
      );
      expect(result).toBe(response);
      expect(mockDomains.add).toHaveBeenCalledWith(
        'project-123',
        'example.com',
        { env: 'true' },
        true,
        'old.example.com',
        'main',
      );
    });

    it('should delete domain via client', async () => {
      mockDomains.delete.mockResolvedValue({} as any);
      await environmentTask.deleteDomain('project-123', 'main', 'domain-1');
      expect(mockDomains.delete).toHaveBeenCalledWith('project-123', 'domain-1', 'main');
    });

    it('should get domain via client', async () => {
      const response = { id: 'domain-1' } as any;
      mockDomains.get.mockResolvedValue(response);
      const result = await environmentTask.getDomain('project-123', 'main', 'domain-1');
      expect(result).toBe(response);
      expect(mockDomains.get).toHaveBeenCalledWith('project-123', 'domain-1', 'main');
    });

    it('should list domains via client', async () => {
      const response = [{ id: 'domain-1' }] as any;
      mockDomains.list.mockResolvedValue(response);
      const result = await environmentTask.listDomains('project-123', 'main');
      expect(result).toBe(response);
      expect(mockDomains.list).toHaveBeenCalledWith('project-123', 'main');
    });

    it('should update domain via client', async () => {
      const response = { ok: true } as any;
      mockDomains.update.mockResolvedValue(response);
      const result = await environmentTask.updateDomain(
        'project-123',
        'main',
        'domain-1',
        { env: 'true' },
        true,
      );
      expect(result).toBe(response);
      expect(mockDomains.update).toHaveBeenCalledWith(
        'project-123',
        'domain-1',
        { env: 'true' },
        true,
        'main',
      );
    });
  });

  describe('deployments', () => {
    it('should require deploymentId', async () => {
      await expect(environmentTask.getDeployment('project-123', 'main', '')).rejects.toThrow(
        'Deployment ID must be a non-empty string',
      );
    });

    it('should get deployment via API', async () => {
      const response = { id: 'current' } as any;
      mockDeploymentApi.getProjectsEnvironmentsDeployments.mockResolvedValue(response);
      const result = await environmentTask.getDeployment('project-123', 'main', 'current');
      expect(result).toBe(response);
      expect(mockDeploymentApi.getProjectsEnvironmentsDeployments).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
        deploymentId: 'current',
      });
    });

    it('should list deployments via API', async () => {
      const response = [{ id: 'current' }] as any;
      mockDeploymentApi.listProjectsEnvironmentsDeployments.mockResolvedValue(response);
      const result = await environmentTask.listDeployments('project-123', 'main');
      expect(result).toBe(response);
      expect(mockDeploymentApi.listProjectsEnvironmentsDeployments).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
      });
    });
  });

  describe('logs/relationships', () => {
    it('should throw not implemented for logs', async () => {
      await expect(environmentTask.logs('project-123', 'main', 'app')).rejects.toThrow(
        'Not implemented',
      );
    });

    it('should throw not implemented for relationships', async () => {
      await expect(environmentTask.relationships('project-123', 'main')).rejects.toThrow(
        'Not implemented',
      );
    });
  });
});
