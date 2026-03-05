import { RepositoriesTask } from '../../../src/core/tasks/repositories.js';
import { UpsunClient } from '../../../src/upsun.js';
import { RepositoryApi, SystemInformationApi } from '../../../src/api/index.js';

jest.mock('../../../src/upsun.js');
jest.mock('../../../src/api/index.js');

describe('RepositoriesTask', () => {
  let repositoriesTask: RepositoriesTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockRepositoryApi: jest.Mocked<RepositoryApi>;
  let mockSystemInfoApi: jest.Mocked<SystemInformationApi>;

  beforeEach(() => {
    mockRepositoryApi = {
      getProjectsGitBlobs: jest.fn(),
      getProjectsGitCommits: jest.fn(),
      getProjectsGitRefs: jest.fn(),
      listProjectsGitRefs: jest.fn(),
      getProjectsGitTrees: jest.fn(),
    } as any;

    mockSystemInfoApi = {
      getProjectsSystem: jest.fn(),
    } as any;

    (RepositoryApi as jest.MockedClass<typeof RepositoryApi>).mockImplementation(
      () => mockRepositoryApi,
    );
    (SystemInformationApi as jest.MockedClass<typeof SystemInformationApi>).mockImplementation(
      () => mockSystemInfoApi,
    );

    mockClient = {
      apiConfig: { basePath: 'https://api.upsun.com' },
    } as any;

    repositoriesTask = new RepositoriesTask(mockClient, mockRepositoryApi, mockSystemInfoApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGitBlob', () => {
    it('should have getGitBlob method defined', () => {
      expect(repositoriesTask.getGitBlob).toBeDefined();
    });

    it('should return a git blob', async () => {
      const mockBlob = { sha: 'abc123', content: 'aGVsbG8=', encoding: 'base64' };
      mockRepositoryApi.getProjectsGitBlobs.mockResolvedValue(mockBlob as any);

      const result = await repositoriesTask.getGitBlob('proj-1', 'abc123');
      expect(result).toBeDefined();
      expect(mockRepositoryApi.getProjectsGitBlobs).toHaveBeenCalledWith({
        projectId: 'proj-1',
        repositoryBlobId: 'abc123',
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(repositoriesTask.getGitBlob('', 'abc123')).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when blob ID is empty', async () => {
      await expect(repositoriesTask.getGitBlob('proj-1', '')).rejects.toThrow(
        'Repository Blob ID is required',
      );
    });

    it('should handle API error', async () => {
      mockRepositoryApi.getProjectsGitBlobs.mockRejectedValue(new Error('Blob not found'));
      await expect(repositoriesTask.getGitBlob('proj-1', 'abc123')).rejects.toThrow(
        'Blob not found',
      );
    });
  });

  describe('getGitCommit', () => {
    it('should have getGitCommit method defined', () => {
      expect(repositoriesTask.getGitCommit).toBeDefined();
    });

    it('should return a git commit', async () => {
      const mockCommit = { sha: 'abc123', message: 'Initial commit' };
      mockRepositoryApi.getProjectsGitCommits.mockResolvedValue(mockCommit as any);

      const result = await repositoriesTask.getGitCommit('proj-1', 'abc123');
      expect(result).toBeDefined();
      expect((result as any).sha).toBe('abc123');
      expect(mockRepositoryApi.getProjectsGitCommits).toHaveBeenCalledWith({
        projectId: 'proj-1',
        repositoryCommitId: 'abc123',
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(repositoriesTask.getGitCommit('', 'abc123')).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when commit ID is empty', async () => {
      await expect(repositoriesTask.getGitCommit('proj-1', '')).rejects.toThrow(
        'Repository Commit ID is required',
      );
    });

    it('should handle API error', async () => {
      mockRepositoryApi.getProjectsGitCommits.mockRejectedValue(new Error('Commit not found'));
      await expect(repositoriesTask.getGitCommit('proj-1', 'abc123')).rejects.toThrow(
        'Commit not found',
      );
    });
  });

  describe('getGitRef', () => {
    it('should have getGitRef method defined', () => {
      expect(repositoriesTask.getGitRef).toBeDefined();
    });

    it('should return a git ref', async () => {
      const mockRef = { name: 'heads/main', type: 'branch' };
      mockRepositoryApi.getProjectsGitRefs.mockResolvedValue(mockRef as any);

      const result = await repositoriesTask.getGitRef('proj-1', 'heads/main');
      expect(result).toBeDefined();
      expect(mockRepositoryApi.getProjectsGitRefs).toHaveBeenCalledWith({
        projectId: 'proj-1',
        repositoryRefId: 'heads/main',
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(repositoriesTask.getGitRef('', 'heads/main')).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when ref ID is empty', async () => {
      await expect(repositoriesTask.getGitRef('proj-1', '')).rejects.toThrow(
        'Repository Ref ID is required',
      );
    });

    it('should handle API error', async () => {
      mockRepositoryApi.getProjectsGitRefs.mockRejectedValue(new Error('Ref not found'));
      await expect(repositoriesTask.getGitRef('proj-1', 'heads/main')).rejects.toThrow(
        'Ref not found',
      );
    });
  });

  describe('listGitRefs', () => {
    it('should have listGitRefs method defined', () => {
      expect(repositoriesTask.listGitRefs).toBeDefined();
    });

    it('should list all git refs for a project', async () => {
      const mockRefs = [
        { name: 'heads/main', type: 'branch' },
        { name: 'tags/v1.0', type: 'tag' },
      ];
      mockRepositoryApi.listProjectsGitRefs.mockResolvedValue(mockRefs as any);

      const result = await repositoriesTask.listGitRefs('proj-1');
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(mockRepositoryApi.listProjectsGitRefs).toHaveBeenCalledWith({ projectId: 'proj-1' });
    });

    it('should throw when project ID is empty', async () => {
      await expect(repositoriesTask.listGitRefs('')).rejects.toThrow('Project ID is required');
    });

    it('should handle API error', async () => {
      mockRepositoryApi.listProjectsGitRefs.mockRejectedValue(new Error('Server error'));
      await expect(repositoriesTask.listGitRefs('proj-1')).rejects.toThrow('Server error');
    });
  });

  describe('getGitTree', () => {
    it('should have getGitTree method defined', () => {
      expect(repositoriesTask.getGitTree).toBeDefined();
    });

    it('should return a git tree', async () => {
      const mockTree = { sha: 'tree-abc', entries: [] };
      mockRepositoryApi.getProjectsGitTrees.mockResolvedValue(mockTree as any);

      const result = await repositoriesTask.getGitTree('proj-1', 'tree-abc');
      expect(result).toBeDefined();
      expect(mockRepositoryApi.getProjectsGitTrees).toHaveBeenCalledWith({
        projectId: 'proj-1',
        repositoryTreeId: 'tree-abc',
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(repositoriesTask.getGitTree('', 'tree-abc')).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when tree ID is empty', async () => {
      await expect(repositoriesTask.getGitTree('proj-1', '')).rejects.toThrow(
        'Repository Tree ID is required',
      );
    });

    it('should handle API error', async () => {
      mockRepositoryApi.getProjectsGitTrees.mockRejectedValue(new Error('Tree not found'));
      await expect(repositoriesTask.getGitTree('proj-1', 'tree-abc')).rejects.toThrow(
        'Tree not found',
      );
    });
  });

  describe('getGitInfo', () => {
    it('should have getGitInfo method defined', () => {
      expect(repositoriesTask.getGitInfo).toBeDefined();
    });

    it('should return git system information', async () => {
      const mockInfo = { status: 'ok', version: '2.39' };
      mockSystemInfoApi.getProjectsSystem.mockResolvedValue(mockInfo as any);

      const result = await repositoriesTask.getGitInfo('proj-1');
      expect(result).toBeDefined();
      expect(mockSystemInfoApi.getProjectsSystem).toHaveBeenCalledWith({ projectId: 'proj-1' });
    });

    it('should throw when project ID is empty', async () => {
      await expect(repositoriesTask.getGitInfo('')).rejects.toThrow('Project ID is required');
    });

    it('should handle API error', async () => {
      mockSystemInfoApi.getProjectsSystem.mockRejectedValue(new Error('System unavailable'));
      await expect(repositoriesTask.getGitInfo('proj-1')).rejects.toThrow('System unavailable');
    });
  });
});
