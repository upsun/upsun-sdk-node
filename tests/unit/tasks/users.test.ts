import { UsersTask } from '../../../src/core/tasks/users.js';
import { UpsunClient } from '../../../src/upsun.js';
import {
  ApiTokensApi,
  ConnectionsApi,
  GrantsApi,
  MfaApi,
  PhoneNumberApi,
  UserAccessApi,
  UserProfilesApi,
  UsersApi,
} from '../../../src/api/index.js';

jest.mock('../../../src/upsun.js');
jest.mock('../../../src/api/index.js');

describe('UsersTask', () => {
  let usersTask: UsersTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockUsersApi: jest.Mocked<UsersApi>;
  let mockUserProfilesApi: jest.Mocked<UserProfilesApi>;
  let mockUserAccessApi: jest.Mocked<UserAccessApi>;
  let mockApiTokensApi: jest.Mocked<ApiTokensApi>;
  let mockConnectionsApi: jest.Mocked<ConnectionsApi>;
  let mockGrantsApi: jest.Mocked<GrantsApi>;
  let mockMfaApi: jest.Mocked<MfaApi>;
  let mockPhoneNumberApi: jest.Mocked<PhoneNumberApi>;

  beforeEach(() => {
    mockUsersApi = {
      getCurrentUser: jest.fn(),
      getUser: jest.fn(),
      getUserByEmailAddress: jest.fn(),
      getUserByUsername: jest.fn(),
      getCurrentUserVerificationStatus: jest.fn(),
      getCurrentUserVerificationStatusFull: jest.fn(),
      resetEmailAddress: jest.fn(),
      resetPassword: jest.fn(),
      updateUser: jest.fn(),
    } as any;

    mockUserProfilesApi = {
      getProfile: jest.fn(),
      getAddress: jest.fn(),
      listProfiles: jest.fn(),
      updateAddress: jest.fn(),
      updateProfile: jest.fn(),
      deleteProfilePicture: jest.fn(),
    } as any;

    mockUserAccessApi = {
      grantProjectUserAccess: jest.fn(),
      removeProjectUserAccess: jest.fn(),
      removeUserProjectAccess: jest.fn(),
      getProjectUserAccess: jest.fn(),
      getUserProjectAccess: jest.fn(),
      listProjectUserAccess: jest.fn(),
      listUserProjectAccess: jest.fn(),
      grantUserProjectAccess: jest.fn(),
      updateProjectUserAccess: jest.fn(),
      updateUserProjectAccess: jest.fn(),
    } as any;

    mockApiTokensApi = {
      createApiToken: jest.fn(),
      deleteApiToken: jest.fn(),
      getApiToken: jest.fn(),
      listApiTokens: jest.fn(),
    } as any;

    mockConnectionsApi = {
      deleteLoginConnection: jest.fn(),
      getLoginConnection: jest.fn(),
      listLoginConnections: jest.fn(),
    } as any;

    mockGrantsApi = {
      listUserExtendedAccess: jest.fn(),
    } as any;

    mockMfaApi = {
      confirmTotpEnrollment: jest.fn(),
      getTotpEnrollment: jest.fn(),
      withdrawTotpEnrollment: jest.fn(),
      recreateRecoveryCodes: jest.fn(),
    } as any;

    mockPhoneNumberApi = {
      confirmPhoneNumber: jest.fn(),
      verifyPhoneNumber: jest.fn(),
    } as any;

    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    usersTask = new UsersTask(
      mockClient,
      mockUsersApi,
      mockUserProfilesApi,
      mockUserAccessApi,
      mockApiTokensApi,
      mockConnectionsApi,
      mockGrantsApi,
      mockMfaApi,
      mockPhoneNumberApi,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('me', () => {
    it('should get current user information', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockUsersApi.getCurrentUser.mockResolvedValue(mockUser as any);

      const result = await usersTask.me();
      expect(result).toEqual(mockUser);
      expect(mockUsersApi.getCurrentUser).toHaveBeenCalled();
    });

    it('should handle authentication errors', async () => {
      mockUsersApi.getCurrentUser.mockRejectedValue(new Error('Unauthorized'));

      await expect(usersTask.me()).rejects.toThrow('Unauthorized');
    });
  });

  describe('create', () => {
    it('should throw because API user creation is not supported', async () => {
      await expect(usersTask.create()).rejects.toThrow(
        'User creation is not supported through the API',
      );
    });
  });

  describe('addToProject', () => {
    it('should grant project access to users', async () => {
      const permissions = [{ userId: 'user-1', permissions: ['admin'] }];
      mockUserAccessApi.grantProjectUserAccess.mockResolvedValue(undefined);

      await usersTask.addToProject('proj-1', permissions as any);

      expect(mockUserAccessApi.grantProjectUserAccess).toHaveBeenCalledWith({
        projectId: 'proj-1',
        grantProjectUserAccessRequestInner: permissions,
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(usersTask.addToProject('', [{ userId: 'u' }] as any)).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when permissions are empty', async () => {
      await expect(usersTask.addToProject('proj-1', [])).rejects.toThrow(
        'At least one user permission is required',
      );
    });
  });

  describe('removeFromProject', () => {
    it('should remove a user from project', async () => {
      mockUserAccessApi.removeProjectUserAccess.mockResolvedValue(undefined);

      await usersTask.removeFromProject('user-1', 'proj-1');

      expect(mockUserAccessApi.removeProjectUserAccess).toHaveBeenCalledWith({
        projectId: 'proj-1',
        userId: 'user-1',
      });
    });

    it('should validate user and project IDs', async () => {
      await expect(usersTask.removeFromProject('', 'proj-1')).rejects.toThrow(
        'User ID is required',
      );
      await expect(usersTask.removeFromProject('user-1', '')).rejects.toThrow(
        'Project ID is required',
      );
    });
  });

  describe('get and lookup methods', () => {
    it('should get user by ID', async () => {
      const user = { id: 'user-1' };
      mockUsersApi.getUser.mockResolvedValue(user as any);

      const result = await usersTask.get('user-1');
      expect(result).toEqual(user);
      expect(mockUsersApi.getUser).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('should get user by email address', async () => {
      const user = { id: 'user-1', email: 'a@b.com' };
      mockUsersApi.getUserByEmailAddress.mockResolvedValue(user as any);

      const result = await usersTask.getByEmailAddress('a@b.com');
      expect(result).toEqual(user);
      expect(mockUsersApi.getUserByEmailAddress).toHaveBeenCalledWith({ email: 'a@b.com' });
    });

    it('should validate email address format', async () => {
      await expect(usersTask.getByEmailAddress('invalid')).rejects.toThrow('Invalid email format');
    });
  });

  describe('resetEmailAddress', () => {
    it('should reset email to empty string when not provided', async () => {
      mockUsersApi.resetEmailAddress.mockResolvedValue(undefined);

      await usersTask.resetEmailAddress('user-1');
      expect(mockUsersApi.resetEmailAddress).toHaveBeenCalledWith({
        userId: 'user-1',
        resetEmailAddressRequest: { emailAddress: '' },
      });
    });

    it('should reset email with explicit address', async () => {
      mockUsersApi.resetEmailAddress.mockResolvedValue(undefined);

      await usersTask.resetEmailAddress('user-1', 'user@example.com');
      expect(mockUsersApi.resetEmailAddress).toHaveBeenCalledWith({
        userId: 'user-1',
        resetEmailAddressRequest: { emailAddress: 'user@example.com' },
      });
    });

    it('should validate explicit email', async () => {
      await expect(usersTask.resetEmailAddress('user-1', 'not-an-email')).rejects.toThrow(
        'Invalid email format',
      );
    });
  });

  describe('access update methods', () => {
    it('should grant user access by user', async () => {
      const access = [{ projectId: 'proj-1', permissions: ['viewer'] }];
      mockUserAccessApi.grantUserProjectAccess.mockResolvedValue(undefined);

      await usersTask.grantUserProjectAccessByUser('user-1', access as any);
      expect(mockUserAccessApi.grantUserProjectAccess).toHaveBeenCalledWith({
        userId: 'user-1',
        grantUserProjectAccessRequestInner: access,
      });
    });

    it('should require at least one project access', async () => {
      await expect(usersTask.grantUserProjectAccessByUser('user-1', [])).rejects.toThrow(
        'At least one project ID is required to grant access',
      );
    });

    it('should update user access by project', async () => {
      mockUserAccessApi.updateProjectUserAccess.mockResolvedValue(undefined);

      await usersTask.updateUserProjectAccessByProject('proj-1', 'user-1', {
        permissions: ['admin'],
      } as any);

      expect(mockUserAccessApi.updateProjectUserAccess).toHaveBeenCalledWith({
        projectId: 'proj-1',
        userId: 'user-1',
        updateProjectUserAccessRequest: { permissions: ['admin'] },
      });
    });

    it('should require permissions when updating access', async () => {
      await expect(
        usersTask.updateUserProjectAccessByProject('proj-1', 'user-1', {} as any),
      ).rejects.toThrow('At least one access level is required to update user access');
    });
  });

  describe('API token methods', () => {
    it('should create API token', async () => {
      mockApiTokensApi.createApiToken.mockResolvedValue({ id: 'tok-1' } as any);

      await usersTask.createApiToken('user-1', 'token-name');
      expect(mockApiTokensApi.createApiToken).toHaveBeenCalledWith({
        userId: 'user-1',
        createApiTokenRequest: { name: 'token-name' },
      });
    });

    it('should require API token name', async () => {
      await expect(usersTask.createApiToken('user-1', '')).rejects.toThrow(
        'API token name is required',
      );
    });
  });

  describe('login connection methods', () => {
    it('should delete login connection', async () => {
      mockConnectionsApi.deleteLoginConnection.mockResolvedValue(undefined);

      await usersTask.deleteLoginConnection('github', 'user-1');
      expect(mockConnectionsApi.deleteLoginConnection).toHaveBeenCalledWith({
        userId: 'user-1',
        provider: 'github',
      });
    });

    it('should require provider for login connection deletion', async () => {
      await expect(usersTask.deleteLoginConnection('', 'user-1')).rejects.toThrow(
        'Login provider is required',
      );
    });

    it('should require provider for login connection retrieval', async () => {
      await expect(usersTask.getLoginConnection('', 'user-1')).rejects.toThrow(
        'Login provider is required',
      );
    });
  });

  describe('MFA methods', () => {
    it('should confirm TOTP enrollment', async () => {
      const response = { status: 'ok' };
      mockMfaApi.confirmTotpEnrollment.mockResolvedValue(response as any);

      const result = await usersTask.confirmTotpEnrollment('user-1', 'secret', '123456');
      expect(result).toEqual(response);
      expect(mockMfaApi.confirmTotpEnrollment).toHaveBeenCalledWith({
        userId: 'user-1',
        confirmTotpEnrollmentRequest: { secret: 'secret', passcode: '123456' },
      });
    });

    it('should validate secret and passCode', async () => {
      await expect(usersTask.confirmTotpEnrollment('user-1', '', '123456')).rejects.toThrow(
        'TOTP secret is required',
      );
      await expect(usersTask.confirmTotpEnrollment('user-1', 'secret', '')).rejects.toThrow(
        'TOTP pass code is required',
      );
    });
  });

  describe('phone number methods', () => {
    it('should confirm phone number', async () => {
      mockPhoneNumberApi.confirmPhoneNumber.mockResolvedValue(undefined);

      await usersTask.confirmPhoneNumber('sid-1', 'user-1', '999999');
      expect(mockPhoneNumberApi.confirmPhoneNumber).toHaveBeenCalledWith({
        sid: 'sid-1',
        userId: 'user-1',
        confirmPhoneNumberRequest: { code: '999999' },
      });
    });

    it('should validate sid and code for phone confirmation', async () => {
      await expect(usersTask.confirmPhoneNumber('', 'user-1', '999999')).rejects.toThrow(
        'Phone number SID is required',
      );
      await expect(usersTask.confirmPhoneNumber('sid-1', 'user-1', '')).rejects.toThrow(
        'Confirmation code is required',
      );
    });

    it('should verify phone number', async () => {
      mockPhoneNumberApi.verifyPhoneNumber.mockResolvedValue({} as any);

      await usersTask.verifyPhoneNumber('user-1', 'sms' as any, '+33123456789');
      expect(mockPhoneNumberApi.verifyPhoneNumber).toHaveBeenCalledWith({
        userId: 'user-1',
        verifyPhoneNumberRequest: {
          channel: 'sms',
          phoneNumber: '+33123456789',
        },
      });
    });

    it('should require channel and phone number', async () => {
      await expect(usersTask.verifyPhoneNumber('user-1', undefined as any, '+33')).rejects.toThrow(
        'Verification channel is required',
      );
      await expect(usersTask.verifyPhoneNumber('user-1', 'sms' as any, '')).rejects.toThrow(
        'Phone number is required',
      );
    });
  });

  describe('additional coverage', () => {
    it('should call profile and user verification endpoints', async () => {
      mockUsersApi.getCurrentUserVerificationStatus.mockResolvedValue({ ok: true } as any);
      mockUsersApi.getCurrentUserVerificationStatusFull.mockResolvedValue({ full: true } as any);
      mockUsersApi.getUserByUsername.mockResolvedValue({ id: 'u1' } as any);
      mockUsersApi.updateUser.mockResolvedValue({ id: 'user-1' } as any);
      mockUsersApi.resetPassword.mockResolvedValue(undefined);

      await usersTask.getCurrentUserVerificationStatus();
      await usersTask.getCurrentUserVerificationStatusFull();
      await usersTask.getByUsername('john');
      await usersTask.update('user-1', { firstName: 'John' } as any);
      await usersTask.resetPassword('user-1');

      expect(mockUsersApi.getCurrentUserVerificationStatus).toHaveBeenCalled();
      expect(mockUsersApi.getCurrentUserVerificationStatusFull).toHaveBeenCalled();
      expect(mockUsersApi.getUserByUsername).toHaveBeenCalledWith({ username: 'john' });
      expect(mockUsersApi.updateUser).toHaveBeenCalledWith({
        userId: 'user-1',
        updateUserRequest: { firstName: 'John' },
      });
      expect(mockUsersApi.resetPassword).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('should cover remaining user access methods', async () => {
      mockUserAccessApi.listProjectUserAccess.mockResolvedValue({ items: [] } as any);
      mockUserAccessApi.getProjectUserAccess.mockResolvedValue({} as any);
      mockUserAccessApi.getUserProjectAccess.mockResolvedValue({} as any);
      mockUserAccessApi.listUserProjectAccess.mockResolvedValue({ items: [] } as any);
      mockGrantsApi.listUserExtendedAccess.mockResolvedValue({ items: [] } as any);
      mockUserAccessApi.removeUserProjectAccess.mockResolvedValue(undefined);
      mockUserAccessApi.updateUserProjectAccess.mockResolvedValue(undefined);

      await usersTask.listProjectUserAccesses('proj-1', { page: 1 } as any);
      await usersTask.getUserProjectAccessByProject('proj-1', 'user-1');
      await usersTask.getUserProjectAccessByUser('user-1', 'proj-1');
      await usersTask.listUserProjectAccessByUser('user-1', { page: 2 } as any);
      await usersTask.listExtendedUserProjectAccess('user-1', { page: 3 } as any);
      await usersTask.revokeUserProjectAccessByUser('user-1', 'proj-1');
      await usersTask.updateUserProjectAccessByUser('user-1', 'proj-1', {
        permissions: ['viewer'],
      } as any);

      expect(mockUserAccessApi.listProjectUserAccess).toHaveBeenCalledWith({
        projectId: 'proj-1',
        page: 1,
      });
      expect(mockUserAccessApi.getProjectUserAccess).toHaveBeenCalledWith({
        projectId: 'proj-1',
        userId: 'user-1',
      });
      expect(mockUserAccessApi.getUserProjectAccess).toHaveBeenCalledWith({
        projectId: 'proj-1',
        userId: 'user-1',
      });
      expect(mockUserAccessApi.listUserProjectAccess).toHaveBeenCalledWith({
        userId: 'user-1',
        page: 2,
      });
      expect(mockGrantsApi.listUserExtendedAccess).toHaveBeenCalledWith({
        userId: 'user-1',
        page: 3,
      });
      expect(mockUserAccessApi.removeUserProjectAccess).toHaveBeenCalledWith({
        projectId: 'proj-1',
        userId: 'user-1',
      });
      expect(mockUserAccessApi.updateUserProjectAccess).toHaveBeenCalledWith({
        projectId: 'proj-1',
        userId: 'user-1',
        updateProjectUserAccessRequest: { permissions: ['viewer'] },
      });
    });

    it('should reject updateUserProjectAccessByUser without permissions', async () => {
      await expect(
        usersTask.updateUserProjectAccessByUser('user-1', 'proj-1', {} as any),
      ).rejects.toThrow('At least one access level is required to update user access');
    });

    it('should cover profile endpoints', async () => {
      mockUserProfilesApi.getAddress.mockResolvedValue({} as any);
      mockUserProfilesApi.getProfile.mockResolvedValue({ id: 'user-1' } as any);
      mockUserProfilesApi.listProfiles.mockResolvedValue({ items: [] } as any);
      mockUserProfilesApi.updateAddress.mockResolvedValue({} as any);
      mockUserProfilesApi.updateProfile.mockResolvedValue({ id: 'user-1' } as any);
      mockUserProfilesApi.deleteProfilePicture.mockResolvedValue(undefined);

      await usersTask.getAddress('user-1');
      await usersTask.getProfile('user-1');
      await usersTask.listProfiles();
      await usersTask.updateAddress('user-1', { city: 'Paris' } as any);
      await usersTask.updateProfile('user-1', { website: 'https://x.dev' } as any);
      await usersTask.deleteProfilePicture('user-1');

      expect(mockUserProfilesApi.getAddress).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(mockUserProfilesApi.getProfile).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(mockUserProfilesApi.listProfiles).toHaveBeenCalled();
      expect(mockUserProfilesApi.updateAddress).toHaveBeenCalledWith({
        userId: 'user-1',
        address: { city: 'Paris' },
      });
      expect(mockUserProfilesApi.updateProfile).toHaveBeenCalledWith({
        userId: 'user-1',
        updateProfileRequest: { website: 'https://x.dev' },
      });
      expect(mockUserProfilesApi.deleteProfilePicture).toHaveBeenCalledWith({ uuid: 'user-1' });
    });

    it('should cover API token, login connection and MFA endpoints', async () => {
      mockApiTokensApi.deleteApiToken.mockResolvedValue(undefined);
      mockApiTokensApi.getApiToken.mockResolvedValue({ id: 'tok-1' } as any);
      mockApiTokensApi.listApiTokens.mockResolvedValue([{ id: 'tok-1' }] as any);
      mockConnectionsApi.getLoginConnection.mockResolvedValue({ provider: 'github' } as any);
      mockConnectionsApi.listLoginConnections.mockResolvedValue([{ provider: 'github' }] as any);
      mockMfaApi.getTotpEnrollment.mockResolvedValue({ enrolled: true } as any);
      mockMfaApi.withdrawTotpEnrollment.mockResolvedValue(undefined);
      mockMfaApi.recreateRecoveryCodes.mockResolvedValue({} as any);

      await usersTask.deleteApiToken('user-1', 'tok-1');
      await usersTask.getApiToken('user-1', 'tok-1');
      await usersTask.listApiTokens('user-1');
      await usersTask.getLoginConnection('github', 'user-1');
      await usersTask.listLoginConnections('user-1');
      await usersTask.getTotpEnrollment('user-1');
      await usersTask.withdrawTotpEnrollment('user-1');
      await usersTask.recreateMfaRecoveryCodes('user-1');

      expect(mockApiTokensApi.deleteApiToken).toHaveBeenCalledWith({
        userId: 'user-1',
        tokenId: 'tok-1',
      });
      expect(mockApiTokensApi.getApiToken).toHaveBeenCalledWith({
        userId: 'user-1',
        tokenId: 'tok-1',
      });
      expect(mockApiTokensApi.listApiTokens).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(mockConnectionsApi.getLoginConnection).toHaveBeenCalledWith({
        userId: 'user-1',
        provider: 'github',
      });
      expect(mockConnectionsApi.listLoginConnections).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(mockMfaApi.getTotpEnrollment).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(mockMfaApi.withdrawTotpEnrollment).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(mockMfaApi.recreateRecoveryCodes).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });
});
