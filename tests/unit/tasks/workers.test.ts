import { WorkersTask } from '../../../src/core/tasks/workers.js';
import { UpsunClient } from '../../../src/upsun.js';

// Mock the UpsunClient
jest.mock('../../../src/upsun');

describe('WorkersTask', () => {
  let workersTask: WorkersTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    workersTask = new WorkersTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should have WorkersTask instance defined', () => {
      expect(workersTask).toBeDefined();
      expect(workersTask).toBeInstanceOf(WorkersTask);
    });

    it('should inherit from TaskBase', () => {
      expect(workersTask).toHaveProperty('client');
    });
  });
});
