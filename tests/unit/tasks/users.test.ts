import { UsersTask } from '../../../src/core/tasks/users.js';
import { UpsunClient } from '../../../src/upsun.js';
import { UsersApi } from '../../../src/api/index.js';

// Mock the UpsunClient and UsersApi
jest.mock('../../../src/upsun');
jest.mock('../../../src/api/index');

describe('UsersTask', () => {
  let usersTask: UsersTask;
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

    usersTask = new UsersTask(
      mockClient,
      mockUsersApi,
      {} as any, // userProfilesApi
      {} as any, // userAccessApi
      {} as any, // apiTokensApi
      {} as any, // connectionsApi
      {} as any, // grantsApi
      {} as any, // mfaApi
      {} as any, // phoneNumberApi
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('me', () => {
    it('should have me method defined', () => {
      expect(usersTask.me).toBeDefined();
      expect(typeof usersTask.me).toBe('function');
    });

    it('should get current user information', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: '2023-01-01T00:00:00Z',
      };

      mockUsersApi.getCurrentUser.mockResolvedValue(mockUser as any);

      const result = await usersTask.me();
      expect(result).toBeDefined();
      expect((result as any).id).toBe('user-123');
      expect((result as any).email).toBe('test@example.com');
      expect(mockUsersApi.getCurrentUser).toHaveBeenCalled();
    });

    it('should handle authentication errors', async () => {
      mockUsersApi.getCurrentUser.mockRejectedValue(new Error('Unauthorized'));

      await expect(usersTask.me()).rejects.toThrow('Unauthorized');
    });
  });
});
