import { BackupsTask } from '../../../src/core/tasks/backups.js';
import { UpsunClient } from '../../../src/upsun.js';
import { EnvironmentBackupsApi } from '../../../src/api/index.js';
import { Resources6InitEnum } from '../../../src/model/index.js';

// Mock the UpsunClient and EnvironmentBackupsApi
jest.mock('../../../src/upsun');
jest.mock('../../../src/api/index.js');

describe('BackupsTask', () => {
  let backupsTask: BackupsTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockBackupsApi: jest.Mocked<EnvironmentBackupsApi>;

  beforeEach(() => {
    mockBackupsApi = {
      backupEnvironment: jest.fn(),
      deleteProjectsEnvironmentsBackups: jest.fn(),
      getProjectsEnvironmentsBackups: jest.fn(),
      listProjectsEnvironmentsBackups: jest.fn(),
      restoreBackup: jest.fn(),
    } as any;

    (EnvironmentBackupsApi as jest.MockedClass<typeof EnvironmentBackupsApi>).mockImplementation(
      () => mockBackupsApi,
    );

    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    backupsTask = new BackupsTask(mockClient, mockBackupsApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should have create method defined', () => {
      expect(backupsTask.create).toBeDefined();
      expect(typeof backupsTask.create).toBe('function');
    });

    it('should create a backup', async () => {
      const mockActivity = {
        id: 'activity-backup-123',
        type: 'environment.backup',
      };

      mockBackupsApi.backupEnvironment.mockResolvedValue(mockActivity as any);

      const result = await backupsTask.create('project-123', 'main');
      expect(result).toBeDefined();
      expect(mockBackupsApi.backupEnvironment).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
        environmentBackupInput: { safe: true },
      });
    });

    it('should handle backup creation errors', async () => {
      mockBackupsApi.backupEnvironment.mockRejectedValue(new Error('Backup creation failed'));

      await expect(backupsTask.create('project-123', 'main')).rejects.toThrow(
        'Backup creation failed',
      );
    });
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(backupsTask.list).toBeDefined();
      expect(typeof backupsTask.list).toBe('function');
    });

    it('should list environment backups', async () => {
      const mockBackups = [
        {
          id: 'backup-1',
          createdAt: '2023-01-01T00:00:00Z',
          status: 'complete',
        },
        {
          id: 'backup-2',
          createdAt: '2023-01-02T00:00:00Z',
          status: 'complete',
        },
      ];

      mockBackupsApi.listProjectsEnvironmentsBackups.mockResolvedValue(mockBackups as any);

      const result = await backupsTask.list('project-123', 'main');
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('backup-1');
      expect(result[1].id).toBe('backup-2');
      expect(mockBackupsApi.listProjectsEnvironmentsBackups).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
      });
    });

    it('should handle empty backup list', async () => {
      mockBackupsApi.listProjectsEnvironmentsBackups.mockResolvedValue([]);

      const result = await backupsTask.list('project-123', 'main');
      expect(result).toEqual([]);
    });
  });

  describe('restore', () => {
    it('should have restore method defined', () => {
      expect(backupsTask.restore).toBeDefined();
      expect(typeof backupsTask.restore).toBe('function');
    });

    it('should restore from backup', async () => {
      const mockActivity = {
        id: 'activity-restore-123',
        type: 'environment.restore',
      };

      mockBackupsApi.restoreBackup.mockResolvedValue(mockActivity as any);

      const result = await backupsTask.restore('project-123', 'main', 'backup-1');

      expect(result).toBeDefined();
      expect(result).toEqual(mockActivity);
      expect(mockBackupsApi.restoreBackup).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
        backupId: 'backup-1',
        environmentRestoreInput: {
          environmentName: null,
          branchFrom: null,
          restoreCode: true,
          restoreResources: true,
          resources: { init: Resources6InitEnum.DEFAULT },
        },
      });
    });

    it('should handle restore errors', async () => {
      mockBackupsApi.restoreBackup.mockRejectedValue(new Error('Restore failed'));

      await expect(backupsTask.restore('project-123', 'main', 'backup-1')).rejects.toThrow(
        'Restore failed',
      );
    });
  });
});
//# sourceMappingURL=backup.test.js.map
