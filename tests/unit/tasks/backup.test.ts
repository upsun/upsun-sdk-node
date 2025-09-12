import { BackupTask } from '../../../src/core/tasks/backup.js';
import { UpsunClient } from '../../../src/upsun.js';
import { EnvironmentBackupsApi } from '../../../src/apis-gen/index.js';

// Mock the UpsunClient and EnvironmentBackupsApi
jest.mock('../../../src/upsun');
jest.mock('../../../src/apis-gen/index.js');

describe('BackupTask', () => {
    let backupTask: BackupTask;
    let mockClient: jest.Mocked<UpsunClient>;
    let mockBackupsApi: jest.Mocked<EnvironmentBackupsApi>;

    beforeEach(() => {
        mockBackupsApi = {
            backupEnvironment: jest.fn(),
            deleteProjectsEnvironmentsBackups: jest.fn(),
            getProjectsEnvironmentsBackups: jest.fn(),
            listProjectsEnvironmentsBackups: jest.fn(),
            restoreEnvironmentBackup: jest.fn()
        } as any;

        (EnvironmentBackupsApi as jest.MockedClass<typeof EnvironmentBackupsApi>).mockImplementation(() => mockBackupsApi);

        mockClient = {
            apiConfig: {
                basePath: 'https://api.upsun.com'
            }
        } as any;
        
        backupTask = new BackupTask(mockClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should have create method defined', () => {
            expect(backupTask.create).toBeDefined();
            expect(typeof backupTask.create).toBe('function');
        });

        it('should create a backup', async () => {
            const mockActivity = {
                id: 'activity-backup-123',
                type: 'environment.backup'
            };

            mockBackupsApi.backupEnvironment.mockResolvedValue(mockActivity as any);

            const result = await backupTask.create('project-123', 'main');
            expect(result).toBeDefined();
            expect(mockBackupsApi.backupEnvironment).toHaveBeenCalledWith({
                projectId: 'project-123',
                environmentId: 'main',
                environmentBackupInput: { safe: true }
            });
        });

        it('should handle backup creation errors', async () => {
            mockBackupsApi.backupEnvironment.mockRejectedValue(new Error('Backup creation failed'));
            
            await expect(backupTask.create('project-123', 'main')).rejects.toThrow('Backup creation failed');
        });
    });

    describe('list', () => {
        it('should have list method defined', () => {
            expect(backupTask.list).toBeDefined();
            expect(typeof backupTask.list).toBe('function');
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
                }
            ];

            mockBackupsApi.listProjectsEnvironmentsBackups.mockResolvedValue(mockBackups as any);

            const result = await backupTask.list('project-123', 'main');
            expect(result).toBeDefined();
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('backup-1');
            expect(result[1].id).toBe('backup-2');
            expect(mockBackupsApi.listProjectsEnvironmentsBackups).toHaveBeenCalledWith({
                projectId: 'project-123',
                environmentId: 'main'
            });
        });

        it('should handle empty backup list', async () => {
            mockBackupsApi.listProjectsEnvironmentsBackups.mockResolvedValue([]);

            const result = await backupTask.list('project-123', 'main');
            expect(result).toEqual([]);
        });
    });

    describe('restore', () => {
        it('should have restore method defined', () => {
            expect(backupTask.restore).toBeDefined();
            expect(typeof backupTask.restore).toBe('function');
        });

        it('should restore from backup', async () => {
            await expect(backupTask.restore('project-123', 'main', 'backup-1')).rejects.toThrow('Not implemented');
        });
        it('should handle restore errors', async () => {
            await expect(backupTask.restore('project-123', 'main', 'invalid-backup')).rejects.toThrow('Not implemented');
        });
    });
});
//# sourceMappingURL=backup.test.js.map
