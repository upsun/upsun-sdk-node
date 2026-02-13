import {
  ListOrgInvitesRequest,
  ListOrgMembersRequest,
  ListOrgOrdersRequest,
  ListOrgPlanRecordsRequest,
  ListOrgProjectsRequest,
  ListOrgsRequest,
  ListOrgUsageRecordsRequest,
  ListProjectInvitesRequest,
  ListProjectTeamAccessRequest,
  ListProjectUserAccessRequest,
  ListTeamMembersRequest,
  ListTeamProjectAccessRequest,
  ListUserExtendedAccessRequest,
  ListUserOrgsRequest,
  ListUserProjectAccessRequest,
  ListUserTeamsRequest,
} from '../api';
import {
  CertificateCreateInput,
  CreateOrgSubscriptionRequest,
  CreateProjectInviteRequest,
  EnvironmentVariableCreateInput,
  IntegrationCreateInput,
  ProjectVariableCreateInput,
} from '../model';

// Type creation for request parameters that omit required fields from the original input types
export type CertificateCreateParams = Omit<CertificateCreateInput, 'certificate' | 'key'>;
export type FilterListOrgInvites = Omit<ListOrgInvitesRequest, 'organizationId'>;
export type CreateProjectInvite = Omit<CreateProjectInviteRequest, 'email' | 'permissions'>;
export type ListProjectInvites = Omit<ListProjectInvitesRequest, 'projectId'>;

// used in OrganizationsTask and ProjectsTask
export type FilterListUser = Omit<ListUserOrgsRequest, 'userId'>;
export type FilterListMembers = Omit<ListOrgMembersRequest, 'organizationId'>;
export type FilterListOrders = Omit<ListOrgOrdersRequest, 'organizationId'>;
export type FilterListPlanRecords = Omit<ListOrgPlanRecordsRequest, 'organizationId'>;
export type FilterListUsageRecords = Omit<ListOrgUsageRecordsRequest, 'organizationId'>;
export type FilterListOrgs = Omit<ListOrgsRequest, never>;

// used in ProjectTasks
export type IntegrationCreateData = Omit<IntegrationCreateInput, 'type'>;
export type ProjectCreateRequest = Omit<CreateOrgSubscriptionRequest, 'projectRegion'>;
export type FilterListOrgProjects = Omit<ListOrgProjectsRequest, 'organizationId'>;

// used in TeamsTask
export type FilterListTeamProjectAccess = Omit<ListTeamProjectAccessRequest, 'teamId'>;
export type FilterListProjectTeamAccess = Omit<ListProjectTeamAccessRequest, 'projectId'>;
export type FilterListUserTeams = Omit<ListUserTeamsRequest, 'userId'>;
export type FilterListTeamMembers = Omit<ListTeamMembersRequest, 'teamId'>;

// used in VariablesTask
export type ProjectVariableCreateParams = Omit<ProjectVariableCreateInput, 'name' | 'value'>;
export type EnvironmentVariableCreateParams = Omit<
  EnvironmentVariableCreateInput,
  'name' | 'value'
>;

// used in ResourcesTask
export const DeploymentResourceGroup = {
  webapps: 'webapps',
  services: 'services',
  workers: 'workers',
} as const;

export type DeploymentResourceGroup =
  (typeof DeploymentResourceGroup)[keyof typeof DeploymentResourceGroup];

// used in UsersTasks
export type FilterListProjectUserAccess = Omit<ListProjectUserAccessRequest, 'projectId'>;
export type FilterListUserProjectAccess = Omit<ListUserProjectAccessRequest, 'userId'>;
export type FilterListUserExtendedAccess = Omit<ListUserExtendedAccessRequest, 'userId'>;
