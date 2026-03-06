import { UsersInvitationsTask } from '../../../src/core/tasks/users-invitations.js';
import { UpsunClient } from '../../../src/upsun.js';
import { OrganizationInvitationsApi, ProjectInvitationsApi } from '../../../src/api/index.js';

jest.mock('../../../src/upsun.js');
jest.mock('../../../src/api/index.js');

describe('UsersInvitationsTask', () => {
  let usersInvitationsTask: UsersInvitationsTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockOrgInvitationsApi: jest.Mocked<OrganizationInvitationsApi>;
  let mockProjectInvitationsApi: jest.Mocked<ProjectInvitationsApi>;

  beforeEach(() => {
    mockOrgInvitationsApi = {
      cancelOrgInvite: jest.fn(),
      createOrgInvite: jest.fn(),
      listOrgInvites: jest.fn(),
    } as any;

    mockProjectInvitationsApi = {
      cancelProjectInvite: jest.fn(),
      createProjectInvite: jest.fn(),
      listProjectInvites: jest.fn(),
    } as any;

    (
      OrganizationInvitationsApi as jest.MockedClass<typeof OrganizationInvitationsApi>
    ).mockImplementation(() => mockOrgInvitationsApi);
    (ProjectInvitationsApi as jest.MockedClass<typeof ProjectInvitationsApi>).mockImplementation(
      () => mockProjectInvitationsApi,
    );

    mockClient = {
      apiConfig: { basePath: 'https://api.upsun.com' },
    } as any;

    usersInvitationsTask = new UsersInvitationsTask(
      mockClient,
      mockOrgInvitationsApi,
      mockProjectInvitationsApi,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── Organisation Invitations ────────────────────────────────────────────────

  describe('cancelOrgInvite', () => {
    it('should have cancelOrgInvite method defined', () => {
      expect(usersInvitationsTask.cancelOrgInvite).toBeDefined();
    });

    it('should cancel an org invitation', async () => {
      mockOrgInvitationsApi.cancelOrgInvite.mockResolvedValue(undefined);

      await usersInvitationsTask.cancelOrgInvite('org-1', 'inv-1');
      expect(mockOrgInvitationsApi.cancelOrgInvite).toHaveBeenCalledWith({
        organizationId: 'org-1',
        invitationId: 'inv-1',
      });
    });

    it('should throw when organization ID is empty', async () => {
      await expect(usersInvitationsTask.cancelOrgInvite('', 'inv-1')).rejects.toThrow(
        'Organization ID is required',
      );
    });

    it('should throw when invitation ID is empty', async () => {
      await expect(usersInvitationsTask.cancelOrgInvite('org-1', '')).rejects.toThrow(
        'Invite ID is required',
      );
    });

    it('should handle API error', async () => {
      mockOrgInvitationsApi.cancelOrgInvite.mockRejectedValue(new Error('Not found'));
      await expect(usersInvitationsTask.cancelOrgInvite('org-1', 'inv-1')).rejects.toThrow(
        'Not found',
      );
    });
  });

  describe('createOrgInvite', () => {
    it('should have createOrgInvite method defined', () => {
      expect(usersInvitationsTask.createOrgInvite).toBeDefined();
    });

    it('should create an org invitation', async () => {
      const mockInvite = { id: 'inv-1', email: 'user@example.com' };
      mockOrgInvitationsApi.createOrgInvite.mockResolvedValue(mockInvite as any);

      const permissions = ['admin'] as any;
      const result = await usersInvitationsTask.createOrgInvite(
        'org-1',
        'user@example.com',
        permissions,
      );
      expect(result).toBeDefined();
      expect(mockOrgInvitationsApi.createOrgInvite).toHaveBeenCalledWith({
        organizationId: 'org-1',
        createOrgInviteRequest: {
          email: 'user@example.com',
          permissions,
          force: undefined,
        },
      });
    });

    it('should create an org invite with force flag', async () => {
      const mockInvite = { id: 'inv-2', email: 'user@example.com' };
      mockOrgInvitationsApi.createOrgInvite.mockResolvedValue(mockInvite as any);

      const permissions = ['member'] as any;
      await usersInvitationsTask.createOrgInvite('org-1', 'user@example.com', permissions, true);
      expect(mockOrgInvitationsApi.createOrgInvite).toHaveBeenCalledWith({
        organizationId: 'org-1',
        createOrgInviteRequest: {
          email: 'user@example.com',
          permissions,
          force: true,
        },
      });
    });

    it('should throw when organization ID is empty', async () => {
      await expect(
        usersInvitationsTask.createOrgInvite('', 'user@example.com', ['admin'] as any),
      ).rejects.toThrow('Organization ID is required');
    });

    it('should throw when email is empty', async () => {
      await expect(
        usersInvitationsTask.createOrgInvite('org-1', '', ['admin'] as any),
      ).rejects.toThrow('Email is required');
    });

    it('should throw when email format is invalid', async () => {
      await expect(
        usersInvitationsTask.createOrgInvite('org-1', 'not-an-email', ['admin'] as any),
      ).rejects.toThrow('Invalid email format');
    });

    it('should throw when permissions array is empty', async () => {
      await expect(
        usersInvitationsTask.createOrgInvite('org-1', 'user@example.com', [] as any),
      ).rejects.toThrow('Permissions are required');
    });

    it('should handle API error', async () => {
      mockOrgInvitationsApi.createOrgInvite.mockRejectedValue(new Error('Conflict'));
      await expect(
        usersInvitationsTask.createOrgInvite('org-1', 'user@example.com', ['admin'] as any),
      ).rejects.toThrow('Conflict');
    });
  });

  describe('listOrgInvites', () => {
    it('should have listOrgInvites method defined', () => {
      expect(usersInvitationsTask.listOrgInvites).toBeDefined();
    });

    it('should list org invitations', async () => {
      const mockInvites = [
        { id: 'inv-1', email: 'a@b.com' },
        { id: 'inv-2', email: 'c@d.com' },
      ];
      mockOrgInvitationsApi.listOrgInvites.mockResolvedValue(mockInvites as any);

      const result = await usersInvitationsTask.listOrgInvites('org-1');
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(mockOrgInvitationsApi.listOrgInvites).toHaveBeenCalledWith({
        organizationId: 'org-1',
      });
    });

    it('should pass filters to the API', async () => {
      mockOrgInvitationsApi.listOrgInvites.mockResolvedValue([]);
      const filters = { email: 'specific@example.com' } as any;

      await usersInvitationsTask.listOrgInvites('org-1', filters);
      expect(mockOrgInvitationsApi.listOrgInvites).toHaveBeenCalledWith({
        organizationId: 'org-1',
        email: 'specific@example.com',
      });
    });

    it('should throw when organization ID is empty', async () => {
      await expect(usersInvitationsTask.listOrgInvites('')).rejects.toThrow(
        'Organization ID is required',
      );
    });

    it('should handle API error', async () => {
      mockOrgInvitationsApi.listOrgInvites.mockRejectedValue(new Error('Server error'));
      await expect(usersInvitationsTask.listOrgInvites('org-1')).rejects.toThrow('Server error');
    });
  });

  // ─── Project Invitations ─────────────────────────────────────────────────────

  describe('cancelProjectInvite', () => {
    it('should have cancelProjectInvite method defined', () => {
      expect(usersInvitationsTask.cancelProjectInvite).toBeDefined();
    });

    it('should cancel a project invitation', async () => {
      mockProjectInvitationsApi.cancelProjectInvite.mockResolvedValue(undefined);

      await usersInvitationsTask.cancelProjectInvite('proj-1', 'inv-1');
      expect(mockProjectInvitationsApi.cancelProjectInvite).toHaveBeenCalledWith({
        projectId: 'proj-1',
        invitationId: 'inv-1',
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(usersInvitationsTask.cancelProjectInvite('', 'inv-1')).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when invitation ID is empty', async () => {
      await expect(usersInvitationsTask.cancelProjectInvite('proj-1', '')).rejects.toThrow(
        'Invite ID is required',
      );
    });

    it('should handle API error', async () => {
      mockProjectInvitationsApi.cancelProjectInvite.mockRejectedValue(new Error('Not found'));
      await expect(usersInvitationsTask.cancelProjectInvite('proj-1', 'inv-1')).rejects.toThrow(
        'Not found',
      );
    });
  });

  describe('createProjectInvite', () => {
    it('should have createProjectInvite method defined', () => {
      expect(usersInvitationsTask.createProjectInvite).toBeDefined();
    });

    it('should create a project invitation', async () => {
      const mockInvite = { id: 'inv-1', email: 'dev@example.com' };
      mockProjectInvitationsApi.createProjectInvite.mockResolvedValue(mockInvite as any);

      const result = await usersInvitationsTask.createProjectInvite('proj-1', 'dev@example.com');
      expect(result).toBeDefined();
      expect(mockProjectInvitationsApi.createProjectInvite).toHaveBeenCalledWith({
        projectId: 'proj-1',
        createProjectInviteRequest: { email: 'dev@example.com' },
      });
    });

    it('should create a project invite with optional params', async () => {
      const mockInvite = { id: 'inv-2', email: 'dev@example.com' };
      mockProjectInvitationsApi.createProjectInvite.mockResolvedValue(mockInvite as any);

      await usersInvitationsTask.createProjectInvite('proj-1', 'dev@example.com', {
        role: 'viewer',
      } as any);
      expect(mockProjectInvitationsApi.createProjectInvite).toHaveBeenCalledWith({
        projectId: 'proj-1',
        createProjectInviteRequest: { email: 'dev@example.com', role: 'viewer' },
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(usersInvitationsTask.createProjectInvite('', 'dev@example.com')).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when email is empty', async () => {
      await expect(usersInvitationsTask.createProjectInvite('proj-1', '')).rejects.toThrow(
        'Email is required',
      );
    });

    it('should handle API error', async () => {
      mockProjectInvitationsApi.createProjectInvite.mockRejectedValue(new Error('Conflict'));
      await expect(
        usersInvitationsTask.createProjectInvite('proj-1', 'dev@example.com'),
      ).rejects.toThrow('Conflict');
    });
  });

  describe('listProjectInvites', () => {
    it('should have listProjectInvites method defined', () => {
      expect(usersInvitationsTask.listProjectInvites).toBeDefined();
    });

    it('should list project invitations', async () => {
      const mockInvites = [{ id: 'inv-1', email: 'a@b.com' }];
      mockProjectInvitationsApi.listProjectInvites.mockResolvedValue(mockInvites as any);

      const result = await usersInvitationsTask.listProjectInvites('proj-1');
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(mockProjectInvitationsApi.listProjectInvites).toHaveBeenCalledWith({
        projectId: 'proj-1',
      });
    });

    it('should pass filters to the API', async () => {
      mockProjectInvitationsApi.listProjectInvites.mockResolvedValue([]);
      const filters = { email: 'specific@example.com' } as any;

      await usersInvitationsTask.listProjectInvites('proj-1', filters);
      expect(mockProjectInvitationsApi.listProjectInvites).toHaveBeenCalledWith({
        projectId: 'proj-1',
        email: 'specific@example.com',
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(usersInvitationsTask.listProjectInvites('')).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should handle API error', async () => {
      mockProjectInvitationsApi.listProjectInvites.mockRejectedValue(new Error('Server error'));
      await expect(usersInvitationsTask.listProjectInvites('proj-1')).rejects.toThrow(
        'Server error',
      );
    });
  });
});
