import { ActivitiesTask } from '../../../src/core/tasks/activities.js';
import { UpsunClient } from '../../../src/upsun.js';
import { ProjectActivityApi, EnvironmentActivityApi } from '../../../src/api/index.js';

// Mock the UpsunClient and APIs
jest.mock('../../../src/upsun.js');
jest.mock('../../../src/api/index.js');

describe('ActivitiesTask', () => {
  let activitiesTask: ActivitiesTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockProjectActivityApi: jest.Mocked<ProjectActivityApi>;
  let mockEnvironmentActivityApi: jest.Mocked<EnvironmentActivityApi>;

  beforeEach(() => {
    mockProjectActivityApi = {
      listProjectsActivities: jest.fn(),
      getProjectsActivities: jest.fn(),
      actionProjectsActivitiesCancel: jest.fn(),
    } as any;

    mockEnvironmentActivityApi = {
      listProjectsEnvironmentsActivities: jest.fn(),
      getProjectsEnvironmentsActivities: jest.fn(),
      actionProjectsEnvironmentsActivitiesCancel: jest.fn(),
    } as any;

    (ProjectActivityApi as jest.MockedClass<typeof ProjectActivityApi>).mockImplementation(
      () => mockProjectActivityApi,
    );
    (EnvironmentActivityApi as jest.MockedClass<typeof EnvironmentActivityApi>).mockImplementation(
      () => mockEnvironmentActivityApi,
    );

    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    activitiesTask = new ActivitiesTask(
      mockClient,
      mockProjectActivityApi,
      mockEnvironmentActivityApi,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(activitiesTask.list).toBeDefined();
      expect(typeof activitiesTask.list).toBe('function');
    });

    it('should list project activities', async () => {
      const mockActivities = [
        {
          id: 'activity-1',
          type: 'environment.backup',
          state: 'complete',
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockProjectActivityApi.listProjectsActivities.mockResolvedValue(mockActivities as any);

      const result = await activitiesTask.list('project-123');
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect((result[0] as any).id).toBe('activity-1');
      expect(mockProjectActivityApi.listProjectsActivities).toHaveBeenCalledWith({
        projectId: 'project-123',
      });
    });

    it('should list environment activities when environmentId is provided', async () => {
      const mockActivities = [{ id: 'env-act-1' }];
      mockEnvironmentActivityApi.listProjectsEnvironmentsActivities.mockResolvedValue(
        mockActivities as any,
      );

      const result = await activitiesTask.list('project-123', 'main');
      expect(result).toEqual(mockActivities);
      expect(mockEnvironmentActivityApi.listProjectsEnvironmentsActivities).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
      });
    });
  });

  describe('get', () => {
    it('should have get method defined', () => {
      expect(activitiesTask.get).toBeDefined();
      expect(typeof activitiesTask.get).toBe('function');
    });

    it('should get a specific activity', async () => {
      const mockActivity = {
        id: 'activity-123',
        type: 'environment.backup',
        state: 'complete',
        created_at: '2023-01-01T00:00:00Z',
      };

      mockProjectActivityApi.getProjectsActivities.mockResolvedValue(mockActivity as any);

      const result = await activitiesTask.get('project-123', 'activity-123');
      expect(result).toBeDefined();
      expect((result as any).id).toBe('activity-123');
      expect(mockProjectActivityApi.getProjectsActivities).toHaveBeenCalledWith({
        projectId: 'project-123',
        activityId: 'activity-123',
      });
    });

    it('should get an environment activity when environmentId is provided', async () => {
      const mockActivity = { id: 'env-activity-123' };
      mockEnvironmentActivityApi.getProjectsEnvironmentsActivities.mockResolvedValue(
        mockActivity as any,
      );

      const result = await activitiesTask.get('project-123', 'activity-123', 'main');
      expect(result).toEqual(mockActivity);
      expect(mockEnvironmentActivityApi.getProjectsEnvironmentsActivities).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
        activityId: 'activity-123',
      });
    });
  });

  describe('cancel', () => {
    it('should have cancel method defined', () => {
      expect(activitiesTask.cancel).toBeDefined();
      expect(typeof activitiesTask.cancel).toBe('function');
    });

    it('should cancel an activity', async () => {
      const mockResult = { success: true };

      mockProjectActivityApi.actionProjectsActivitiesCancel.mockResolvedValue(mockResult as any);

      const result = await activitiesTask.cancel('project-123', 'activity-123');
      expect(result).toBeDefined();
      expect(mockProjectActivityApi.actionProjectsActivitiesCancel).toHaveBeenCalledWith({
        projectId: 'project-123',
        activityId: 'activity-123',
      });
    });

    it('should cancel an environment activity when environmentId is provided', async () => {
      const mockResult = { success: true };
      mockEnvironmentActivityApi.actionProjectsEnvironmentsActivitiesCancel.mockResolvedValue(
        mockResult as any,
      );

      const result = await activitiesTask.cancel('project-123', 'activity-123', 'main');
      expect(result).toEqual(mockResult);
      expect(
        mockEnvironmentActivityApi.actionProjectsEnvironmentsActivitiesCancel,
      ).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
        activityId: 'activity-123',
      });
    });
  });

  describe('log', () => {
    const startedAt = new Date('2023-01-01T00:00:00Z');
    const completedAt = new Date('2023-01-01T00:01:00Z');
    let logsQuery: jest.Mock<Promise<any>, any[]>;

    beforeEach(() => {
      logsQuery = jest.fn();
      (mockClient as any).observability = { logsQuery };
    });

    it('should read the deployment and platform logs of the activity time range', async () => {
      mockEnvironmentActivityApi.getProjectsEnvironmentsActivities.mockResolvedValue({
        startedAt,
        completedAt,
      } as any);
      logsQuery.mockResolvedValue({ data: [{ content: 'line 1' }, { content: 'line 2' }] });

      await expect(activitiesTask.log('project-123', 'activity-123', 'main')).resolves.toBe(
        'line 1\nline 2',
      );
      expect(logsQuery).toHaveBeenCalledWith('project-123', 'main', {
        from: startedAt.getTime() / 1000,
        to: completedAt.getTime() / 1000,
        order: 'ASC',
        logKinds: ['deployment', 'platform'],
        logKindsMode: '1',
        cursor: undefined,
      });
    });

    it('should use the first environment of the activity and follow the cursor', async () => {
      mockProjectActivityApi.getProjectsActivities.mockResolvedValue({
        environments: ['staging'],
        startedAt,
        completedAt,
      } as any);
      logsQuery
        .mockResolvedValueOnce({ data: [{ content: 'a' }], hasMoreResults: true, cursor: 'c1' })
        .mockResolvedValueOnce({ data: [{ content: 'b' }], hasMoreResults: false });

      await expect(activitiesTask.log('project-123', 'activity-123')).resolves.toBe('a\nb');
      expect(logsQuery).toHaveBeenCalledTimes(2);
      expect(logsQuery.mock.calls[0][1]).toBe('staging');
      expect(logsQuery.mock.calls[1][2].cursor).toBe('c1');
    });

    it('should validate the IDs', async () => {
      await expect(activitiesTask.log('', 'activity-123')).rejects.toThrow(
        'Project ID is required',
      );
      await expect(activitiesTask.log('project-123', '')).rejects.toThrow(
        'Activity ID is required',
      );
    });

    it('should throw when the activity is not linked to an environment', async () => {
      mockProjectActivityApi.getProjectsActivities.mockResolvedValue({ startedAt } as any);

      await expect(activitiesTask.log('project-123', 'activity-123')).rejects.toThrow(
        'not linked to an environment',
      );
      expect(logsQuery).not.toHaveBeenCalled();
    });

    it('should throw when the activity has not started', async () => {
      mockProjectActivityApi.getProjectsActivities.mockResolvedValue({
        environments: ['main'],
        startedAt: null,
        createdAt: null,
      } as any);

      await expect(activitiesTask.log('project-123', 'activity-123')).rejects.toThrow(
        'has not started',
      );
    });
  });
});
