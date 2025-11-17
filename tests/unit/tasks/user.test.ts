import { UserTask } from '../../../src/core/tasks/user.js';
import { UpsunClient } from '../../../src/upsun.js';
import { UsersApi } from '../../../src/api/index.js';

// Mock the UpsunClient and UsersApi
jest.mock('../../../src/upsun');
jest.mock('../../../src/api/index.js');

describe('UserTask', () => {
  let userTask: UserTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockUsersApi: jest.Mocked<UsersApi>;

  beforeEach(() => {
    mockUsersApi = {
      getCurrentUser: jest.fn(),
    } as any;

    (UsersApi as jest.MockedClass<typeof UsersApi>).mockImplementation(() => mockUsersApi);

    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    userTask = new UserTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('me', () => {
    it('should have me method defined', () => {
      expect(userTask.me).toBeDefined();
      expect(typeof userTask.me).toBe('function');
    });

    it('should get current user information', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: '2023-01-01T00:00:00Z',
      };

      mockUsersApi.getCurrentUser.mockResolvedValue(mockUser as any);

      const result = await userTask.me();
      expect(result).toBeDefined();
      expect((result as any).id).toBe('user-123');
      expect((result as any).email).toBe('test@example.com');
      expect(mockUsersApi.getCurrentUser).toHaveBeenCalled();
    });

    it('should handle authentication errors', async () => {
      mockUsersApi.getCurrentUser.mockRejectedValue(new Error('Unauthorized'));

      await expect(userTask.me()).rejects.toThrow('Unauthorized');
    });
  });
});
