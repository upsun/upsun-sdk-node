import { OperationsTask } from '../../../src/core/tasks/operations.js';
import { UpsunClient } from '../../../src/upsun.js';
import { RuntimeOperationsApi } from '../../../src/api/index.js';

// Mock the UpsunClient and API
jest.mock('../../../src/upsun.js');
jest.mock('../../../src/api/index.js');

describe('OperationsTask', () => {
  let operationsTask: OperationsTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockRuntimeOperationsApi: jest.Mocked<RuntimeOperationsApi>;

  beforeEach(() => {
    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    mockRuntimeOperationsApi = {
      runOperation: jest.fn(),
    } as any;

    (RuntimeOperationsApi as jest.MockedClass<typeof RuntimeOperationsApi>).mockImplementation(
      () => mockRuntimeOperationsApi,
    );

    operationsTask = new OperationsTask(mockClient, mockRuntimeOperationsApi);
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

  describe('run', () => {
    it('should have run method defined', () => {
      expect(operationsTask.run).toBeDefined();
      expect(typeof operationsTask.run).toBe('function');
    });

    it('should run an operation', async () => {
      const mockResponse = { id: 'act-1', type: 'runtime_operation' };
      mockRuntimeOperationsApi.runOperation.mockResolvedValue(mockResponse as any);

      const result = await operationsTask.run(
        'proj-1',
        'main',
        'current',
        'my-service',
        'restart',
        ['--force'],
      );
      expect(result).toBeDefined();
      expect(mockRuntimeOperationsApi.runOperation).toHaveBeenCalledWith({
        projectId: 'proj-1',
        environmentId: 'main',
        deploymentId: 'current',
        environmentOperationInput: {
          service: 'my-service',
          operation: 'restart',
          parameters: ['--force'],
        },
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(operationsTask.run('', 'main', 'current', 'svc', 'op', ['p'])).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when environment ID is empty', async () => {
      await expect(operationsTask.run('proj-1', '', 'current', 'svc', 'op', ['p'])).rejects.toThrow(
        'Environment ID is required',
      );
    });

    it('should throw when deployment ID is empty', async () => {
      await expect(operationsTask.run('proj-1', 'main', '', 'svc', 'op', ['p'])).rejects.toThrow(
        'Deployment ID is required',
      );
    });

    it('should throw when service is empty', async () => {
      await expect(
        operationsTask.run('proj-1', 'main', 'current', '', 'op', ['p']),
      ).rejects.toThrow('Service must be a non-empty string');
    });

    it('should throw when operation is empty', async () => {
      await expect(
        operationsTask.run('proj-1', 'main', 'current', 'svc', '', ['p']),
      ).rejects.toThrow('Operation must be a non-empty string');
    });

    it('should throw when parameters array is empty', async () => {
      await expect(
        operationsTask.run('proj-1', 'main', 'current', 'svc', 'op', []),
      ).rejects.toThrow('Parameters must be a non-empty array of strings');
    });

    it('should handle API error', async () => {
      mockRuntimeOperationsApi.runOperation.mockRejectedValue(new Error('Service unavailable'));
      await expect(
        operationsTask.run('proj-1', 'main', 'current', 'svc', 'op', ['p']),
      ).rejects.toThrow('Service unavailable');
    });
  });
});
