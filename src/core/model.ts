import { ListOrgInvitesRequest, ListOrgMembersRequest, ListOrgOrdersRequest, ListOrgPlanRecordsRequest, ListOrgProjectsRequest, ListOrgsRequest, ListOrgUsageRecordsRequest, ListProjectInvitesRequest, ListUserOrgsRequest } from "../api";
import { CertificateCreateInput, CreateOrgSubscriptionRequest, CreateProjectInviteRequest, IntegrationCreateInput } from "../model";

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
