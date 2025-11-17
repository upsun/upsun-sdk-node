import { ActivityTask } from '../../../src/core/tasks/activity.js';
import { UpsunClient } from '../../../src/upsun.js';
import { ProjectActivityApi, EnvironmentActivityApi } from '../../../src/api/index.js';

// Mock the UpsunClient and APIs
jest.mock('../../../src/upsun.js');
jest.mock('../../../src/api/index.js');

describe('ActivityTask', () => {
  let activityTask: ActivityTask;
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

    activityTask = new ActivityTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(activityTask.list).toBeDefined();
      expect(typeof activityTask.list).toBe('function');
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

      const result = await activityTask.list('project-123');
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect((result[0] as any).id).toBe('activity-1');
      expect(mockProjectActivityApi.listProjectsActivities).toHaveBeenCalledWith({
        projectId: 'project-123',
      });
    });
  });

  describe('get', () => {
    it('should have get method defined', () => {
      expect(activityTask.get).toBeDefined();
      expect(typeof activityTask.get).toBe('function');
    });

    it('should get a specific activity', async () => {
      const mockActivity = {
        id: 'activity-123',
        type: 'environment.backup',
        state: 'complete',
        created_at: '2023-01-01T00:00:00Z',
      };

      mockProjectActivityApi.getProjectsActivities.mockResolvedValue(mockActivity as any);

      const result = await activityTask.get('project-123', 'activity-123');
      expect(result).toBeDefined();
      expect((result as any).id).toBe('activity-123');
      expect(mockProjectActivityApi.getProjectsActivities).toHaveBeenCalledWith({
        projectId: 'project-123',
        activityId: 'activity-123',
      });
    });
  });

  describe('cancel', () => {
    it('should have cancel method defined', () => {
      expect(activityTask.cancel).toBeDefined();
      expect(typeof activityTask.cancel).toBe('function');
    });

    it('should cancel an activity', async () => {
      const mockResult = { success: true };

      mockProjectActivityApi.actionProjectsActivitiesCancel.mockResolvedValue(mockResult as any);

      const result = await activityTask.cancel('project-123', 'activity-123');
      expect(result).toBeDefined();
      expect(mockProjectActivityApi.actionProjectsActivitiesCancel).toHaveBeenCalledWith({
        projectId: 'project-123',
        activityId: 'activity-123',
      });
    });
  });

  describe('log', () => {
    it('should throw not implemented error', async () => {
      await expect(activityTask.log('project-123', 'activity-123')).rejects.toThrow(
        'Not implemented',
      );
    });
  });
});
