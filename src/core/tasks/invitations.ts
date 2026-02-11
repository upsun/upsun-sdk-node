import { 
  ListOrgInvitesRequest,
  ListProjectInvitesRequest,
  OrganizationInvitationsApi,
  ProjectInvitationsApi,
} from '../../api/index.js';
import { CreateProjectInviteRequest, OrganizationInvitation, OrganizationPermissions, ProjectInvitation } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

// Type creation for request parameters that omit required fields from the original input types
export type FilterListOrgInvites = Omit<ListOrgInvitesRequest, 'organizationId'>;
export type CreateProjectInvite = Omit<CreateProjectInviteRequest, 'email' | 'permissions'>;
export type ListProjectInvites = Omit<ListProjectInvitesRequest, 'projectId'>;

export class InvitationsTask extends TaskBase {

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

    await this.orgInvitationsApi.cancelOrgInvite({organizationId, invitationId});
  }

  /**
   * Create an organization invitation for a specified email address, with the specified permissions.
   * If an invitation already exists for the specified email address, the behavior depends on the value of the `force`
   * parameter:
   * - If `force` is `true`, any existing invitation for the specified email address will be cancelled, 
   *   and a new invitation will be created.
   * - If `force` is `false` or not provided, the existing invitation will be left unchanged, and no new invitation will
   *   be created.
   * 
   * In either case, if an existing invitation is found for the specified email address, it will be returned in the 
   * response.
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
      createOrgInviteRequest: {email, permissions, force},
    });
  }

  /**
   * List all pending invitations for an organization, with optional filtering.
   */
  async listOrgInvites(organizationId: string, filters?: FilterListOrgInvites): Promise<OrganizationInvitation[]> {
    TaskBase.checkOrganizationId(organizationId);

    return await this.orgInvitationsApi.listOrgInvites({ organizationId, ...filters });
  }

  /**
   * Cancel a project invitation.
   */
  async cancelProjectInvite(projectId: string, invitationId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkInviteId(invitationId);

    await this.projectInvitationsApi.cancelProjectInvite({projectId, invitationId});
  }

  /**
   * Create a project invitation for a specified email address, with the specified role and permissions.
   */
  async createProjectInvite(
    projectId: string, 
    email: string,
    params: CreateProjectInvite,
  ): Promise<ProjectInvitation> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEmail(email);

    return await this.projectInvitationsApi.createProjectInvite({
      projectId, 
      createProjectInviteRequest: {email, ...params}
    });
  }

  /**
   * List all pending invitations for a project, with optional filtering.
   */
  async listProjectInvites(projectId: string, filters?: ListProjectInvites): Promise<ProjectInvitation[]> {
    TaskBase.checkProjectId(projectId);

    return await this.projectInvitationsApi.listProjectInvites({ projectId, ...filters });
  }
}
