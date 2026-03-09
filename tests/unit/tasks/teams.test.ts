import { TeamsTask } from '../../../src/core/tasks/teams.js';
import { UpsunClient } from '../../../src/upsun.js';
import { TeamsApi, TeamAccessApi } from '../../../src/api/index.js';

// Mock the UpsunClient and APIs
jest.mock('../../../src/upsun.js');
jest.mock('../../../src/api/index.js');

describe('TeamsTask', () => {
  let teamsTask: TeamsTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockTeamsApi: jest.Mocked<TeamsApi>;
  let mockTeamAccessApi: jest.Mocked<TeamAccessApi>;

  beforeEach(() => {
    mockTeamsApi = {
      createTeam: jest.fn(),
      deleteTeam: jest.fn(),
      getTeam: jest.fn(),
      updateTeam: jest.fn(),
      listTeams: jest.fn(),
      listUserTeams: jest.fn(),
      createTeamMember: jest.fn(),
      deleteTeamMember: jest.fn(),
      getTeamMember: jest.fn(),
      listTeamMembers: jest.fn(),
    } as any;

    mockTeamAccessApi = {
      getProjectTeamAccess: jest.fn(),
      getTeamProjectAccess: jest.fn(),
      grantProjectTeamAccess: jest.fn(),
      grantTeamProjectAccess: jest.fn(),
      listProjectTeamAccess: jest.fn(),
      listTeamProjectAccess: jest.fn(),
      removeProjectTeamAccess: jest.fn(),
      removeTeamProjectAccess: jest.fn(),
    } as any;

    (TeamsApi as jest.MockedClass<typeof TeamsApi>).mockImplementation(() => mockTeamsApi);
    (TeamAccessApi as jest.MockedClass<typeof TeamAccessApi>).mockImplementation(
      () => mockTeamAccessApi,
    );

    mockClient = {
      apiConfig: { basePath: 'https://api.upsun.com' },
    } as any;

    teamsTask = new TeamsTask(mockClient, mockTeamsApi, mockTeamAccessApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should have TeamTask instance defined', () => {
      expect(teamsTask).toBeDefined();
      expect(teamsTask).toBeInstanceOf(TeamsTask);
    });

    it('should inherit from TaskBase', () => {
      expect(teamsTask).toHaveProperty('client');
    });
  });

  describe('create', () => {
    it('should have create method defined', () => {
      expect(teamsTask.create).toBeDefined();
    });

    it('should create a team', async () => {
      mockTeamsApi.createTeam.mockResolvedValue(undefined);

      await teamsTask.create('org-1', 'My Team');
      expect(mockTeamsApi.createTeam).toHaveBeenCalledWith({
        createTeamRequest: {
          organizationId: 'org-1',
          label: 'My Team',
          projectPermissions: undefined,
        },
      });
    });

    it('should create a team with project permissions', async () => {
      mockTeamsApi.createTeam.mockResolvedValue(undefined);

      await teamsTask.create('org-1', 'Dev Team', ['proj-1', 'proj-2']);
      expect(mockTeamsApi.createTeam).toHaveBeenCalledWith({
        createTeamRequest: {
          organizationId: 'org-1',
          label: 'Dev Team',
          projectPermissions: ['proj-1', 'proj-2'],
        },
      });
    });

    it('should throw when organization ID is empty', async () => {
      await expect(teamsTask.create('', 'My Team')).rejects.toThrow('Organization ID is required');
    });

    it('should throw when label is empty', async () => {
      await expect(teamsTask.create('org-1', '')).rejects.toThrow('Team name is required');
    });

    it('should handle API error', async () => {
      mockTeamsApi.createTeam.mockRejectedValue(new Error('Bad request'));
      await expect(teamsTask.create('org-1', 'My Team')).rejects.toThrow('Bad request');
    });
  });

  describe('delete', () => {
    it('should have delete method defined', () => {
      expect(teamsTask.delete).toBeDefined();
    });

    it('should delete a team', async () => {
      mockTeamsApi.deleteTeam.mockResolvedValue(undefined);

      await teamsTask.delete('team-1');
      expect(mockTeamsApi.deleteTeam).toHaveBeenCalledWith({ teamId: 'team-1' });
    });

    it('should throw when team ID is empty', async () => {
      await expect(teamsTask.delete('')).rejects.toThrow('Team ID is required');
    });

    it('should handle API error', async () => {
      mockTeamsApi.deleteTeam.mockRejectedValue(new Error('Not found'));
      await expect(teamsTask.delete('team-1')).rejects.toThrow('Not found');
    });
  });

  describe('get', () => {
    it('should have get method defined', () => {
      expect(teamsTask.get).toBeDefined();
    });

    it('should get a team by ID', async () => {
      const mockTeam = { id: 'team-1', label: 'My Team' };
      mockTeamsApi.getTeam.mockResolvedValue(mockTeam as any);

      const result = await teamsTask.get('team-1');
      expect(result).toBeDefined();
      expect((result as any).id).toBe('team-1');
      expect(mockTeamsApi.getTeam).toHaveBeenCalledWith({ teamId: 'team-1' });
    });

    it('should throw when team ID is empty', async () => {
      await expect(teamsTask.get('')).rejects.toThrow('Team ID is required');
    });

    it('should handle API error', async () => {
      mockTeamsApi.getTeam.mockRejectedValue(new Error('Not found'));
      await expect(teamsTask.get('team-1')).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    it('should have update method defined', () => {
      expect(teamsTask.update).toBeDefined();
    });

    it('should update a team label', async () => {
      mockTeamsApi.updateTeam.mockResolvedValue(undefined);

      await teamsTask.update('team-1', { label: 'New Label' });
      expect(mockTeamsApi.updateTeam).toHaveBeenCalledWith({
        teamId: 'team-1',
        updateTeamRequest: { label: 'New Label' },
      });
    });

    it('should throw when team ID is empty', async () => {
      await expect(teamsTask.update('')).rejects.toThrow('Team ID is required');
    });

    it('should throw when neither label nor projectPermissions is provided', async () => {
      await expect(teamsTask.update('team-1', {})).rejects.toThrow(
        'At least one of label or projectPermissions is required to update the team',
      );
    });

    it('should handle API error', async () => {
      mockTeamsApi.updateTeam.mockRejectedValue(new Error('Update failed'));
      await expect(teamsTask.update('team-1', { label: 'X' })).rejects.toThrow('Update failed');
    });
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(teamsTask.list).toBeDefined();
    });

    it('should list teams', async () => {
      const mockResponse = { teams: [{ id: 'team-1', label: 'My Team' }], count: 1 };
      mockTeamsApi.listTeams.mockResolvedValue(mockResponse as any);

      const result = await teamsTask.list();
      expect(result).toBeDefined();
      expect(mockTeamsApi.listTeams).toHaveBeenCalledWith(undefined);
    });

    it('should pass filters to the API', async () => {
      const mockResponse = { teams: [], count: 0 };
      mockTeamsApi.listTeams.mockResolvedValue(mockResponse as any);

      const filters = { organizationId: 'org-1' } as any;
      await teamsTask.list(filters);
      expect(mockTeamsApi.listTeams).toHaveBeenCalledWith(filters);
    });
  });

  describe('listByMember', () => {
    it('should have listByMember method defined', () => {
      expect(teamsTask.listByMember).toBeDefined();
    });

    it('should list teams for a user', async () => {
      const mockResponse = { teams: [{ id: 'team-1' }], count: 1 };
      mockTeamsApi.listUserTeams.mockResolvedValue(mockResponse as any);

      const result = await teamsTask.listByMember('user-1');
      expect(result).toBeDefined();
      expect(mockTeamsApi.listUserTeams).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('should throw when user ID is empty', async () => {
      await expect(teamsTask.listByMember('')).rejects.toThrow('User ID is required');
    });
  });

  describe('addMember', () => {
    it('should have addMember method defined', () => {
      expect(teamsTask.addMember).toBeDefined();
    });

    it('should add a member to a team', async () => {
      const mockMember = { teamId: 'team-1', userId: 'user-1' };
      mockTeamsApi.createTeamMember.mockResolvedValue(mockMember as any);

      const result = await teamsTask.addMember('team-1', 'user-1');
      expect(result).toBeDefined();
      expect(mockTeamsApi.createTeamMember).toHaveBeenCalledWith({
        teamId: 'team-1',
        createTeamMemberRequest: { userId: 'user-1' },
      });
    });

    it('should throw when team ID is empty', async () => {
      await expect(teamsTask.addMember('', 'user-1')).rejects.toThrow('Team ID is required');
    });

    it('should throw when user ID is empty', async () => {
      await expect(teamsTask.addMember('team-1', '')).rejects.toThrow('User ID is required');
    });
  });

  describe('deleteMember', () => {
    it('should have deleteMember method defined', () => {
      expect(teamsTask.deleteMember).toBeDefined();
    });

    it('should delete a member from a team', async () => {
      mockTeamsApi.deleteTeamMember.mockResolvedValue(undefined);

      await teamsTask.deleteMember('team-1', 'user-1');
      expect(mockTeamsApi.deleteTeamMember).toHaveBeenCalledWith({
        teamId: 'team-1',
        userId: 'user-1',
      });
    });

    it('should throw when team ID is empty', async () => {
      await expect(teamsTask.deleteMember('', 'user-1')).rejects.toThrow('Team ID is required');
    });

    it('should throw when user ID is empty', async () => {
      await expect(teamsTask.deleteMember('team-1', '')).rejects.toThrow('User ID is required');
    });
  });

  describe('getMember', () => {
    it('should have getMember method defined', () => {
      expect(teamsTask.getMember).toBeDefined();
    });

    it('should get a team member', async () => {
      const mockMember = { teamId: 'team-1', userId: 'user-1' };
      mockTeamsApi.getTeamMember.mockResolvedValue(mockMember as any);

      const result = await teamsTask.getMember('team-1', 'user-1');
      expect(result).toBeDefined();
      expect(mockTeamsApi.getTeamMember).toHaveBeenCalledWith({
        teamId: 'team-1',
        userId: 'user-1',
      });
    });

    it('should throw when team ID is empty', async () => {
      await expect(teamsTask.getMember('', 'user-1')).rejects.toThrow('Team ID is required');
    });

    it('should throw when user ID is empty', async () => {
      await expect(teamsTask.getMember('team-1', '')).rejects.toThrow('User ID is required');
    });
  });

  describe('listMembers', () => {
    it('should have listMembers method defined', () => {
      expect(teamsTask.listMembers).toBeDefined();
    });

    it('should list team members', async () => {
      const mockResponse = { members: [{ userId: 'user-1' }], count: 1 };
      mockTeamsApi.listTeamMembers.mockResolvedValue(mockResponse as any);

      const result = await teamsTask.listMembers('team-1');
      expect(result).toBeDefined();
      expect(mockTeamsApi.listTeamMembers).toHaveBeenCalledWith({ teamId: 'team-1' });
    });

    it('should throw when team ID is empty', async () => {
      await expect(teamsTask.listMembers('')).rejects.toThrow('Team ID is required');
    });
  });

  describe('getTeamProjectAccessByProject', () => {
    it('should have getTeamProjectAccessByProject method defined', () => {
      expect(teamsTask.getTeamProjectAccessByProject).toBeDefined();
    });

    it('should get team project access by project', async () => {
      const mockAccess = { projectId: 'proj-1', teamId: 'team-1' };
      mockTeamAccessApi.getProjectTeamAccess.mockResolvedValue(mockAccess as any);

      const result = await teamsTask.getTeamProjectAccessByProject('proj-1', 'team-1');
      expect(result).toBeDefined();
      expect(mockTeamAccessApi.getProjectTeamAccess).toHaveBeenCalledWith({
        teamId: 'team-1',
        projectId: 'proj-1',
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(teamsTask.getTeamProjectAccessByProject('', 'team-1')).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when team ID is empty', async () => {
      await expect(teamsTask.getTeamProjectAccessByProject('proj-1', '')).rejects.toThrow(
        'Team ID is required',
      );
    });
  });

  describe('grantTeamProjectAccessToProject', () => {
    it('should have grantTeamProjectAccessToProject method defined', () => {
      expect(teamsTask.grantTeamProjectAccessToProject).toBeDefined();
    });

    it('should grant team access to a project', async () => {
      mockTeamAccessApi.grantProjectTeamAccess.mockResolvedValue(undefined);

      const access = [{ teamId: 'team-1', roles: ['viewer'] }] as any;
      await teamsTask.grantTeamProjectAccessToProject('proj-1', access);
      expect(mockTeamAccessApi.grantProjectTeamAccess).toHaveBeenCalledWith({
        projectId: 'proj-1',
        grantProjectTeamAccessRequestInner: access,
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(
        teamsTask.grantTeamProjectAccessToProject('', [{ teamId: 'team-1' } as any]),
      ).rejects.toThrow('Project ID is required');
    });

    it('should throw when access array is empty', async () => {
      await expect(teamsTask.grantTeamProjectAccessToProject('proj-1', [])).rejects.toThrow(
        'At least one team ID is required to grant access',
      );
    });
  });

  describe('getTeamProjectAccessByTeam', () => {
    it('should get team project access by team', async () => {
      const mockAccess = { projectId: 'proj-1', teamId: 'team-1' };
      mockTeamAccessApi.getTeamProjectAccess.mockResolvedValue(mockAccess as any);

      const result = await teamsTask.getTeamProjectAccessByTeam('team-1', 'proj-1');
      expect(result).toEqual(mockAccess);
      expect(mockTeamAccessApi.getTeamProjectAccess).toHaveBeenCalledWith({
        teamId: 'team-1',
        projectId: 'proj-1',
      });
    });

    it('should validate team and project IDs', async () => {
      await expect(teamsTask.getTeamProjectAccessByTeam('', 'proj-1')).rejects.toThrow(
        'Team ID is required',
      );
      await expect(teamsTask.getTeamProjectAccessByTeam('team-1', '')).rejects.toThrow(
        'Project ID is required',
      );
    });
  });

  describe('grantTeamProjectAccessToTeam', () => {
    it('should grant project access to team', async () => {
      mockTeamAccessApi.grantTeamProjectAccess.mockResolvedValue(undefined);

      const access = [{ projectId: 'proj-1', roles: ['viewer'] }] as any;
      await teamsTask.grantTeamProjectAccessToTeam('team-1', access);
      expect(mockTeamAccessApi.grantTeamProjectAccess).toHaveBeenCalledWith({
        teamId: 'team-1',
        grantTeamProjectAccessRequestInner: access,
      });
    });

    it('should validate team ID and access list', async () => {
      await expect(
        teamsTask.grantTeamProjectAccessToTeam('', [{ projectId: 'p' } as any]),
      ).rejects.toThrow('Team ID is required');
      await expect(teamsTask.grantTeamProjectAccessToTeam('team-1', [])).rejects.toThrow(
        'At least one project ID is required to grant access',
      );
    });
  });

  describe('listTeamProjectAccess methods', () => {
    it('should list team access by project', async () => {
      const response = { items: [] };
      mockTeamAccessApi.listProjectTeamAccess.mockResolvedValue(response as any);

      const result = await teamsTask.listTeamProjectAccessByProject('proj-1', { page: 1 } as any);
      expect(result).toEqual(response);
      expect(mockTeamAccessApi.listProjectTeamAccess).toHaveBeenCalledWith({
        projectId: 'proj-1',
        page: 1,
      });
    });

    it('should list project access by team', async () => {
      const response = { items: [] };
      mockTeamAccessApi.listTeamProjectAccess.mockResolvedValue(response as any);

      const result = await teamsTask.listTeamProjectAccessByTeam('team-1', { page: 2 } as any);
      expect(result).toEqual(response);
      expect(mockTeamAccessApi.listTeamProjectAccess).toHaveBeenCalledWith({
        teamId: 'team-1',
        page: 2,
      });
    });

    it('should validate IDs for list methods', async () => {
      await expect(teamsTask.listTeamProjectAccessByProject('', {} as any)).rejects.toThrow(
        'Project ID is required',
      );
      await expect(teamsTask.listTeamProjectAccessByTeam('', {} as any)).rejects.toThrow(
        'Team ID is required',
      );
    });
  });

  describe('revokeTeamProjectAccessByProject', () => {
    it('should have revokeTeamProjectAccessByProject method defined', () => {
      expect(teamsTask.revokeTeamProjectAccessByProject).toBeDefined();
    });

    it('should revoke team access from a project', async () => {
      mockTeamAccessApi.removeProjectTeamAccess.mockResolvedValue(undefined);

      await teamsTask.revokeTeamProjectAccessByProject('proj-1', 'team-1');
      expect(mockTeamAccessApi.removeProjectTeamAccess).toHaveBeenCalledWith({
        projectId: 'proj-1',
        teamId: 'team-1',
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(teamsTask.revokeTeamProjectAccessByProject('', 'team-1')).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('should throw when team ID is empty', async () => {
      await expect(teamsTask.revokeTeamProjectAccessByProject('proj-1', '')).rejects.toThrow(
        'Team ID is required',
      );
    });
  });

  describe('revokeTeamProjectAccessByTeam', () => {
    it('should revoke project access by team', async () => {
      mockTeamAccessApi.removeTeamProjectAccess.mockResolvedValue(undefined);

      await teamsTask.revokeTeamProjectAccessByTeam('team-1', 'proj-1');
      expect(mockTeamAccessApi.removeTeamProjectAccess).toHaveBeenCalledWith({
        teamId: 'team-1',
        projectId: 'proj-1',
      });
    });

    it('should validate team and project IDs', async () => {
      await expect(teamsTask.revokeTeamProjectAccessByTeam('', 'proj-1')).rejects.toThrow(
        'Team ID is required',
      );
      await expect(teamsTask.revokeTeamProjectAccessByTeam('team-1', '')).rejects.toThrow(
        'Project ID is required',
      );
    });
  });
});
