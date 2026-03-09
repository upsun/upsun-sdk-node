import { MountsTask } from '../../../src/core/tasks/mounts.js';
import { UpsunClient } from '../../../src/upsun.js';
import { DeploymentResourceGroup } from '../../../src/core/model.js';

// Mock the UpsunClient
jest.mock('../../../src/upsun');

describe('MountsTask', () => {
  let mountTask: MountsTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
      environments: {
        getDeployment: jest.fn().mockResolvedValue({
          webapps: {},
          services: {},
          workers: {},
        }),
      },
    } as any;

    mountTask = new MountsTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('download', () => {
    it('should have download method defined', () => {
      expect(mountTask.download).toBeDefined();
      expect(typeof mountTask.download).toBe('function');
    });

    it('should throw "Cannot be implemented" error', async () => {
      await expect(mountTask.download('project-123', 'mount-456')).rejects.toThrow(
        'Cannot be implemented',
      );
    });
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(mountTask.list).toBeDefined();
      expect(typeof mountTask.list).toBe('function');
    });

    it('should list mounts from deployment', async () => {
      const result = await mountTask.list('project-123');
      expect(result).toEqual({});
    });

    it('should skip apps without name and id', async () => {
      (mockClient.environments.getDeployment as jest.Mock).mockResolvedValue({
        webapps: {
          app1: { mounts: { '/data': { source: 'local' } } },
        },
      });

      const result = await mountTask.list('project-123');
      expect(result).toEqual({});
    });

    it('should support filtering by resource group', async () => {
      (mockClient.environments.getDeployment as jest.Mock).mockResolvedValue({
        webapps: {
          app1: { id: 'app1', mounts: { '/a': { source: 'local' } } },
        },
        services: {
          svc1: { id: 'svc1', mounts: { '/s': { source: 'local' } } },
        },
      });

      const result = await mountTask.list('project-123', 'main', DeploymentResourceGroup.webapps);
      expect(result).toEqual({
        app1: { '/a': { source: 'local' } },
      });
    });

    it('should default mounts to empty object when missing', async () => {
      (mockClient.environments.getDeployment as jest.Mock).mockResolvedValue({
        webapps: {
          app1: { id: 'app1' },
        },
      });

      const result = await mountTask.list('project-123');
      expect(result).toEqual({ app1: {} });
    });
  });

  describe('upload', () => {
    it('should have upload method defined', () => {
      expect(mountTask.upload).toBeDefined();
      expect(typeof mountTask.upload).toBe('function');
    });

    it('should throw "Cannot be implemented" error', async () => {
      await expect(mountTask.upload('project-123', 'mount-456', [])).rejects.toThrow(
        'Cannot be implemented',
      );
    });
  });
});
