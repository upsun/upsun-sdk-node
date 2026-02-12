import {
  ListTeamMembersRequest,
  ListTeamsRequest,
  ListUserTeamsRequest,
  TeamsApi,
} from '../../api/TeamsApi.js';
import {
  GrantProjectTeamAccessRequestInner,
  GrantTeamProjectAccessRequestInner,
  ListProjectTeamAccess200Response,
  ListTeamMembers200Response,
  ListTeams200Response,
  Team,
  TeamAccessApi,
  TeamMember,
  TeamProjectAccess,
  UpdateTeamRequest,
} from '../../index.js';
import { UpsunClient } from '../../upsun.js';
import {
  FilterListProjectTeamAccess,
  FilterListTeamMembers,
  FilterListTeamProjectAccess,
  FilterListUserTeams,
} from '../model.js';
import { TaskBase } from './task_base.js';

export class TeamsTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private teamsApi: TeamsApi,
    private teamAccessApi: TeamAccessApi,
  ) {
    super(client);
  }

  /**
   * Create a new team within an organization. This method allows you to create a new team by providing the organization
   * ID, team name (label), and optionally a list of project permissions for the team. The team will be created within
   * the specified organization and can be used to manage access to projects and resources within that organization.
   * @param organizationId - The ID of the organization to create the team in. This should be a valid organization ID
   * that the current user has permission to manage.
   * @param label - The name of the team to create. This should be a non-empty string that uniquely identifies the team
   * within the specified organization.
   * @param projectPermissions - (Optional) An array of project IDs that the team should have access to. This can be
   * used to specify the projects that the team will have permissions for.
   * @return Nothing if the team is created successfully. If there is an issue with the provided parameters or if the
   * API request to create the team fails, an error will be thrown.
   * @throws An error if the organization ID is invalid, if the team name is not provided, or if there is an issue with
   * the API request to create the team.
   */
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

  /**
   * Delete a team by its ID. This method allows you to delete a specific team by providing the team ID.
   * @param teamId - The ID of the team to delete. This should be a valid team ID that exists within the system.
   * @throws An error if the team ID is invalid or if there is an issue with the API request to delete the team.
   */
  async delete(teamId: string): Promise<void> {
    TaskBase.checkTeamId(teamId);

    await this.teamsApi.deleteTeam({ teamId });
  }

  /**
   * Get a team by its ID. This method allows you to retrieve the details of a specific team by providing the team ID.
   * @param teamId - The ID of the team to retrieve. This should be a valid team ID that exists within the system.
   * @returns The team details if found.
   * @throws An error if the team ID is invalid or if there is an issue with the API request to get the team.
   */
  async get(teamId: string): Promise<Team> {
    TaskBase.checkTeamId(teamId);

    return await this.teamsApi.getTeam({ teamId });
  }

  /**
   * Update a team by its ID. This method allows you to update the details of a specific team by providing the team ID
   * and the parameters to update.
   * @param teamId - The ID of the team to update. This should be a valid team ID that exists within the system.
   * @param params - The parameters to update for the team. This can include the team name (label) and/or the list of
   * project permissions for the team. At least one of these parameters must be provided to perform an update.
   * @throws An error if the team ID is invalid, if neither label nor projectPermissions is provided, or if there is an
   * issue with the API request to update the team.
   */
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

  /**
   * List teams with optional filtering. This method allows you to retrieve a list of teams based on various filter
   * criteria.
   * @param filters - The filter criteria to apply when listing teams.
   * @return A list of teams that match the specified filter criteria. If no teams are found, an empty array is
   * returned.
   * @throws An error if there is an issue with the API request to list the teams.
   */
  async list(filters: ListTeamsRequest): Promise<ListTeams200Response> {
    return await this.teamsApi.listTeams(filters);
  }

  /**
   * List all teams that a user is a member of, with optional filtering. This will return a list of teams that the
   * specified user is a member of, based on the provided filter criteria.
   * @param userId - The ID of the user to list teams for. This should be a valid user ID that exists within the system.
   * @param filters - The filter criteria to apply when listing the user's teams.
   * @return A list of teams that the specified user is a member of and that match the provided filter criteria.
   * If the user is not a member of any teams or if no teams match the filter criteria, an empty array is returned.
   * @throws An error if the user ID is invalid or if there is an issue with the API request to list the user's teams.
   */
  async listByMember(userId: string, filters?: FilterListUserTeams): Promise<ListTeams200Response> {
    TaskBase.checkUserId(userId);

    return await this.teamsApi.listUserTeams({ userId, ...filters });
  }

  /**
   * Add a member to a team. This method allows you to add a user as a member of a specific team by providing the team
   * ID and the user ID.
   * @param teamId - The ID of the team to add the member to. This should be a valid team ID that exists within the
   * system.
   * @param userId - The ID of the user to add as a member. This should be a valid user ID that exists within the
   * system.
   * @return The details of the newly added team member, including the team ID, user ID, and other relevant information.
   * If the team or user ID is invalid, or if there is an issue with the API request to add the member, an error will be
   * thrown.
   * @throws An error if the team ID or user ID is invalid, or if there is an issue with the API request to add the
   * member.
   */
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

  /**
   * Delete a member from a team. This method allows you to remove a user from being a member of a specific team by
   * providing the team ID and the user ID.
   * @param teamId - The ID of the team to remove the member from. This should be a valid team ID that exists within the
   * system.
   * @param userId - The ID of the user to remove as a member. This should be a valid user ID that exists within the
   * system.
   * @throws An error if the team ID or user ID is invalid, or if there is an issue with the API request to delete the
   * member. If the specified user is not a member of the specified team, an error will also be thrown.
   */
  async deleteMember(teamId: string, userId: string): Promise<void> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkUserId(userId);

    await this.teamsApi.deleteTeamMember({
      teamId: teamId,
      userId: userId,
    });
  }

  /**
   * Get a team member by team ID and user ID. This method allows you to retrieve the details of a specific team member
   * by providing the team ID and the user ID. The method returns the details of the team member.
   * @param teamId - The ID of the team to retrieve the member from. This should be a valid team ID that exists within
   * the system.
   * @param userId - The ID of the user to retrieve as a member. This should be a valid user ID that exists within the
   * system.
   * @return The details of the team member, including the team ID, user ID, and other relevant information.
   * @throws An error if the team ID or user ID is invalid, or if there is an issue with the API request to get the team
   * member. If the specified user is not a member of the specified team, an error will also be thrown.
   */
  async getMember(teamId: string, userId: string): Promise<TeamMember> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkUserId(userId);

    return await this.teamsApi.getTeamMember({
      teamId: teamId,
      userId: userId,
    });
  }

  /**
   * List members of a team with optional filtering. This method allows you to retrieve a list of members for a specific
   * team by providing the team ID and optional filter criteria.
   * @param teamId - The ID of the team to list members for. This should be a valid team ID that exists within the
   * system.
   * @param filters - The filter criteria to apply when listing team members.
   * @return A list of team members that match the specified filter criteria for the given team ID. If no members are
   * found, an empty list will be returned.
   * @throws An error if the team ID is invalid or if there is an issue with the API request to list the team members.
   * If the specified team does not exist, an error will also be thrown.
   */
  async listMembers(
    teamId: string,
    filters: FilterListTeamMembers,
  ): Promise<ListTeamMembers200Response> {
    TaskBase.checkTeamId(teamId);

    return await this.teamsApi.listTeamMembers({ teamId, ...filters });
  }

  /**
   * Get the project access details for a team to a project ID.
   * @param projectId - The ID of the project to get the team access details for. This should be a valid project ID that
   * exists within the system.
   * @param teamId - The ID of the team to get the access details for. This should be a valid team ID that exists within
   * the system.
   * @return The team project access details, including the team ID, project ID, and access level. If the specified team
   * does not have access to the specified project, an error will be thrown.
   * @throws An error if the project ID or team ID is invalid, or if there is an issue with the API request to get the
   * team project access details. If the specified team does not have access to the specified project, an error will
   * also be thrown.
   */
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

  /**
   * Get the project access details for a team to a project ID.
   * @param teamId - The ID of the team to get the access details for. This should be a valid team ID that exists within
   * the system.
   * @param projectId - The ID of the project to get the team access details for. This should be a valid project ID that
   * exists within the system.
   * @return The team project access details, including the team ID, project ID, and access level. If the specified team
   * does not have access to the specified project, an error will be thrown.
   * @throws An error if the team ID or project ID is invalid, or if there is an issue with the API request to get the
   * team project access details. If the specified team does not have access to the specified project, an error will
   * also be thrown.
   */
  async getTeamProjectAccessByTeam(teamId: string, projectId: string): Promise<TeamProjectAccess> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkProjectId(projectId);

    return await this.teamAccessApi.getTeamProjectAccess({
      teamId: teamId,
      projectId: projectId,
    });
  }

  /**
   * Grant a team access to a project. These methods allow you to grant access for a
   * team to a project by providing the respective IDs and access details.
   * @param projectId - The ID of the project to grant access to. This should be a valid project ID that exists within
   * the system.
   * @param access - An array of access details specifying the team IDs and access levels to grant for the project.
   * Each item in the array should include a team ID and the access level to grant for that team.
   * @throws An error if the project ID is invalid, if the access array is empty or contains invalid entries, or if
   * there is an issue with the API request to grant access.
   */
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

  /**
   * Grant a team access to a project for a team. These methods allow you to grant access for a
   * team to a project by providing the respective IDs and access details.
   * @param teamId - The ID of the team to grant access to. This should be a valid team ID that exists within the system.
   * @param access - An array of access details specifying the project IDs and access levels to grant for the team. Each
   * item in the array should include a project ID and the access level to grant for that project.
   * @throws An error if the team ID is invalid, if the access array is empty or contains invalid entries, or if there
   * is an issue with the API request to grant access.
   */
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

  /**
   * List the team access details for a project or a team. These methods allow you to retrieve a list of team access
   * details for a specific project or team by providing the respective IDs and optional filter criteria.
   * @param projectId - The ID of the project to list team access details for. This should be a valid project ID that
   * exists within the system.
   * @param filters - The filter criteria to apply when listing team access details for the project.
   * @return A list of team access details for the specified project that match the provided filter criteria. If no team
   * access details are found, an empty list will be returned.
   * @throws An error if the project ID is invalid or if there is an issue with the API request to list team access
   * details.
   */
  async listTeamProjectAccessByProject(
    projectId: string,
    filters: FilterListProjectTeamAccess,
  ): Promise<ListProjectTeamAccess200Response> {
    TaskBase.checkProjectId(projectId);

    return await this.teamAccessApi.listProjectTeamAccess({ projectId, ...filters });
  }

  /**
   * List the team access details for a project or a team. These methods allow you to retrieve a list of team access
   * details for a specific project or team by providing the respective IDs and optional filter criteria.
   * @param teamId - The ID of the team to list project access details for. This should be a valid team ID that exists
   * within the system.
   * @param filters - The filter criteria to apply when listing project access details for the team.
   * @return A list of team access details for the specified team that match the provided filter criteria. If no team
   * access details are found, an empty list will be returned.
   * @throws An error if the team ID is invalid or if there is an issue with the API request to list project access
   * details.
   */
  async listTeamProjectAccessByTeam(
    teamId: string,
    filters: FilterListTeamProjectAccess,
  ): Promise<ListProjectTeamAccess200Response> {
    TaskBase.checkTeamId(teamId);

    return await this.teamAccessApi.listTeamProjectAccess({ teamId, ...filters });
  }

  /**
   * Revoke a team's access to a project. These methods allow you to revoke access for a team to a project by providing
   * the respective IDs.
   * @param projectId - The ID of the project to revoke access from. This should be a valid project ID that exists
   * within the system.
   * @param teamId - The ID of the team to revoke access for. This should be a valid team ID that exists within the
   * system.
   * @throws An error if the project ID or team ID is invalid, or if there is an issue with the API request to revoke
   * access.
   */
  async revokeTeamProjectAccessByProject(projectId: string, teamId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkTeamId(teamId);

    await this.teamAccessApi.removeProjectTeamAccess({
      projectId: projectId,
      teamId: teamId,
    });
  }

  /**
   * Revoke a team's access to a project. These methods allow you to revoke access for a team to a project by providing
   * the respective IDs.
   * @param teamId - The ID of the team to revoke access for. This should be a valid team ID that exists within the
   * system.
   * @param projectId - The ID of the project to revoke access from. This should be a valid project ID that exists
   * within the system.
   * @throws An error if the team ID or project ID is invalid, or if there is an issue with the API request to revoke
   * access.
   */
  async revokeTeamProjectAccessByTeam(teamId: string, projectId: string): Promise<void> {
    TaskBase.checkTeamId(teamId);
    TaskBase.checkProjectId(projectId);

    await this.teamAccessApi.removeTeamProjectAccess({
      teamId: teamId,
      projectId: projectId,
    });
  }
}
