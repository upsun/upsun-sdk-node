import { SourceOperationsTask } from '../../../src/core/tasks/source-operations.js';
import { UpsunClient } from '../../../src/upsun.js';
import { SourceOperationsApi } from '../../../src/api/index.js';

// Mock the UpsunClient and API
jest.mock('../../../src/upsun.js');
jest.mock('../../../src/api/index.js');

describe('SourceOperationsTask', () => {
  let sourceOperationTask: SourceOperationsTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockSourceOperationsApi: jest.Mocked<SourceOperationsApi>;

  beforeEach(() => {
    mockSourceOperationsApi = {
      listProjectsEnvironmentsSourceOperations: jest.fn(),
      runSourceOperation: jest.fn(),
    } as any;

    (SourceOperationsApi as jest.MockedClass<typeof SourceOperationsApi>).mockImplementation(
      () => mockSourceOperationsApi,
    );

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

  describe('list', () => {
    it('should have list method defined', () => {
      expect(sourceOperationTask.list).toBeDefined();
      expect(typeof sourceOperationTask.list).toBe('function');
    });

    it('should list source operations for an environment', async () => {
      const mockCollection = [{ name: 'rebuild', command: 'echo rebuild' }];
      mockSourceOperationsApi.listProjectsEnvironmentsSourceOperations.mockResolvedValue(
        mockCollection as any,
      );

      const result = await sourceOperationTask.list('proj-1', 'main');
      expect(result).toBeDefined();
      expect(
        mockSourceOperationsApi.listProjectsEnvironmentsSourceOperations,
      ).toHaveBeenCalledWith({ projectId: 'proj-1', environmentId: 'main' });
    });

    it('should throw when project ID is empty', async () => {
      await expect(sourceOperationTask.list('', 'main')).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when environment ID is empty', async () => {
      await expect(sourceOperationTask.list('proj-1', '')).rejects.toThrow(
        'Environment ID is required',
      );
    });

    it('should handle API error', async () => {
      mockSourceOperationsApi.listProjectsEnvironmentsSourceOperations.mockRejectedValue(
        new Error('Server error'),
      );
      await expect(sourceOperationTask.list('proj-1', 'main')).rejects.toThrow('Server error');
    });
  });

  describe('run', () => {
    it('should have run method defined', () => {
      expect(sourceOperationTask.run).toBeDefined();
      expect(typeof sourceOperationTask.run).toBe('function');
    });

    it('should run a source operation', async () => {
      const mockResponse = { id: 'act-1' };
      mockSourceOperationsApi.runSourceOperation.mockResolvedValue(mockResponse as any);

      const variables = { MY_VAR: 'value' };
      const result = await sourceOperationTask.run('proj-1', 'main', 'rebuild', variables);
      expect(result).toBeDefined();
      expect(mockSourceOperationsApi.runSourceOperation).toHaveBeenCalledWith({
        projectId: 'proj-1',
        environmentId: 'main',
        environmentSourceOperationInput: {
          operation: 'rebuild',
          variables,
        },
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(
        sourceOperationTask.run('', 'main', 'rebuild', {}),
      ).rejects.toThrow('Project ID is required');
    });

    it('should throw when environment ID is empty', async () => {
      await expect(
        sourceOperationTask.run('proj-1', '', 'rebuild', {}),
      ).rejects.toThrow('Environment ID is required');
    });

    it('should handle API error', async () => {
      mockSourceOperationsApi.runSourceOperation.mockRejectedValue(new Error('Run failed'));
      await expect(
        sourceOperationTask.run('proj-1', 'main', 'rebuild', {}),
      ).rejects.toThrow('Run failed');
    });
  });
});
