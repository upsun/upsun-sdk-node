import { MountTask } from '../../../src/core/tasks/mount.js';
import { UpsunClient } from '../../../src/upsun.js';

// Mock the UpsunClient
jest.mock('../../../src/upsun');

describe('MountTask', () => {
  let mountTask: MountTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com'
      }
    } as any;
    
    mountTask = new MountTask(mockClient);
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
      await expect(mountTask.download('project-123', 'mount-456')).rejects.toThrow('Cannot be implemented');
    });
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(mountTask.list).toBeDefined();
      expect(typeof mountTask.list).toBe('function');
    });

    it('should throw "Cannot be implemented" error', async () => {
      await expect(mountTask.list('project-123')).rejects.toThrow('Cannot be implemented');
    });
  });

  describe('upload', () => {
    it('should have upload method defined', () => {
      expect(mountTask.upload).toBeDefined();
      expect(typeof mountTask.upload).toBe('function');
    });

    it('should throw "Cannot be implemented" error', async () => {
      await expect(mountTask.upload('project-123', 'mount-456')).rejects.toThrow('Cannot be implemented');
    });
  });
});
