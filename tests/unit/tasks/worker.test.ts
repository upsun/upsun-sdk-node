import { WorkerTask } from '../../../src/core/tasks/worker.js';
import { UpsunClient } from '../../../src/upsun.js';

// Mock the UpsunClient
jest.mock('../../../src/upsun');

describe('WorkerTask', () => {
  let workerTask: WorkerTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com'
      }
    } as any;
    
    workerTask = new WorkerTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should have WorkerTask instance defined', () => {
      expect(workerTask).toBeDefined();
      expect(workerTask).toBeInstanceOf(WorkerTask);
    });

    it('should inherit from TaskBase', () => {
      expect(workerTask).toHaveProperty('client');
    });
  });
});
