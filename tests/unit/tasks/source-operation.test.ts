import { SourceOperationTask } from '../../../src/core/tasks/source-operation.js';
import { UpsunClient } from '../../../src/upsun.js';

// Mock the UpsunClient
jest.mock('../../../src/upsun');

describe('SourceOperationTask', () => {
  let sourceOperationTask: SourceOperationTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    sourceOperationTask = new SourceOperationTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should have SourceOperationTask instance defined', () => {
      expect(sourceOperationTask).toBeDefined();
      expect(sourceOperationTask).toBeInstanceOf(SourceOperationTask);
    });

    it('should inherit from TaskBase', () => {
      expect(sourceOperationTask).toHaveProperty('client');
    });
  });
});
