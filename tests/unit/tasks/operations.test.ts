import { OperationsTask } from '../../../src/core/tasks/operations.js';
import { UpsunClient } from '../../../src/upsun.js';

// Mock the UpsunClient
jest.mock('../../../src/upsun');

describe('OperationsTask', () => {
  let operationsTask: OperationsTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    operationsTask = new OperationsTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should have OperationsTask instance defined', () => {
      expect(operationsTask).toBeDefined();
      expect(operationsTask).toBeInstanceOf(OperationsTask);
    });

    it('should inherit from TaskBase', () => {
      expect(operationsTask).toHaveProperty('client');
    });
  });
});
