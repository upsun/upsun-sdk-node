import {
  BlackfirePhpServerCachesRequest,
  BlackfireProfilesListRequest,
  BlackfireProfilesRecommendationsRequest,
  BlackfireServerGlobalRequest,
  BlackfireServerTopSpansRequest,
  BlackfireServerTransactionsBreakdownRequest,
  GetApplicationFilterRequest,
  GetApplicationMergeRequest,
  GetApplicationTimelineRequest,
  HttpMetricsTimelineIpsRequest,
  HttpMetricsTimelineUrlsRequest,
  HttpMetricsTimelineUserAgentsRequest,
  ListApplicationsRequest,
  ListOrgInvitesRequest,
  ListOrgMembersRequest,
  ListOrgOrdersRequest,
  ListOrgPlanRecordsRequest,
  ListOrgProjectsRequest,
  ListOrgUsageRecordsRequest,
  ListOrgsRequest,
  ListProjectInvitesRequest,
  ListProjectTeamAccessRequest,
  ListProjectUserAccessRequest,
  ListTeamMembersRequest,
  ListTeamProjectAccessRequest,
  ListUserExtendedAccessRequest,
  ListUserOrgsRequest,
  ListUserProjectAccessRequest,
  ListUserSshKeysRequest,
  ListUserTeamsRequest,
  LogsOverviewRequest,
  LogsQueryRequest,
  ResourcesByServiceRequest,
  ResourcesOverviewRequest,
  ResourcesSummaryRequest,
} from '../api/index.js';
import {
  CertificateCreateInput,
  CreateOrgSubscriptionRequest,
  CreateProjectInviteRequest,
  EnvironmentVariableCreateInput,
  GetApplicationMerge200Response,
  IntegrationCreateCreateInput,
  IntegrationPatch,
  ProjectVariableCreateInput,
} from '../model/index.js';

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
export type IntegrationType = IntegrationCreateCreateInput['type'];
// Distributive: a union T gives a union of per-type shapes, as Omit over a union keeps only the shared keys.
export type IntegrationCreateData<T extends IntegrationType> = T extends unknown
  ? Omit<Extract<IntegrationCreateCreateInput, { type: T }>, 'type'>
  : never;
export type IntegrationPatchData<T extends IntegrationType> = T extends unknown
  ? Omit<Extract<IntegrationPatch, { type: T }>, 'type'>
  : never;
export type ProjectCreateRequest = Omit<CreateOrgSubscriptionRequest, 'projectRegion'>;
export type FilterListOrgProjects = Omit<ListOrgProjectsRequest, 'organizationId'>;

// used in TeamsTask
export type FilterListTeamProjectAccess = Omit<ListTeamProjectAccessRequest, 'teamId'>;
export type FilterListProjectTeamAccess = Omit<ListProjectTeamAccessRequest, 'projectId'>;
export type FilterListUserTeams = Omit<ListUserTeamsRequest, 'userId'>;
export type FilterListTeamMembers = Omit<ListTeamMembersRequest, 'teamId'>;

// used in SshTask
export type FilterListUserSshKeys = Omit<ListUserSshKeysRequest, 'userId'>;

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
export type FilterProjectUserAccesses = Omit<ListProjectUserAccessRequest, 'projectId'>;

export type LogsOverviewParams = Omit<LogsOverviewRequest, 'projectId' | 'environmentId'>;
export type LogsQueryParams = Omit<LogsQueryRequest, 'projectId' | 'environmentId'>;
export type HttpMetricsTimelineUrlsParams = Omit<
  HttpMetricsTimelineUrlsRequest,
  'projectId' | 'environmentId'
>;
export type HttpMetricsTimelineIpsParams = Omit<
  HttpMetricsTimelineIpsRequest,
  'projectId' | 'environmentId'
>;
export type HttpMetricsTimelineUserAgentsParams = Omit<
  HttpMetricsTimelineUserAgentsRequest,
  'projectId' | 'environmentId'
>;
export type ResourcesOverviewParams = Omit<ResourcesOverviewRequest, 'projectId' | 'environmentId'>;
export type ResourcesSummaryParams = Omit<ResourcesSummaryRequest, 'projectId' | 'environmentId'>;
export type ResourcesByServiceParams = Omit<
  ResourcesByServiceRequest,
  'projectId' | 'environmentId' | 'service'
>;
export type BlackfireServerGlobalParams = Omit<
  BlackfireServerGlobalRequest,
  'projectId' | 'environmentId'
>;
export type BlackfirePhpServerCachesParams = Omit<
  BlackfirePhpServerCachesRequest,
  'projectId' | 'environmentId'
>;
export type BlackfireServerTopSpansParams = Omit<
  BlackfireServerTopSpansRequest,
  'projectId' | 'environmentId'
>;
export type BlackfireServerTransactionsBreakdownParams = Omit<
  BlackfireServerTransactionsBreakdownRequest,
  'projectId' | 'environmentId'
>;
export type BlackfireProfilesListParams = Omit<
  BlackfireProfilesListRequest,
  'projectId' | 'environmentId'
>;
export type BlackfireProfilesRecommendationsParams = Omit<
  BlackfireProfilesRecommendationsRequest,
  'projectId' | 'environmentId'
>;
export type ContinuousProfilingListParams = Omit<ListApplicationsRequest, 'projectId' | 'envId'>;
export type ContinuousProfilingTimelineParams = Omit<
  GetApplicationTimelineRequest,
  'projectId' | 'envId' | 'app'
>;
export type ContinuousProfilingFilterParams = Omit<
  GetApplicationFilterRequest,
  'projectId' | 'envId' | 'app'
>;
export type ContinuousProfilingMergeParams = Omit<
  GetApplicationMergeRequest,
  'projectId' | 'envId' | 'app'
>;
export type ContinuousProfilingMergeResult =
  | { format: 'pprof'; data: Uint8Array; filename?: string }
  | { format: 'dot'; text: string }
  | { format: 'flamebearerv2'; data: GetApplicationMerge200Response };
