import {
  ApiTokensApi,
  ConnectionsApi,
  GrantsApi,
  ListProjectUserAccessRequest,
  ListUserExtendedAccessRequest,
  MfaApi,
  PhoneNumberApi,
  UserAccessApi,
  UserProfilesApi,
  UsersApi,
} from '../../api/index.js';
import {
  Address,
  ApiToken,
  ConfirmTotpEnrollment200Response,
  Connection,
  GetAddress200Response,
  GetCurrentUserVerificationStatus200Response,
  GetCurrentUserVerificationStatusFull200Response,
  GetTotpEnrollment200Response,
  GrantProjectUserAccessRequestInner,
  GrantUserProjectAccessRequestInner,
  ListProfiles200Response,
  ListProjectUserAccess200Response,
  ListUserExtendedAccess200Response,
  Profile,
  UpdateProfileRequest,
  UpdateProjectUserAccessRequest,
  UpdateUserRequest,
  User as UserModel,
  UserProjectAccess,
  VerifyPhoneNumberRequestChannelEnum,
} from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

// Type creation for request parameters that omit required fields from the original input types
export type FilterListProjectUserAccess = Omit<ListProjectUserAccessRequest, 'projectId'>;
export type FilterListUserProjectAccess = Omit<ListProjectUserAccessRequest, 'userId'>;
export type FilterListUserExtendedAccess = Omit<ListUserExtendedAccessRequest, 'userId'>;

