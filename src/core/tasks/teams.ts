import { ListTeamMembersRequest, ListTeamMembersSortEnum, ListTeamsRequest, ListUserTeamsRequest, ListUserTeamsSortEnum, TeamsApi } from '../../api/TeamsApi.js';
import { DateTimeFilter, ListProjectTeamAccess200Response, ListProjectTeamAccessRequest, ListTeamMembers200Response, ListTeamProjectAccessRequest, ListTeams200Response, ListTeamsSortEnum, StringFilter, Team, TeamAccessApi, TeamMember, TeamProjectAccess } from '../../index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class TeamsTask extends TaskBase {
  
  constructor(
    protected readonly client: UpsunClient,
    private teamsApi: TeamsApi,
    private teamAccessApi: TeamAccessApi,
  ) {
    super(client);
  }

  async create(organizationId: string, label: string, projectPermissions?: string[]): Promise<void> {
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

  async createMember(teamId: string, userId: string): Promise<TeamMember> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkUserId(userId);

    return await this.teamsApi.createTeamMember({
      teamId: teamId,
      createTeamMemberRequest: {
        userId: userId,
      },
    });
  }

  async delete(teamId: string): Promise<void> {
    TaskBase.checkTeamId(teamId);

    await this.teamsApi.deleteTeam({ teamId });
  }

  async deleteMember(teamId: string, userId: string): Promise<void> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkUserId(userId);

    await this.teamsApi.deleteTeamMember({
      teamId: teamId,
      userId: userId,
    });
  }

  async get(teamId: string): Promise<Team> {
    TaskBase.checkTeamId(teamId);

    return await this.teamsApi.getTeam({ teamId });
  }

  async getMember(teamId: string, userId: string): Promise<TeamMember> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkUserId(userId);

    return await this.teamsApi.getTeamMember({
      teamId: teamId,
      userId: userId,
    });
  }

  async list(
    params: ListTeamsRequest
  ): Promise<ListTeams200Response> {
    
    return await this.teamsApi.listTeams(params);
  }

  async listMembers(
    params: ListTeamMembersRequest
  ): Promise<ListTeamMembers200Response> {
    TaskBase.checkTeamId(params.teamId);

    return await this.teamsApi.listTeamMembers(params);
  }

  async listUserTeams(
    params: ListUserTeamsRequest
  ): Promise<ListTeams200Response> {
    TaskBase.checkUserId(params.userId);

    return await this.teamsApi.listUserTeams(params);
  }

  async update(teamId: string, label?: string, projectPermissions?: string[]): Promise<void> {
    TaskBase.checkTeamId(teamId);
    
    if (!label && !projectPermissions) {
      throw new Error('At least one of label or projectPermissions is required to update the team');
    }

    await this.teamsApi.updateTeam({
      teamId: teamId,
      updateTeamRequest: {
        label: label,
        projectPermissions: projectPermissions,
      },
    });
  }

  async getProjectTeamAccess(teamId: string, projectId: string): Promise<TeamProjectAccess> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkProjectId(projectId);

    return await this.teamAccessApi.getTeamProjectAccess({
      teamId: teamId,
      projectId: projectId,
    });
  }

  async getTeamProjectAccess(teamId: string, projectId: string): Promise<TeamProjectAccess> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkProjectId(projectId);

    return await this.teamAccessApi.getTeamProjectAccess({
      teamId: teamId,
      projectId: projectId,
    });
  }

  async grantProjectTeamAccess(projectId: string, teamIds: string[]): Promise<void> {
    TaskBase.checkProjectId(projectId);
    if(!teamIds || teamIds.length === 0) {
      throw new Error('At least one team ID is required to grant access');
    }

    await this.teamAccessApi.grantProjectTeamAccess({
      projectId: projectId,
      grantProjectTeamAccessRequestInner: teamIds.map(id => ({ teamId: id })),
    });
  }

  async grantTeamProjectAccess(teamId: string, projectIds: string[]): Promise<void> {
    TaskBase.checkTeamId(teamId);
    if(!projectIds || projectIds.length === 0) {
      throw new Error('At least one project ID is required to grant access');
    }

    await this.teamAccessApi.grantTeamProjectAccess({
      teamId: teamId,
      grantTeamProjectAccessRequestInner: projectIds.map(id => ({ projectId: id })),
    });
  }
    
  async listProjectTeamAccess(params: ListProjectTeamAccessRequest): Promise<ListProjectTeamAccess200Response> {
    TaskBase.checkProjectId(params.projectId);

    return await this.teamAccessApi.listProjectTeamAccess(params);
  }

  async listTeamProjectAccess(params: ListTeamProjectAccessRequest): Promise<ListProjectTeamAccess200Response> {
    TaskBase.checkTeamId(params.teamId);

    return await this.teamAccessApi.listTeamProjectAccess(params);
  }
  
  async revokeProjectTeamAccess(projectId: string, teamId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkTeamId(teamId);

    await this.teamAccessApi.removeProjectTeamAccess({
      projectId: projectId,
      teamId: teamId,
    });
  }

  async revokeTeamProjectAccess(teamId: string, projectId: string): Promise<void> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkProjectId(projectId);

    await this.teamAccessApi.removeTeamProjectAccess({
      teamId: teamId,
      projectId: projectId,
    });
  }
}
