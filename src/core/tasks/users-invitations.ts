import { OrganizationInvitationsApi, ProjectInvitationsApi } from '../../api/index.js';
import {
  OrganizationInvitation,
  OrganizationPermissions,
  ProjectInvitation,
} from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { CreateProjectInvite, FilterListOrgInvites, ListProjectInvites } from '../model.js';
import { TaskBase } from './task_base.js';

export class UsersInvitationsTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private orgInvitationsApi: OrganizationInvitationsApi,
    private projectInvitationsApi: ProjectInvitationsApi,
  ) {
    super(client);
  }

  /**
   * Cancel an organization invitation.
   */
  async cancelOrgInvite(organizationId: string, invitationId: string): Promise<void> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkInviteId(invitationId);

    await this.orgInvitationsApi.cancelOrgInvite({ organizationId, invitationId });
  }

  /**
   * Create an organization invitation for a specified email address, with the specified permissions.
   * @param organizationId - The ID of the organization to create the invitation for.
   * @param email - The email address to send the invitation to.
   * @param permissions - The permissions to grant to the invitee. This should be an array of permissions that specify
   * what actions the invitee will be allowed to perform within the organization (e.g., "read", "write", "admin").
   * @param force - Whether to force the creation of the invitation even if an invitation already exists for the
   * specified email address. If true, a new invitation will be created and sent to the email address, replacing any
   * existing invitation. If false or not provided, an error will be thrown if an invitation already exists for the
   * email address.
   * @return The details of the created organization invitation.
   * @throws An error if the organization ID is invalid, if the email address is invalid, if permissions are not
   * provided, or if there is an issue with the API request.
   */
  async createOrgInvite(
    organizationId: string,
    email: string,
    permissions: OrganizationPermissions,
    force?: boolean,
  ): Promise<OrganizationInvitation> {
    TaskBase.checkOrganizationId(organizationId);
    TaskBase.checkEmail(email);

    if (permissions.length === 0) {
      throw new Error('Permissions are required');
    }

    return await this.orgInvitationsApi.createOrgInvite({
      organizationId,
      createOrgInviteRequest: { email, permissions, force },
    });
  }

  /**
   * List all pending invitations for an organization, with optional filtering.
   * @param organizationId - The ID of the organization to list invitations for.
   * @param filters - Optional filters to apply to the list of invitations, such as filtering by email address or
   * permissions.
   * @return A list of organization invitations that match the specified filters.
   * @throws An error if the organization ID is invalid, if the filters are invalid, or if there is an issue with the
   * API request.
   */
  async listOrgInvites(
    organizationId: string,
    filters?: FilterListOrgInvites,
  ): Promise<OrganizationInvitation[]> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.orgInvitationsApi.listOrgInvites({ organizationId, ...filters });
  }

  /**
   * Cancel a project invitation.
   * @param projectId - The ID of the project to cancel the invitation for.
   * @param invitationId - The ID of the invitation to cancel.
   * @return A promise that resolves when the invitation has been canceled.
   * @throws An error if the project ID or invitation ID is invalid, or if there is an issue with the API request.
   */
  async cancelProjectInvite(projectId: string, invitationId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkInviteId(invitationId);

    await this.projectInvitationsApi.cancelProjectInvite({ projectId, invitationId });
  }

  /**
   * Create a project invitation for a specified email address, with the specified role and permissions.
   * @param projectId - The ID of the project to create the invitation for.
   * @param email - The email address to send the invitation to.
   * @param params - The parameters for the project invitation, including the role to assign to the invitee and any
   * specific permissions to grant within the project.
   * @return The details of the created project invitation.
   * @throws An error if the project ID is invalid, if the email address is invalid, if the parameters are invalid, or
   * if there is an issue with the API request.
   */
  async createProjectInvite(
    projectId: string,
    email: string,
    params?: CreateProjectInvite,
  ): Promise<ProjectInvitation> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEmail(email);

    return await this.projectInvitationsApi.createProjectInvite({
      projectId,
      createProjectInviteRequest: { email, ...params },
    });
  }

  /**
   * List all pending invitations for a project, with optional filtering.
   * @param projectId - The ID of the project to list invitations for.
   * @param filters - Optional filters to apply to the list of invitations, such as filtering by email address or role.
   * @return A list of project invitations that match the specified filters.
   * @throws An error if the project ID is invalid, if the filters are invalid, or if there is an issue with the API
   * request.
   */
  async listProjectInvites(
    projectId: string,
    filters?: ListProjectInvites,
  ): Promise<ProjectInvitation[]> {
    TaskBase.checkProjectId(projectId);

    return await this.projectInvitationsApi.listProjectInvites({ projectId, ...filters });
  }
}
