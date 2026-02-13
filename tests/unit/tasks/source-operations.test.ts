import { SourceOperationsTask } from '../../../src/core/tasks/source-operations.js';
import { UpsunClient } from '../../../src/upsun.js';

// Mock the UpsunClient
jest.mock('../../../src/upsun');

describe('SourceOperationsTask', () => {
  let sourceOperationTask: SourceOperationsTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockSourceOperationsApi: any;

  beforeEach(() => {
    mockSourceOperationsApi = {
      listProjectsEnvironmentsSourceOperations: jest.fn(),
      getProjectsEnvironmentsSourceOperations: jest.fn(),
      actionProjectsEnvironmentsSourceOperations: jest.fn(),
    };

    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    sourceOperationTask = new SourceOperationsTask(mockClient, mockSourceOperationsApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should have SourceOperationTask instance defined', () => {
      expect(sourceOperationTask).toBeDefined();
      expect(sourceOperationTask).toBeInstanceOf(SourceOperationsTask);
    });

    it('should inherit from TaskBase', () => {
      expect(sourceOperationTask).toHaveProperty('client');
    });
  });
});
