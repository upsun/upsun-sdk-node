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
  UsersApi 
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
  ListProfiles200Response, 
  ListProjectUserAccess200Response, 
  ListUserExtendedAccess200Response, 
  Profile, 
  UpdateProfileRequest, 
  UpdateProjectUserAccessRequest, 
  UpdateUserRequest, 
  User as UserModel, 
  UserProjectAccess,
  VerifyPhoneNumberRequestChannelEnum
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
   * Adds a user to a project with specified permissions. 
   * This method allows you to grant access to a project for one or more users, specifying their access levels 
   * and permissions within the project. 
   */
  async add(
    projectId: string, 
    userPermission: Array<GrantProjectUserAccessRequestInner>
  ): Promise<void> { 
    TaskBase.checkProjectId(projectId);

    return await this.userAccessApi.grantProjectUserAccess({
      projectId,
      grantProjectUserAccessRequestInner: userPermission,
    });
  }

  /**
   * Removes a user's access to a project. 
   * Note that this does not delete the user from the system, but simply revokes their access to the specified project.
   */
  async delete(userId: string, projectId: string): Promise<void> {
    TaskBase.checkUserId(userId);
    TaskBase.checkProjectId(projectId);

    return await this.userAccessApi.removeProjectUserAccess({ projectId, userId });
  }

  /**
   * Retrieves information about a specific user by their ID.
   */
  async get(userId: string): Promise<UserModel> {
    TaskBase.checkUserId(userId);

    return await this.usersApi.getUser({ userId });
  }
  /**
   * Lists all users who have access to a specific project, along with their access levels and permissions.
   * This method is useful for project administrators to manage and review user access to their projects.
   */
  async list(projectId: string): Promise<ListProjectUserAccess200Response> {
    TaskBase.checkProjectId(projectId);

    return await this.userAccessApi.listProjectUserAccess({ projectId });
  }

  /**
   * Updates a user's information, such as their username, first name, last name, picture, company, website, or country.
   */
  async update(userId: string, params: UpdateUserRequest): Promise<void> {
    TaskBase.checkUserId(userId);

    await this.usersApi.updateUser({
      userId: userId,
      updateUserRequest: params,
    });
  }

  /**
   * Retrieves the verification status of the currently authenticated user. 
   */
  async getCurrentUserVerificationStatus(): Promise<GetCurrentUserVerificationStatus200Response> {
    return await this.usersApi.getCurrentUserVerificationStatus();
  }

  /**
   * Retrieves the full verification status of the currently authenticated user, including detailed information about 
   * the verification process, pending actions, and any relevant metadata.
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
   */
  async getByUsername(username: string): Promise<UserModel> {
    return await this.usersApi.getUserByUsername({ username });
  }

  /**
   * Resets a user's email address. This method can be used to update the email address associated with a user's 
   * account, which may be necessary if the user has changed their email or if there are issues with the current email 
   * address on file. 
   * If no new email address is provided, the user's email will be reset to an empty string, effectively removing the 
   * email address from their account.
   */
  async resetEmailAddress(userId: string, email?: string): Promise<void> {
    TaskBase.checkUserId(userId);
    if(email) {
      TaskBase.checkEmail(email);
    }

    await this.usersApi.resetEmailAddress({
      userId,
      resetEmailAddressRequest: {emailAddress: email || ''},
    });
  }

  /**
   * Resets a user's password. This method can be used to initiate a password reset process for a user, which typically
   * involves sending a password reset email to the user's registered email address with instructions on how to create 
   * a new password.
   */
  async resetPassword(userId: string): Promise<void> {
    TaskBase.checkUserId(userId);

    await this.usersApi.resetPassword({userId});
  }

  /**
   * Retrieves a user's access level and permissions for a specific project. This method is useful for checking what 
   * level of access a user has to a project, which can help with managing permissions and ensuring that users have the 
   * appropriate access to perform their tasks within the project.
   */
  async getProjectUserAccess(projectId: string, userId: string): Promise<UserProjectAccess> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkUserId(userId);

    return await this.userAccessApi.getProjectUserAccess({
      projectId: projectId,
       userId: userId,
    });
  }

  /**
   * Retrieves a user's access level and permissions for a specific project. This method is useful for checking what 
   * level of access a user has to a project, which can help with managing permissions and ensuring that users have the 
   * appropriate access to perform their tasks within the project.
   */
  async getUserProjectAccess(userId: string, projectId: string): Promise<UserProjectAccess> {
    TaskBase.checkUserId(userId);
    TaskBase.checkProjectId(projectId);

    return await this.userAccessApi.getProjectUserAccess({
      projectId: projectId,
       userId: userId,
    });
  }

  /**
   * Retrieves a list of all projects that a user has access to, along with their access levels and permissions for each 
   * project.
   */
  async grantProjectUserAccess(projectId: string, access: Array<GrantProjectUserAccessRequestInner>): Promise<void> {
    TaskBase.checkProjectId(projectId);

    if(!access || access.length === 0) {
      throw new Error('At least one user ID is required to grant access');
    }

    await this.userAccessApi.grantProjectUserAccess({
      projectId: projectId,
      grantProjectUserAccessRequestInner: access,
    });
  }

  /**
   * Grants a user access to a project with specified permissions. This method allows you to add a user to a project and
   * define their access levels and permissions within that project. By granting a user access to a project, you enable 
   * them to collaborate and contribute to the project according to the permissions you have set.
   */
  async grantUserProjectAccess(userId: string, access: Array<GrantProjectUserAccessRequestInner>): Promise<void> {
    TaskBase.checkUserId(userId);
    
    if(!access || access.length === 0) {
      throw new Error('At least one project ID is required to grant access');
    }

    await this.userAccessApi.grantProjectUserAccess({
      projectId: userId,
      grantProjectUserAccessRequestInner: access,
    });
  }

  /**
   * Lists all users who have access to a specific project, along with their access levels and permissions.
   */
  async listProjectUserAccess(projectId: string, filters?: FilterListProjectUserAccess): Promise<ListProjectUserAccess200Response> {
    TaskBase.checkProjectId(projectId);

    return await this.userAccessApi.listProjectUserAccess({
      projectId,
      ...filters,
    });
  }

  /**
   * Retrieves a list of all projects that a user has access to, along with their access levels and permissions for each 
   * project.
   */
  async listUserProjectAccess(userId: string, filters?: FilterListProjectUserAccess): Promise<ListProjectUserAccess200Response> {
    TaskBase.checkUserId(userId);

    return await this.userAccessApi.listUserProjectAccess({
      userId,
      ...filters,
    });
  }

  /**
   * Revokes a user's access to a project. This method revokes the user's permissions for the specified project, 
   * effectively preventing them from accessing or collaborating on the project. Note that this does not delete the user
   * from the system, but simply removes their access to the specified project.
   */
  async revokeProjectUserAccess(projectId: string, userId: string): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkUserId(userId);

    await this.userAccessApi.removeProjectUserAccess({ projectId, userId });
  }

  /**
   * Revokes a user's access to a project. This method revokes the user's permissions for the specified project, 
   * effectively preventing them from accessing or collaborating on the project. Note that this does not delete the user
   * from the system, but simply removes their access to the specified project.
   */
  async revokeUserProjectAccess(userId: string, projectId: string): Promise<void> {
    TaskBase.checkUserId(userId);
    TaskBase.checkProjectId(projectId);

    await this.userAccessApi.removeProjectUserAccess({ projectId, userId });
  }

  /**
   * Updates a user's access level and permissions for a specific project. This method allows you to modify the access
   * permissions of a user for a project, which can be useful for managing user roles and ensuring that users have the 
   * appropriate level of access to perform their tasks within the project. By updating a user's project access, you can 
   * grant them additional permissions or restrict their access as needed.
   */
  async updateProjectUserAccess(projectId: string, userId: string, access: UpdateProjectUserAccessRequest): Promise<void> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkUserId(userId);
    
    if(!access || !access.permissions ) {
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
   */
  async updateUserProjectAccess(userId: string, projectId: string, access: UpdateProjectUserAccessRequest): Promise<void> {
    TaskBase.checkUserId(userId);
    TaskBase.checkProjectId(projectId);
    
    if(!access || !access.permissions ) {
      throw new Error('At least one access level is required to update user access');
    }

    await this.userAccessApi.updateProjectUserAccess({
      projectId: projectId,
      userId: userId,
      updateProjectUserAccessRequest: access,
    });
  }

  /**
   * Deletes a user's profile picture. This method removes the profile picture associated with the user's account, 
   * which may be useful for privacy reasons or if the user wants to update their profile picture.
   */
  async deleteProfilePicture(uuid: string): Promise<void> {
    TaskBase.checkUserId(uuid);

    await this.userProfilesApi.deleteProfilePicture({ uuid });
  }

  /**
   * Retrieves a user's address information. This method can be used to get the address details associated with a user's
   * profile, which may include fields such as street address, city, state, postal code, and country. 
   */
  async getAddress(userId: string): Promise<GetAddress200Response> {
    TaskBase.checkUserId(userId);

    return await this.userProfilesApi.getAddress({ userId });
  }

  /**
   * Retrieves a user's profile information. This method can be used to get the details of a user's profile.
   */
  async getProfile(userId: string): Promise<Profile> {
    TaskBase.checkUserId(userId);

    return await this.userProfilesApi.getProfile({ userId });
  }

  /**
   * Lists all user profiles. This method retrieves a list of all user profiles in the system.
   */
  async listProfiles(): Promise<ListProfiles200Response> {
    return await this.userProfilesApi.listProfiles();
  }

  /**
   * Updates a user's address information. This method allows you to modify the address details associated with a user's
   * profile, which may include fields such as street address, city, state, postal code, and country. By updating a user's 
   * address information, you can ensure that their profile is accurate and up-to-date.
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
   */
  async listApiTokens(userId: string): Promise<Array<ApiToken>> {
    TaskBase.checkUserId(userId);

    return await this.apiTokensApi.listApiTokens({ userId });
  }

  /**
   * Deletes a user's login connection for a specific provider. This method allows you to revoke a user's authentication
   * connection for a particular login provider (e.g., Google, GitHub, etc.), which can be useful for security reasons or if
   * the user wants to disconnect their account from that provider.
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
   * Lists all login connections for a user. This method retrieves a list of all authentication connections associated 
   * with a user's account, which can be useful for managing and reviewing the connected accounts for a user.
   */
  async listExtendedAccess(
    userId: string, 
    filters?: FilterListUserExtendedAccess
  ): Promise<ListUserExtendedAccess200Response> {
    TaskBase.checkUserId(userId);

    return await this.grantsApi.listUserExtendedAccess({ userId, ...filters });
  }

  /**
   * Confirms a user's TOTP enrollment by verifying the provided TOTP secret and pass code. This method is used to
   * complete the TOTP enrollment process for a user, ensuring that they have successfully set up their TOTP 
   * authentication method. By confirming the TOTP enrollment, the user can then use TOTP for 
   * two-factor authentication when logging in.
   */
  async confirmTotpEnrollment(
    userId: string, 
    secret: string, 
    passCode: string
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
   */
  async getTotpEnrollment(userId: string): Promise<GetTotpEnrollment200Response> {
    TaskBase.checkUserId(userId);
    
    return await this.mfaApi.getTotpEnrollment({ userId });
  }

  /**
   * Recreates a user's TOTP recovery codes. This method allows you to generate new TOTP recovery codes for a user.
   */
  async recreateRecoveryCodes(userId: string): Promise<void> {
    TaskBase.checkUserId(userId);

    await this.mfaApi.recreateRecoveryCodes({ userId });
  }

  /**
   * Withdraws a user's TOTP enrollment. This method allows you to revoke a user's TOTP enrollment.
   */
  async withdrawTotpEnrollment(userId: string): Promise<void> {
    TaskBase.checkUserId(userId);

    await this.mfaApi.withdrawTotpEnrollment({ userId });
  }

  /**
   * Confirms a user's phone number by verifying the provided SID and confirmation code. 
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
      confirmPhoneNumberRequest: {code},
    });
  }

  /**
   * Sends a verification code to a user's phone number via the specified channel (e.g., SMS, voice call) 
   * for phone number verification.
   */
  async verifyPhoneNumber(
    userId: string, 
    channel: VerifyPhoneNumberRequestChannelEnum, 
    phoneNumber: string
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