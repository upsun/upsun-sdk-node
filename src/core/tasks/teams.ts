import {
  ListTeamMembersRequest,
  ListTeamMembersSortEnum,
  ListTeamsRequest,
  ListUserTeamsRequest,
  ListUserTeamsSortEnum,
  TeamsApi,
} from '../../api/TeamsApi.js';
import {
  DateTimeFilter,
  GrantProjectTeamAccessRequestInner,
  GrantTeamProjectAccessRequestInner,
  ListProjectTeamAccess200Response,
  ListProjectTeamAccessRequest,
  ListTeamMembers200Response,
  ListTeamProjectAccessRequest,
  ListTeams200Response,
  ListTeamsSortEnum,
  StringFilter,
  Team,
  TeamAccessApi,
  TeamMember,
  TeamProjectAccess,
  UpdateTeamRequest,
} from '../../index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export type FilterListTeamProjectAccess = Omit<ListTeamProjectAccessRequest, 'teamId'>;
export type FilterListProjectTeamAccess = Omit<ListProjectTeamAccessRequest, 'projectId'>;
export type FilterListUserTeams = Omit<ListUserTeamsRequest, 'userId'>;
export type FilterListTeamMembers = Omit<ListTeamMembersRequest, 'teamId'>;

export class TeamsTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private teamsApi: TeamsApi,
    private teamAccessApi: TeamAccessApi,
  ) {
    super(client);
  }

  async create(
    organizationId: string,
    label: string,
    projectPermissions?: string[],
  ): Promise<void> {
    TaskBase.checkOrganizationId(organizationId);

    if (!label) {
      throw new Error('Team name is required');
    }

    await this.teamsApi.createTeam({
      createTeamRequest: {
        organizationId: organizationId,
        label: label,
        projectPermissions: projectPermissions,
      },
    });
  }

  async delete(teamId: string): Promise<void> {
    TaskBase.checkTeamId(teamId);

    await this.teamsApi.deleteTeam({ teamId });
  }

  async get(teamId: string): Promise<Team> {
    TaskBase.checkTeamId(teamId);

    return await this.teamsApi.getTeam({ teamId });
  }

  async update(teamId: string, params?: UpdateTeamRequest): Promise<void> {
    TaskBase.checkTeamId(teamId);

    if (!params?.label && !params?.projectPermissions) {
      throw new Error('At least one of label or projectPermissions is required to update the team');
    }

    await this.teamsApi.updateTeam({
      teamId: teamId,
      updateTeamRequest: params,
    });
  }

  async list(filters: ListTeamsRequest): Promise<ListTeams200Response> {
    return await this.teamsApi.listTeams(filters);
  }

  /**
   * List all teams that a user is a member of, with optional filtering. This will return a list of teams that the specified
   */
  async listByMember(userId: string, filters?: FilterListUserTeams): Promise<ListTeams200Response> {
    TaskBase.checkUserId(userId);

    return await this.teamsApi.listUserTeams({ userId, ...filters });
  }

  async addMember(teamId: string, userId: string): Promise<TeamMember> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkUserId(userId);

    return await this.teamsApi.createTeamMember({
      teamId: teamId,
      createTeamMemberRequest: {
        userId: userId,
      },
    });
  }

  async deleteMember(teamId: string, userId: string): Promise<void> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkUserId(userId);

    await this.teamsApi.deleteTeamMember({
      teamId: teamId,
      userId: userId,
    });
  }

  async getMember(teamId: string, userId: string): Promise<TeamMember> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkUserId(userId);

    return await this.teamsApi.getTeamMember({
      teamId: teamId,
      userId: userId,
    });
  }

  async listMembers(
    teamId: string,
    filters: FilterListTeamMembers,
  ): Promise<ListTeamMembers200Response> {
    TaskBase.checkTeamId(teamId);

    return await this.teamsApi.listTeamMembers({ teamId, ...filters });
  }

  async getTeamProjectAccessByProject(
    projectId: string,
    teamId: string,
  ): Promise<TeamProjectAccess> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkTeamId(teamId);

    return await this.teamAccessApi.getProjectTeamAccess({
      teamId: teamId,
      projectId: projectId,
    });
  }

  async getTeamProjectAccessByTeam(teamId: string, projectId: string): Promise<TeamProjectAccess> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkProjectId(projectId);

    return await this.teamAccessApi.getTeamProjectAccess({
      teamId: teamId,
      projectId: projectId,
    });
  }

  async grantTeamProjectAccessToProject(
    projectId: string,
    access: GrantProjectTeamAccessRequestInner[],
  ): Promise<void> {
    TaskBase.checkProjectId(projectId);

    if (!access || access.length === 0) {
      throw new Error('At least one team ID is required to grant access');
    }

    await this.teamAccessApi.grantProjectTeamAccess({
      projectId: projectId,
      grantProjectTeamAccessRequestInner: access,
    });
  }

  async grantTeamProjectAccessToTeam(
    teamId: string,
    access: GrantTeamProjectAccessRequestInner[],
  ): Promise<void> {
    TaskBase.checkTeamId(teamId);

    if (!access || access.length === 0) {
      throw new Error('At least one project ID is required to grant access');
    }

    await this.teamAccessApi.grantTeamProjectAccess({
      teamId: teamId,
      grantTeamProjectAccessRequestInner: access,
    });
  }

  async listTeamProjectAccessByProject(
    projectId: string,
    filters: FilterListProjectTeamAccess,
  ): Promise<ListProjectTeamAccess200Response> {
    TaskBase.checkProjectId(projectId);

    return await this.teamAccessApi.listProjectTeamAccess({ projectId, ...filters });
  }

  async listTeamProjectAccessByTeam(
    teamId: string,
    filters: FilterListTeamProjectAccess,
  ): Promise<ListProjectTeamAccess200Response> {
    TaskBase.checkTeamId(teamId);

    return await this.teamAccessApi.listTeamProjectAccess({ teamId, ...filters });
  }

  async revokeTeamProjectAccessByProject(projectId: string, teamId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkTeamId(teamId);

    await this.teamAccessApi.removeProjectTeamAccess({
      projectId: projectId,
      teamId: teamId,
    });
  }

  async revokeTeamProjectAccessByTeam(teamId: string, projectId: string): Promise<void> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkProjectId(projectId);

    await this.teamAccessApi.removeTeamProjectAccess({
      teamId: teamId,
      projectId: projectId,
    });
  }
}