export class UsersTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private readonly usersApi: UsersApi,
    private readonly userProfilesApi: UserProfilesApi,
    private readonly userAccessApi: UserAccessApi,
    private readonly apiTokensApi: ApiTokensApi,
    private readonly connectionsApi: ConnectionsApi,
    private readonly grantsApi: GrantsApi,
    private readonly mfaApi: MfaApi,
    private readonly phoneNumberApi: PhoneNumberApi,
  ) {
    super(client);
  }

  /**
   * Retrieves information about the currently authenticated user.
   */
  async me(): Promise<UserModel> {
    return await this.usersApi.getCurrentUser();
  }

  /**
   * Note that user creation is not supported through the API, and this method will throw an error if called.
   * Use `upsun.invitations.createOrgInvite()` to invite users to your organization instead,
   * or `upsun.invitations.createProjectInvite()` to invite users to specific projects.
   * Inviting users to your organization or projects will send them an email invitation,
   * which will allow them to create their own accounts and join your organization with the appropriate permissions.
   */
  async create(): Promise<never> {
    throw new Error(
      'User creation is not supported through the API, invite users to your organization or project instead.',
    );
  }

  /**
   * Adds users to a project with specified permissions.
   * This method allows you to grant access to a project for one or more users, specifying their access levels
   * and permissions within the project.
   * @param projectId - The ID of the project to grant access to. This should be a valid project ID that exists within
   * the system.
   * @param userPermissions - An array of user permission details specifying the user IDs and access levels to grant for
   * the project. Each item in the array should include a user ID and the access level to grant for that user.
   * @throws An error if the project ID is invalid, if the user permissions array is empty, or if there is an issue with
   * the API request to grant access.
   */
  async addToProject(
    projectId: string,
    userPermissions: GrantProjectUserAccessRequestInner[],
  ): Promise<void> {
    TaskBase.checkProjectId(projectId);

    if (!userPermissions || userPermissions.length === 0) {
      throw new Error('At least one user permission is required to add a user to a project');
    }

    return await this.userAccessApi.grantProjectUserAccess({
      projectId,
      grantProjectUserAccessRequestInner: userPermissions,
    });
  }

  /**
   * Removes a user's access to a project.
   * Note that this does not delete the user from the system, but simply revokes their access to the specified project.
   * @param userId - The ID of the user to remove from the project. This should be a valid user ID that exists within
   * the system.
   * @param projectId - The ID of the project to remove the user from. This should be a valid project ID that exists
   * within the system.
   * @throws An error if the user ID or project ID is invalid, or if there is an issue with the API request to remove
   * the user's access.
   */
  async removeFromProject(userId: string, projectId: string): Promise<void> {
    TaskBase.checkUserId(userId);
    TaskBase.checkProjectId(projectId);

    return await this.userAccessApi.removeProjectUserAccess({ projectId, userId });
  }

  /**
   * Retrieves information about a specific user by their ID.
   * @param userId - The ID of the user to retrieve information for. This should be a valid user ID that exists within
   * the system.
   * @return The details of the user with the specified ID, including their username, email address, full name, and
   * other relevant information.
   * @throws An error if the user ID is invalid or if there is an issue with the API request to retrieve the user's
   * information.
   */
  async get(userId: string): Promise<UserModel> {
    TaskBase.checkUserId(userId);

    return await this.usersApi.getUser({ userId });
  }

  /**
   * Lists all users who have access to a specific project, along with their access levels and permissions.
   * This method is useful for project administrators to manage and review user access to their projects.
   * @param projectId - The ID of the project to list user access for. This should be a valid project ID that exists
   * within the system.
   * @return A list of users who have access to the specified project, along with their access levels and permissions.
   * Each entry in the list provides details about a user's access to the project.
   * @throws An error if the project ID is invalid or if there is an issue with the API request to list user access for
   * the project.
   */
  async listProjectUserAccesses(projectId: string): Promise<ListProjectUserAccess200Response> {
    TaskBase.checkProjectId(projectId);

    return await this.userAccessApi.listProjectUserAccess({ projectId });
  }

  /**
   * Updates a user's information, such as their username, first name, last name, picture, company, website, or country.
   * @param userId - The ID of the user to update. This should be a valid user ID that exists within the system.
   * @param params - The parameters to update for the user, which may include their username, first name, last name,
   * picture, company, website, or country.
   * @return Nothing if the update is successful. If the user with the specified ID is not found, or if there is an
   * issue with the API request to update the user's information.
   * @throws An error if the user ID is invalid, if the parameters are invalid, or if there is an issue with the API
   * request to update the user's information.
   */
  async update(userId: string, params: UpdateUserRequest): Promise<void> {
    TaskBase.checkUserId(userId);

    await this.usersApi.updateUser({
      userId,
      updateUserRequest: params,
    });
  }

  /**
   * Retrieves the verification status of the currently authenticated user.
   * @returns The verification status of the currently authenticated user, which may include information about whether
   * the user has completed any required verification steps, such as email verification or multi-factor authentication
   * setup, and whether there are any pending verification actions that the user needs to complete.
   * @throws An error if there is an issue with the API request to retrieve the user's verification status.
   */
  async getCurrentUserVerificationStatus(): Promise<GetCurrentUserVerificationStatus200Response> {
    return await this.usersApi.getCurrentUserVerificationStatus();
  }

  /**
   * Retrieves the full verification status of the currently authenticated user, including detailed information about
   * the verification process, pending actions, and any relevant metadata.
   * @returns The full verification status of the currently authenticated user, which may include detailed information
   * about the verification process, pending actions, and any relevant metadata.
   * @throws An error if there is an issue with the API request to retrieve the user's full verification status.
   */
  async getCurrentUserVerificationStatusFull(): Promise<GetCurrentUserVerificationStatusFull200Response> {
    return await this.usersApi.getCurrentUserVerificationStatusFull();
  }

  /**
   * Retrieves a user's information by their email address.
   */
  async getByEmailAddress(email: string): Promise<UserModel> {
    TaskBase.checkEmail(email);

    return await this.usersApi.getUserByEmailAddress({ email });
  }

  /**
   * Retrieves a user's information by their username.
   * @param username - The username of the user to retrieve information for. This should be a valid username that exists
   * within the system.
   * @return The details of the user with the specified username, including their user ID, email address, full name, and
   * other relevant information.
   * @throws An error if the username is invalid or if there is an issue with the API request to retrieve the user's
   * information.
   */
  async getByUsername(username: string): Promise<UserModel> {
    TaskBase.checkUsername(username);

    return await this.usersApi.getUserByUsername({ username });
  }

  /**
   * Resets a user's email address. This method can be used to update the email address associated with a user's
   * account, which may be necessary if the user has changed their email or if there are issues with the current email
   * address on file.
   * If no new email address is provided, the user's email will be reset to an empty string, effectively removing the
   * email address from their account.
   * @param userId - The ID of the user to reset the email address for. This should be a valid user ID that exists
   * within the system.
   * @param email - (Optional) The new email address to associate with the user's account. If not provided, the user's
   * email will be reset to an empty string, effectively removing the email address from their account.
   * @return Nothing if the email reset is successful. If the user with the specified ID is not found, or if there is an
   * issue with the API request to reset the user's email address.
   * @throws An error if the user ID is invalid, if the email address is invalid, or if there is an issue with the API
   * request to reset the user's email address.
   */
  async resetEmailAddress(userId: string, email?: string): Promise<void> {
    TaskBase.checkUserId(userId);

    if (email) {
      TaskBase.checkEmail(email);
    }

    await this.usersApi.resetEmailAddress({
      userId,
      resetEmailAddressRequest: { emailAddress: email || '' },
    });
  }

  /**
   * Resets a user's password. This method can be used to initiate a password reset process for a user, which typically
   * involves sending a password reset email to the user's registered email address with instructions on how to create
   * a new password.
   * @param userId - The ID of the user to reset the password for. This should be a valid user ID that exists within the
   * system.
   * @return Nothing if the password reset process is successfully initiated. If the user with the specified ID is not
   * found, or if there is an issue with the API request to initiate the password reset process.
   * @throws An error if the user ID is invalid or if there is an issue with the API request to initiate the password
   * reset process.
   */
  async resetPassword(userId: string): Promise<void> {
    TaskBase.checkUserId(userId);

    await this.usersApi.resetPassword({ userId });
  }

  /**
   * Retrieves a project's access level and permissions for a specific user. This method is useful for checking what
   * level of access a user has to a project, which can help with managing permissions and ensuring that users have the
   * appropriate access to perform their tasks within the project.
   * @param projectId - The ID of the project to check access for. This should be a valid project ID that exists within
   * the system.
   * @param userId - The ID of the user to check access for. This should be a valid user ID that exists within the
   * system.
   * @return The access level and permissions that the specified user has for the specified project. This may include
   * details about the user's role within the project, specific permissions granted, and any restrictions on their
   * access.
   * @throws An error if the project ID or user ID is invalid, or if there is an issue with the API request to retrieve
   * the user's access information for the project.
   */
  async getUserProjectAccessByProject(
    projectId: string,
    userId: string,
  ): Promise<UserProjectAccess> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkUserId(userId);

    return await this.userAccessApi.getProjectUserAccess({
      projectId,
      userId,
    });
  }

  /**
   * Retrieves a user's access level and permissions for a specific project. This method is useful for checking what
   * level of access a user has to a project, which can help with managing permissions and ensuring that users have the
   * appropriate access to perform their tasks within the project.
   * @param userId - The ID of the user to check access for. This should be a valid user ID that exists within the
   * system.
   * @param projectId - The ID of the project to check access for. This should be a valid project ID that exists within
   * the system.
   * @return The access level and permissions that the specified user has for the specified project. This may include
   * details about the user's role within the project, specific permissions granted, and any restrictions on their
   * access.
   * @throws An error if the user ID or project ID is invalid, or if there is an issue with the API request to retrieve
   * the user's access information for the project.
   */
  async getUserProjectAccessByUser(userId: string, projectId: string): Promise<UserProjectAccess> {
    TaskBase.checkUserId(userId);
    TaskBase.checkProjectId(projectId);

    return await this.userAccessApi.getUserProjectAccess({
      projectId,
      userId,
    });
  }

  /**
   * Retrieves a list of all projects that a user has access to, along with their access levels and permissions for each
   * project.
   * @param projectId - The ID of the project to grant access for.
   * @param access - An array of access details specifying the user IDs and access levels to grant for the user. Each
   * item in the array should include a user ID and the access level to grant for that project.
   * @throws An error if the project ID is invalid, if the access level is invalid, or if there is an issue with the API
   * request to list the user's project access information.
   */
  async grantUserProjectAccessByProject(
    projectId: string,
    access: GrantProjectUserAccessRequestInner[],
  ): Promise<void> {
    TaskBase.checkProjectId(projectId);

    if (!access || access.length === 0) {
      throw new Error('At least one user ID is required to grant access');
    }

    await this.userAccessApi.grantProjectUserAccess({
      projectId,
      grantProjectUserAccessRequestInner: access,
    });
  }

  /**
   * Grants a user access to a project with specified permissions. This method allows you to add a user to a project and
   * define their access levels and permissions within that project. By granting a user access to a project, you enable
   * them to collaborate and contribute to the project according to the permissions you have set.
   * @param userId - The ID of the user to grant access to. This should be a valid user ID that exists within the
   * system.
   * @param access - An array of access details specifying the project IDs and access levels to grant for the user. Each
   * item in the array should include a project ID and the access level to grant for that project.
   * @throws An error if the user ID is invalid, if the access level is invalid, or if there is an issue with the API
   * request to grant the user access to the project.
   */
  async grantUserProjectAccessByUser(
    userId: string,
    access: GrantUserProjectAccessRequestInner[],
  ): Promise<void> {
    TaskBase.checkUserId(userId);

    if (!access || access.length === 0) {
      throw new Error('At least one project ID is required to grant access');
    }

    await this.userAccessApi.grantUserProjectAccess({
      userId,
      grantUserProjectAccessRequestInner: access,
    });
  }

  /**
   * Lists all users who have access to a specific project, along with their access levels and permissions.
   * @param projectId - The ID of the project to list user access for.
   * @param filters - Optional filters to apply to the list of user access, such as filtering by user ID or access
   * level.
   * @return A list of users who have access to the specified project, along with their access levels and permissions.
   * Each entry in the list provides details about a user's access to the project.
   * @throws An error if the project ID is invalid or if there is an issue with the API request to list user access for
   * the project.
   */
  async listUserProjectAccessByProject(
    projectId: string,
    filters?: FilterListProjectUserAccess,
  ): Promise<ListProjectUserAccess200Response> {
    TaskBase.checkProjectId(projectId);

    return await this.userAccessApi.listProjectUserAccess({
      projectId,
      ...filters,
    });
  }

  /**
   * Retrieves a list of all projects that a user has access to, along with their access levels and permissions for each
   * project.
   * @param userId - The ID of the user to list project access for. This should be a valid user ID that exists within
   * the system.
   * @param filters - Optional filters to apply to the list of project access, such as filtering by project ID or access
   * level.
   * @return A list of all projects that the specified user has access to, along with their access levels and
   * permissions for each project.
   * @throws An error if the user ID is invalid or if there is an issue with the API request to list the user's project
   * access information.
   */
  async listUserProjectAccessByUser(
    userId: string,
    filters?: FilterListProjectUserAccess,
  ): Promise<ListProjectUserAccess200Response> {
    TaskBase.checkUserId(userId);

    return await this.userAccessApi.listUserProjectAccess({
      userId,
      ...filters,
    });
  }

  /**
   * Retrieves a list of all projects that a user has access to, along with their access levels and permissions for each
   * project. This method provides an extended view of the user's access, which may include additional details about the
   * projects and the user's permissions within those projects, making it easier to manage and review user access across
   * multiple projects.
   * @param userId - The ID of the user to list extended project access for. This should be a valid user ID that exists
   * within the system.
   * @param filters - Optional filters to apply to the list of extended project access, such as filtering by project ID
   * or access level.
   * @return A list of all projects that the specified user has access to, along with their access levels and
   * permissions for each project.
   * @throws An error if the user ID is invalid or if there is an issue with the API request to list the user's extended
   * project access information.
   */
  async listExtendedUserProjectAccess(
    userId: string,
    filters?: FilterListUserExtendedAccess,
  ): Promise<ListUserExtendedAccess200Response> {
    TaskBase.checkUserId(userId);

    return await this.grantsApi.listUserExtendedAccess({ userId, ...filters });
  }

  /**
   * Revokes a user's access to a project. This method revokes the user's permissions for the specified project,
   * effectively preventing them from accessing or collaborating on the project. Note that this does not delete the user
   * from the system, but simply removes their access to the specified project.
   * @param projectId - The ID of the project to revoke access from. This should be a valid project ID that exists
   * within the system.
   * @param userId - The ID of the user to revoke access for. This should be a valid user ID that exists within the
   * system.
   * @throws An error if the project ID or user ID is invalid, or if there is an issue with the API request to revoke
   * the user's project access.
   */
  async revokeUserProjectAccessByProject(projectId: string, userId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkUserId(userId);

    await this.userAccessApi.removeProjectUserAccess({ projectId, userId });
  }

  /**
   * Revokes a user's access to a project. This method revokes the user's permissions for the specified project,
   * effectively preventing them from accessing or collaborating on the project. Note that this does not delete the user
   * from the system, but simply removes their access to the specified project.
   * @param userId - The ID of the user to revoke access for. This should be a valid user ID that exists within the
   * system.
   * @param projectId - The ID of the project to revoke access from. This should be a valid project ID that exists
   * within the system.
   * @throws An error if the user ID or project ID is invalid, or if there is an issue with the API request to revoke
   * the user's project access.
   */
  async revokeUserProjectAccessByUser(userId: string, projectId: string): Promise<void> {
    TaskBase.checkUserId(userId);
    TaskBase.checkProjectId(projectId);

    await this.userAccessApi.removeUserProjectAccess({ projectId, userId });
  }

  /**
   * Updates a user's access level and permissions for a specific project. This method allows you to modify the access
   * permissions of a user for a project, which can be useful for managing user roles and ensuring that users have the
   * appropriate level of access to perform their tasks within the project. By updating a user's project access, you can
   * grant them additional permissions or restrict their access as needed.
   * @param projectId - The ID of the project to update access for. This should be a valid project ID that exists within
   * the system.
   * @param userId - The ID of the user to update access for. This should be a valid user ID that exists within the
   * system.
   * @param access - The updated access details specifying the access levels and permissions to set for the user. This
   * should include the new access level to grant for the user within the specified project.
   * @throws An error if the project ID or user ID is invalid, if the access level is invalid, or if there is an issue
   * with the API request to update the user's project access.
   */
  async updateUserProjectAccessByProject(
    projectId: string,
    userId: string,
    access: UpdateProjectUserAccessRequest,
  ): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkUserId(userId);

    if (!access || !access.permissions) {
      throw new Error('At least one access level is required to update user access');
    }

    await this.userAccessApi.updateProjectUserAccess({
      projectId: projectId,
      userId: userId,
      updateProjectUserAccessRequest: access,
    });
  }

  /**
   * Updates a user's access level and permissions for a specific project. This method allows you to modify the access
   * permissions of a user for a project, which can be useful for managing user roles and ensuring that users have the
   * appropriate level of access to perform their tasks within the project. By updating a user's project access, you can
   * grant them additional permissions or restrict their access as needed.
   * @param userId - The ID of the user to update access for. This should be a valid user ID that exists within the
   * system.
   * @param projectId - The ID of the project to update access for. This should be a valid project ID that exists within
   * the system.
   * @param access - The updated access details specifying the access levels and permissions to set for the user. This
   * should include the new access level to grant for the user within the specified project.
   * @throws An error if the user ID or project ID is invalid, if the access level is invalid, or if there is an issue
   * with the API request to update the user's project access.
   */
  async updateUserProjectAccessByUser(
    userId: string,
    projectId: string,
    access: UpdateProjectUserAccessRequest,
  ): Promise<void> {
    TaskBase.checkUserId(userId);
    TaskBase.checkProjectId(projectId);

    if (!access || !access.permissions) {
      throw new Error('At least one access level is required to update user access');
    }

    await this.userAccessApi.updateUserProjectAccess({
      projectId: projectId,
      userId: userId,
      updateProjectUserAccessRequest: access,
    });
  }

  /**
   * Deletes a user's profile picture. This method removes the profile picture associated with the user's account,
   * which may be useful for privacy reasons or if the user wants to update their profile picture.
   * @param uuid - The UUID of the user whose profile picture is to be deleted. This should be a valid user UUID that
   * exists within the system.
   * @throws An error if the user UUID is invalid or if there is an issue with the API request to delete the user's
   * profile picture.
   */
  async deleteProfilePicture(uuid: string): Promise<void> {
    TaskBase.checkUserId(uuid);

    await this.userProfilesApi.deleteProfilePicture({ uuid });
  }

  /**
   * Retrieves a user's address information. This method can be used to get the address details associated with a user's
   * profile, which may include fields such as street address, city, state, postal code, and country.
   * @param userId - The ID of the user to retrieve address information for. This should be a valid user ID that exists
   * within the system.
   * @return The address information associated with the specified user's profile, which may include fields such as
   * street address, city, state, postal code, and country.
   * @throws An error if the user ID is invalid or if there is an issue with the API request to retrieve the user's
   * address.
   */
  async getAddress(userId: string): Promise<GetAddress200Response> {
    TaskBase.checkUserId(userId);

    return await this.userProfilesApi.getAddress({ userId });
  }

  /**
   * Retrieves a user's profile information. This method can be used to get the details of a user's profile.
   * @param userId - The ID of the user to retrieve profile information for. This should be a valid user ID that exists
   * within the system.
   * @return The profile information associated with the specified user, which may include details such as their
   * username, full name, email address, profile picture URL, company, website, country, and other relevant information.
   * @throws An error if the user ID is invalid or if there is an issue with the API request to retrieve the user's
   * profile.
   */
  async getProfile(userId: string): Promise<Profile> {
    TaskBase.checkUserId(userId);

    return await this.userProfilesApi.getProfile({ userId });
  }

  /**
   * Lists all user profiles. This method retrieves a list of all user profiles in the system.
   * @return A list of all user profiles, which may include details such as usernames, full names, email addresses,
   * profile pictures, companies, websites, countries, and other relevant information.
   * @throws An error if there is an issue with the API request to list user profiles.
   */
  async listProfiles(): Promise<ListProfiles200Response> {
    return await this.userProfilesApi.listProfiles();
  }

  /**
   * Updates a user's address information. This method allows you to modify the address details associated with a user's
   * profile, which may include fields such as street address, city, state, postal code, and country. By updating a user's
   * address information, you can ensure that their profile is accurate and up-to-date.
   * @param userId - The ID of the user to update address information for. This should be a valid user ID that exists
   * within the system.
   * @param address - The updated address information to set for the user's profile, which may include fields such as
   * street address, city, state, postal code, and country.
   * @return Nothing if the address update is successful. If the user with the specified ID is not found, or if there is
   * an error with the API request, an error will be thrown.
   */
  async updateAddress(userId: string, address?: Address): Promise<void> {
    TaskBase.checkUserId(userId);

    await this.userProfilesApi.updateAddress({
      userId,
      address,
    });
  }

  /**
   * Updates a user's profile information. This method allows you to modify the details of a user's profile.
   * @param userId - The ID of the user to update profile information for. This should be a valid user ID that exists
   * within the system.
   * @param profile - The updated profile information to set for the user, which may include details such as their
   * username, full name, email address, profile picture URL, company, website, country, and other relevant information.
   * @throws An error if the user ID is invalid, if the profile information is invalid, or if there is an issue with the
   * API request.
   */
  async updateProfile(userId: string, profile?: UpdateProfileRequest): Promise<void> {
    TaskBase.checkUserId(userId);

    await this.userProfilesApi.updateProfile({
      userId,
      updateProfileRequest: profile,
    });
  }

  /**
   * Creates a new API token for a user. This method allows you to generate an API token that can be used for
   * authentication.
   * @param userId - The ID of the user to create an API token for. This should be a valid user ID that exists within
   * the system.
   * @param name - The name to associate with the API token. This should be a descriptive name that helps identify the
   * purpose of the token, such as "My APIToken" or "Token for CI/CD". Providing a name for the API token can help with
   * managing and organizing tokens, especially if multiple tokens are created for the same user.
   */
  async createApiToken(userId: string, name: string): Promise<void> {
    TaskBase.checkUserId(userId);

    if (!name) {
      throw new Error('API token name is required');
    }

    await this.apiTokensApi.createApiToken({
      userId: userId,
      createApiTokenRequest: {
        name: name,
      },
    });
  }

  /**
   * Deletes an API token for a user. This method allows you to revoke an API token, which can be useful for security
   * reasons or if the token is no longer needed.
   * @param userId - The ID of the user to delete the API token for. This should be a valid user ID that exists within
   * the system.
   * @param tokenId - The ID of the API token to delete. This should be a valid API token ID that exists for the
   * specified user.
   * @throws An error if the user ID or token ID is invalid, or if there is an issue with the API request to delete the
   * API token.
   */
  async deleteApiToken(userId: string, tokenId: string): Promise<void> {
    TaskBase.checkUserId(userId);
    TaskBase.checkApiTokenId(tokenId);

    await this.apiTokensApi.deleteApiToken({
      userId: userId,
      tokenId: tokenId,
    });
  }

  /**
   * Retrieves a specific API token for a user. This method allows you to get the details of an API token.
   * @param userId - The ID of the user to retrieve the API token for. This should be a valid user ID that exists within
   * the system.
   * @param tokenId - The ID of the API token to retrieve. This should be a valid API token ID that exists for the
   * specified user.
   * @return The details of the specified API token, which may include information such as the token's name, creation
   * date, and other relevant metadata.
   * @throws An error if the user ID or token ID is invalid, or if there is an issue with the API request to retrieve
   * the API token.
   */
  async getApiToken(userId: string, tokenId: string): Promise<ApiToken> {
    TaskBase.checkUserId(userId);
    TaskBase.checkApiTokenId(tokenId);

    return await this.apiTokensApi.getApiToken({
      userId: userId,
      tokenId: tokenId,
    });
  }

  /**
   * Lists all API tokens for a user. This method retrieves a list of all API tokens associated with a user's account,
   * which can be useful for managing and reviewing the tokens that have been created.
   * @param userId - The ID of the user to list API tokens for. This should be a valid user ID that exists within the
   * system.
   * @return A list of all API tokens associated with the specified user's account, which may include details such as
   * the token's name, creation date, and other relevant metadata.
   * @throws An error if the user ID is invalid or if there is an issue with the API request to list the user's API
   * tokens.
   */
  async listApiTokens(userId: string): Promise<ApiToken[]> {
    TaskBase.checkUserId(userId);

    return await this.apiTokensApi.listApiTokens({ userId });
  }

  /**
   * Deletes a user's login connection for a specific provider. This method allows you to revoke a user's authentication
   * connection for a particular login provider (e.g., Google, GitHub, etc.), which can be useful for security reasons or if
   * the user wants to disconnect their account from that provider.
   * @param provider - The name of the login provider to delete the connection for. This should be a valid provider name
   * that exists within the system, such as "google", "github", etc.
   * @param userId - The ID of the user to delete the login connection for. This should be a valid user ID that exists
   * within the system.
   * @throws An error if the provider name or user ID is invalid, or if there is an issue with the API request to delete
   * the login connection.
   */
  async deleteLoginConnection(provider: string, userId: string): Promise<void> {
    TaskBase.checkUserId(userId);

    if (!provider) {
      throw new Error('Login provider is required');
    }

    await this.connectionsApi.deleteLoginConnection({
      userId,
      provider,
    });
  }

  /**
   * Retrieves a user's login connection for a specific provider. This method allows you to get the details of a user's
   * authentication connection for a particular login provider (e.g., Google, GitHub, etc.), which can be useful for
   * managing and reviewing the connected accounts for a user.
   * @param provider - The name of the login provider to retrieve the connection for. This should be a valid provider
   * name that exists within the system, such as "google", "github", etc.
   * @param userId - The ID of the user to retrieve the login connection for. This should be a valid user ID that exists
   * within the system.
   * @return The details of the user's login connection for the specified provider, which may include information such
   * as the provider name, connection status, and other relevant metadata.
   * @throws An error if the provider name or user ID is invalid, or if there is an issue with the API request to
   * retrieve the login connection.
   */
  async getLoginConnection(provider: string, userId: string): Promise<Connection> {
    TaskBase.checkUserId(userId);

    if (!provider) {
      throw new Error('Login provider is required');
    }

    return await this.connectionsApi.getLoginConnection({
      userId,
      provider,
    });
  }

  /**
   * Confirms a user's TOTP enrollment by verifying the provided TOTP secret and pass code. This method is used to
   * complete the TOTP enrollment process for a user, ensuring that they have successfully set up their TOTP
   * authentication method. By confirming the TOTP enrollment, the user can then use TOTP for
   * two-factor authentication when logging in.
   * @param userId - The ID of the user to confirm TOTP enrollment for. This should be a valid user ID that exists
   * within the system.
   * @param secret - The TOTP secret that was generated during the TOTP enrollment process. This should be a valid TOTP
   * secret that was provided to the user when they initiated the TOTP enrollment.
   * @param passCode - The TOTP pass code generated by the user's TOTP authenticator app using the provided secret. This
   * should be a valid TOTP pass code that corresponds to the TOTP secret and is generated within the allowed time
   * window.
   * @return The result of the TOTP enrollment confirmation, which may include information about the success of the
   * confirmation and any relevant metadata. If the TOTP enrollment is successfully confirmed, the user will be able to
   * use TOTP for two-factor authentication when logging in. If the confirmation fails, an error will be thrown with
   * details about the failure reason, such as an invalid secret, incorrect pass code, or other issues with the TOTP
   * enrollment confirmation process.
   * @throws An error if the user ID is invalid, if the TOTP secret or pass code is invalid, or if there is an issue
   * with the API request to confirm the TOTP enrollment.
   */
  async confirmTotpEnrollment(
    userId: string,
    secret: string,
    passCode: string,
  ): Promise<ConfirmTotpEnrollment200Response> {
    TaskBase.checkUserId(userId);

    if (!secret) {
      throw new Error('TOTP secret is required');
    }

    if (!passCode) {
      throw new Error('TOTP pass code is required');
    }

    return await this.mfaApi.confirmTotpEnrollment({
      userId,
      confirmTotpEnrollmentRequest: {
        secret,
        passcode: passCode,
      },
    });
  }

  /**
   * Retrieves a user's TOTP enrollment information. This method allows you to get the details of a user's TOTP
   * enrollment.
   * @param userId - The ID of the user to retrieve TOTP enrollment information for. This should be a valid user ID that
   * exists within the system.
   * @return The TOTP enrollment information associated with the specified user, which may include details such as the
   * TOTP enrollment status, the TOTP secret (if applicable), and any relevant metadata about the user's TOTP
   * enrollment.
   * @throws An error if the user ID is invalid or if there is an issue with the API request to retrieve the user's TOTP
   * enrollment information.
   */
  async getTotpEnrollment(userId: string): Promise<GetTotpEnrollment200Response> {
    TaskBase.checkUserId(userId);

    return await this.mfaApi.getTotpEnrollment({ userId });
  }

  /**
   * Withdraws a user's TOTP enrollment. This method allows you to revoke a user's TOTP enrollment.
   * @param userId - The ID of the user to withdraw TOTP enrollment for. This should be a valid user ID that exists
   * within the system.
   * @throws An error if the user ID is invalid or if there is an issue with the API request to withdraw the user's TOTP
   * enrollment.
   */
  async withdrawTotpEnrollment(userId: string): Promise<void> {
    TaskBase.checkUserId(userId);

    await this.mfaApi.withdrawTotpEnrollment({ userId });
  }

  /**
   * Recreates a user's MFA recovery codes. This method allows you to generate a new set of MFA recovery codes for a
   * user, which can be useful if the user has lost their original recovery codes or if they want to invalidate their
   * existing codes for security reasons.
   * @param userId - The ID of the user to recreate MFA recovery codes for. This should be a valid user ID that exists
   * within the system.
   * @throws An error if the user ID is invalid or if there is an issue with the API request to recreate the user's MFA
   * recovery codes.
   */
  async recreateMfaRecoveryCodes(userId: string): Promise<void> {
    TaskBase.checkUserId(userId);

    await this.mfaApi.recreateRecoveryCodes({ userId });
  }

  /**
   * Confirms a user's phone number by verifying the provided SID and confirmation code.
   * @param sid - The SID of the phone number verification request. This should be a valid SID that was generated when
   * the verification request was initiated.
   * @param userId - The ID of the user to confirm the phone number for. This should be a valid user ID that exists
   * within the system.
   * @param code - The confirmation code sent to the user's phone number. This should be a valid confirmation code that
   * was sent to the user's phone number as part of the verification process. The user should provide this code to
   * confirm the phone number.
   * @throws An error if the SID, user ID, or confirmation code is invalid, or if there is an issue with the API request
   * to confirm the phone number.
   */
  async confirmPhoneNumber(sid: string, userId: string, code: string): Promise<void> {
    TaskBase.checkUserId(userId);

    if (!sid) {
      throw new Error('Phone number SID is required');
    }

    if (!code) {
      throw new Error('Confirmation code is required');
    }

    await this.phoneNumberApi.confirmPhoneNumber({
      sid,
      userId,
      confirmPhoneNumberRequest: { code },
    });
  }

  /**
   * Sends a verification code to a user's phone number via the specified channel (e.g., SMS, voice call)
   * for phone number verification.
   * @param userId - The ID of the user to verify the phone number for. This should be a valid user ID that exists
   * within the system.
   * @param channel - The channel through which to send the verification code. This should be a valid channel option,
   * such as SMS or voice call.
   * @param phoneNumber - The phone number to send the verification code to. This should be a valid phone number in the
   * format expected by the system, which may include country code and other relevant formatting requirements.
   * @throws An error if the user ID, channel, or phone number is invalid, or if there is an issue with the API request
   * to send the verification code for phone number verification.
   */
  async verifyPhoneNumber(
    userId: string,
    channel: VerifyPhoneNumberRequestChannelEnum,
    phoneNumber: string,
  ): Promise<void> {
    TaskBase.checkUserId(userId);

    if (!channel) {
      throw new Error('Verification channel is required');
    }

    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    await this.phoneNumberApi.verifyPhoneNumber({
      userId,
      verifyPhoneNumberRequest: {
        channel,
        phoneNumber,
      },
    });
  }
}
