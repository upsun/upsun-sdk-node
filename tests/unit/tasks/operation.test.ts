import { OperationTask } from '../../../src/core/tasks/operation.js';
import { UpsunClient } from '../../../src/upsun.js';

// Mock the UpsunClient
jest.mock('../../../src/upsun');

describe('OperationTask', () => {
  let operationTask: OperationTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    operationTask = new OperationTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should have OperationTask instance defined', () => {
      expect(operationTask).toBeDefined();
      expect(operationTask).toBeInstanceOf(OperationTask);
    });

    it('should inherit from TaskBase', () => {
      expect(operationTask).toHaveProperty('client');
    });
  });
});
