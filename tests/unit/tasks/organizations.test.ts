import { OrganizationsTask } from '../../../src/core/tasks/organizations.js';
import { UpsunClient } from '../../../src/upsun.js';
import {
  AddOnsApi,
  InvoicesApi,
  MfaApi,
  OrdersApi,
  OrganizationMembersApi,
  OrganizationsApi,
  ProfilesApi,
  RecordsApi,
  SubscriptionsApi,
  VouchersApi,
} from '../../../src/api/index.js';

jest.mock('../../../src/upsun.js');
jest.mock('../../../src/api/index.js');

describe('OrganizationsTask', () => {
  let organizationsTask: OrganizationsTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockOrgApi: jest.Mocked<OrganizationsApi>;
  let mockMembersApi: jest.Mocked<OrganizationMembersApi>;
  let mockSubApi: jest.Mocked<SubscriptionsApi>;
  let mockInvApi: jest.Mocked<InvoicesApi>;
  let mockMfaApi: jest.Mocked<MfaApi>;
  let mockOrdApi: jest.Mocked<OrdersApi>;
  let mockProfApi: jest.Mocked<ProfilesApi>;
  let mockRecApi: jest.Mocked<RecordsApi>;
  let mockVouchApi: jest.Mocked<VouchersApi>;
  let mockAddOnsApi: jest.Mocked<AddOnsApi>;

  beforeEach(() => {
    mockOrgApi = {
      createOrg: jest.fn(),
      deleteOrg: jest.fn(),
      getOrg: jest.fn(),
      updateOrg: jest.fn(),
      listOrgs: jest.fn(),
      listUserOrgs: jest.fn(),
    } as any;

    mockMembersApi = {
      createOrgMember: jest.fn(),
      deleteOrgMember: jest.fn(),
      getOrgMember: jest.fn(),
      listOrgMembers: jest.fn(),
      updateOrgMember: jest.fn(),
    } as any;

    mockSubApi = {
      listOrgSubscriptions: jest.fn(),
      estimateNewOrgSubscription: jest.fn(),
      estimateOrgSubscription: jest.fn(),
      getOrgSubscriptionCurrentUsage: jest.fn(),
    } as any;

    mockInvApi = {
      getOrgInvoice: jest.fn(),
      listOrgInvoices: jest.fn(),
    } as any;

    mockMfaApi = {
      disableOrgMfaEnforcement: jest.fn(),
      enableOrgMfaEnforcement: jest.fn(),
      getOrgMfaEnforcement: jest.fn(),
      sendOrgMfaReminders: jest.fn(),
    } as any;

    mockOrdApi = {
      createAuthorizationCredentials: jest.fn(),
      getOrgOrder: jest.fn(),
      listOrgOrders: jest.fn(),
    } as any;

    mockProfApi = {
      getOrgAddress: jest.fn(),
      getOrgProfile: jest.fn(),
      updateOrgAddress: jest.fn(),
      updateOrgProfile: jest.fn(),
    } as any;

    mockRecApi = {
      listOrgPlanRecords: jest.fn(),
      listOrgUsageRecords: jest.fn(),
    } as any;

    mockVouchApi = {
      applyOrgVoucher: jest.fn(),
      listOrgVouchers: jest.fn(),
    } as any;

    mockAddOnsApi = {
      getOrgAddons: jest.fn(),
      updateOrgAddons: jest.fn(),
    } as any;

    mockClient = {
      apiConfig: { basePath: 'https://api.upsun.com' },
      users: {
        me: jest.fn(),
      },
      teams: {
        list: jest.fn(),
        listByMember: jest.fn(),
      },
      projects: {
        get: jest.fn(),
        list: jest.fn(),
        canCreate: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    organizationsTask = new OrganizationsTask(
      mockClient,
      mockOrgApi,
      mockMembersApi,
      mockSubApi,
      mockInvApi,
      mockMfaApi,
      mockOrdApi,
      mockProfApi,
      mockRecApi,
      mockVouchApi,
      mockAddOnsApi,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create organization', async () => {
      const org = { id: 'org-1' };
      mockOrgApi.createOrg.mockResolvedValue(org as any);

      const result = await organizationsTask.create('My Org', undefined, 'user-1', 'Acme', 'FR');
      expect(result).toEqual(org);
      expect(mockOrgApi.createOrg).toHaveBeenCalledWith({
        createOrgRequest: {
          label: 'My Org',
          type: undefined,
          ownerId: 'user-1',
          name: 'Acme',
          country: 'FR',
        },
      });
    });

    it('should require label', async () => {
      await expect(organizationsTask.create('')).rejects.toThrow('Label is required');
    });
  });

  describe('delete', () => {
    it('should delete organization by id', async () => {
      mockOrgApi.deleteOrg.mockResolvedValue(undefined);

      await organizationsTask.delete('org-1');
      expect(mockOrgApi.deleteOrg).toHaveBeenCalledWith({ organizationId: 'org-1' });
    });
  });

  describe('info', () => {
    it('should call get when no update fields are set', async () => {
      const org = { id: 'org-1' };
      mockOrgApi.getOrg.mockResolvedValue(org as any);

      const result = await organizationsTask.info('org-1', {} as any);
      expect(result).toEqual(org);
      expect(mockOrgApi.getOrg).toHaveBeenCalledWith({ organizationId: 'org-1' });
    });

    it('should call update when update fields are present', async () => {
      const org = { id: 'org-1', name: 'Updated' };
      mockOrgApi.updateOrg.mockResolvedValue(org as any);

      const result = await organizationsTask.info('org-1', { name: 'Updated' } as any);
      expect(result).toEqual(org);
      expect(mockOrgApi.updateOrg).toHaveBeenCalledWith({
        organizationId: 'org-1',
        updateOrgRequest: { name: 'Updated' },
      });
    });
  });

  describe('membership methods', () => {
    it('should add member', async () => {
      const member = { userId: 'user-1' };
      mockMembersApi.createOrgMember.mockResolvedValue(member as any);

      const result = await organizationsTask.addMember('org-1', 'user-1', ['admin'] as any);
      expect(result).toEqual(member);
      expect(mockMembersApi.createOrgMember).toHaveBeenCalledWith({
        organizationId: 'org-1',
        createOrgMemberRequest: { userId: 'user-1', permissions: ['admin'] },
      });
    });

    it('should delete member', async () => {
      mockMembersApi.deleteOrgMember.mockResolvedValue(undefined);

      await organizationsTask.deleteMember('org-1', 'user-1');
      expect(mockMembersApi.deleteOrgMember).toHaveBeenCalledWith({
        organizationId: 'org-1',
        userId: 'user-1',
      });
    });

    it('should get member', async () => {
      const member = { userId: 'user-1' };
      mockMembersApi.getOrgMember.mockResolvedValue(member as any);

      const result = await organizationsTask.getMember('org-1', 'user-1');
      expect(result).toEqual(member);
    });

    it('should list members', async () => {
      const list = { items: [] };
      mockMembersApi.listOrgMembers.mockResolvedValue(list as any);

      const result = await organizationsTask.listMembers('org-1', { page: 2 } as any);
      expect(result).toEqual(list);
      expect(mockMembersApi.listOrgMembers).toHaveBeenCalledWith({ organizationId: 'org-1', page: 2 });
    });

    it('should update member permissions', async () => {
      const member = { userId: 'user-1', permissions: ['viewer'] };
      mockMembersApi.updateOrgMember.mockResolvedValue(member as any);

      const result = await organizationsTask.updateMember('org-1', 'user-1', ['viewer']);
      expect(result).toEqual(member);
      expect(mockMembersApi.updateOrgMember).toHaveBeenCalledWith({
        organizationId: 'org-1',
        userId: 'user-1',
        updateOrgMemberRequest: {
          permissions: ['viewer'],
        },
      });
    });
  });

  describe('client delegations', () => {
    it('should list current user organizations', async () => {
      (mockClient.users.me as jest.Mock).mockResolvedValue({ id: 'user-42' });
      mockOrgApi.listUserOrgs.mockResolvedValue({ items: [] } as any);

      await organizationsTask.listCurrentUserOrgs({ page: 1 } as any);
      expect(mockOrgApi.listUserOrgs).toHaveBeenCalledWith({ userId: 'user-42', page: 1 });
    });

    it('should delegate listTeams and listTeamsByMember', async () => {
      (mockClient.teams.list as jest.Mock).mockResolvedValue({ items: [] });
      (mockClient.teams.listByMember as jest.Mock).mockResolvedValue({ items: [] });

      await organizationsTask.listTeams({ page: 1 } as any);
      await organizationsTask.listTeams();
      await organizationsTask.listTeamsByMember('user-1', { page: 2 } as any);

      expect(mockClient.teams.list).toHaveBeenCalledWith({ page: 1 });
      expect(mockClient.teams.list).toHaveBeenCalledWith({});
      expect(mockClient.teams.listByMember).toHaveBeenCalledWith('user-1', { page: 2 });
    });

    it('should delegate project operations', async () => {
      (mockClient.projects.get as jest.Mock).mockResolvedValue({ id: 'proj-1' });
      (mockClient.projects.list as jest.Mock).mockResolvedValue({ items: [] });
      (mockClient.projects.canCreate as jest.Mock).mockResolvedValue({ canCreate: true });
      (mockClient.projects.create as jest.Mock).mockResolvedValue({ id: 'sub-1' });
      (mockClient.projects.delete as jest.Mock).mockResolvedValue(undefined);

      await organizationsTask.getProject('proj-1');
      await organizationsTask.listProjects('org-1', { page: 1 } as any);
      await organizationsTask.canCreateProject('org-1');
      await organizationsTask.createProject('org-1', 'eu-5.platform.sh', { title: 'X' } as any);
      await organizationsTask.deleteProject('proj-1');

      expect(mockClient.projects.get).toHaveBeenCalledWith('proj-1');
      expect(mockClient.projects.list).toHaveBeenCalledWith('org-1', { page: 1 });
      expect(mockClient.projects.canCreate).toHaveBeenCalledWith('org-1');
      expect(mockClient.projects.create).toHaveBeenCalledWith('org-1', 'eu-5.platform.sh', { title: 'X' });
      expect(mockClient.projects.delete).toHaveBeenCalledWith('proj-1');
    });

    it('should list organizations and subscriptions', async () => {
      mockOrgApi.listOrgs.mockResolvedValue({ items: [] } as any);
      mockSubApi.listOrgSubscriptions.mockResolvedValue({ items: [] } as any);

      await organizationsTask.list({ page: 1 } as any);
      await organizationsTask.listSubscriptions('org-1');

      expect(mockOrgApi.listOrgs).toHaveBeenCalledWith({ page: 1 });
      expect(mockSubApi.listOrgSubscriptions).toHaveBeenCalledWith({ organizationId: 'org-1' });
    });
  });

  describe('subscription estimates and usage', () => {
    it('should estimate new project with defaults', async () => {
      const estimation = { total: 10 };
      mockSubApi.estimateNewOrgSubscription.mockResolvedValue(estimation as any);

      const result = await organizationsTask.estimateNewProject('org-1');
      expect(result).toEqual(estimation);
      expect(mockSubApi.estimateNewOrgSubscription).toHaveBeenCalledWith({
        organizationId: 'org-1',
        environments: 3,
        storage: 500,
        userLicenses: 1,
        format: undefined,
        plan: 'upsun/flexible',
      });
    });

    it('should estimate and get usage from project subscription id', async () => {
      const project = {
        subscription: { licenseUri: 'https://api.upsun.com/subscriptions/sub-99' },
      };
      (mockClient.projects.get as jest.Mock).mockResolvedValue(project);
      mockSubApi.estimateOrgSubscription.mockResolvedValue({ total: 20 } as any);
      mockSubApi.getOrgSubscriptionCurrentUsage.mockResolvedValue({ usage: [] } as any);

      await organizationsTask.estimateProject('org-1', 'proj-1');
      await organizationsTask.getProjectUsage('org-1', 'proj-1', 'storage', true);

      expect(mockSubApi.estimateOrgSubscription).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: 'org-1', subscriptionId: 'sub-99' }),
      );
      expect(mockSubApi.getOrgSubscriptionCurrentUsage).toHaveBeenCalledWith({
        organizationId: 'org-1',
        subscriptionId: 'sub-99',
        usageGroups: 'storage',
        includeNotCharged: true,
      });
    });
  });

  describe('billing and addons', () => {
    it('should throw for downloadInvoice not implemented', async () => {
      await expect(organizationsTask.downloadInvoice('tok')).rejects.toThrow('Method not implemented.');
    });

    it('should apply voucher', async () => {
      mockVouchApi.applyOrgVoucher.mockResolvedValue(undefined);

      await organizationsTask.applyVoucher('org-1', 'ABC123');
      expect(mockVouchApi.applyOrgVoucher).toHaveBeenCalledWith({
        organizationId: 'org-1',
        applyOrgVoucherRequest: { code: 'ABC123' },
      });
    });

    it('should get and update addons', async () => {
      mockAddOnsApi.getOrgAddons.mockResolvedValue({} as any);
      mockAddOnsApi.updateOrgAddons.mockResolvedValue({ enabled: ['x'] } as any);

      await organizationsTask.getAddons('org-1');
      await organizationsTask.updateAddons('org-1');

      expect(mockAddOnsApi.getOrgAddons).toHaveBeenCalledWith({ organizationId: 'org-1' });
      expect(mockAddOnsApi.updateOrgAddons).toHaveBeenCalledWith({
        organizationId: 'org-1',
        updateOrgAddonsRequest: {},
      });
    });

    it('should cover MFA endpoints', async () => {
      mockMfaApi.disableOrgMfaEnforcement.mockResolvedValue(undefined);
      mockMfaApi.enableOrgMfaEnforcement.mockResolvedValue(undefined);
      mockMfaApi.getOrgMfaEnforcement.mockResolvedValue({ enforced: true } as any);
      mockMfaApi.sendOrgMfaReminders.mockResolvedValue({} as any);

      await organizationsTask.disableMfaEnforcement('org-1');
      await organizationsTask.enableMfaEnforcement('org-1');
      await organizationsTask.getMfaEnforcement('org-1');
      await organizationsTask.sendMfaReminders('org-1', ['user-1']);

      expect(mockMfaApi.disableOrgMfaEnforcement).toHaveBeenCalledWith({ organizationId: 'org-1' });
      expect(mockMfaApi.enableOrgMfaEnforcement).toHaveBeenCalledWith({ organizationId: 'org-1' });
      expect(mockMfaApi.getOrgMfaEnforcement).toHaveBeenCalledWith({ organizationId: 'org-1' });
      expect(mockMfaApi.sendOrgMfaReminders).toHaveBeenCalledWith({
        organizationId: 'org-1',
        sendOrgMfaRemindersRequest: { userIds: ['user-1'] },
      });
    });

    it('should cover invoice and order endpoints', async () => {
      mockInvApi.getOrgInvoice.mockResolvedValue({ id: 'inv-1' } as any);
      mockInvApi.listOrgInvoices.mockResolvedValue({ items: [] } as any);
      mockOrdApi.createAuthorizationCredentials.mockResolvedValue({ token: 'x' } as any);
      mockOrdApi.getOrgOrder.mockResolvedValue({ id: 'ord-1' } as any);
      mockOrdApi.listOrgOrders.mockResolvedValue({ items: [] } as any);

      await organizationsTask.getInvoice('inv-1', 'org-1');
      await organizationsTask.listInvoices('org-1', undefined, undefined, undefined, 2);
      await organizationsTask.createAuthorizationCredentials('org-1', 'ord-1');
      await organizationsTask.getOrder('org-1', 'ord-1');
      await organizationsTask.listOrders('org-1', { page: 3 } as any);

      expect(mockInvApi.getOrgInvoice).toHaveBeenCalledWith({ invoiceId: 'inv-1', organizationId: 'org-1' });
      expect(mockInvApi.listOrgInvoices).toHaveBeenCalledWith({
        organizationId: 'org-1',
        filterStatus: undefined,
        filterType: undefined,
        filterOrderId: undefined,
        page: 2,
      });
      expect(mockOrdApi.createAuthorizationCredentials).toHaveBeenCalledWith({ organizationId: 'org-1', orderId: 'ord-1' });
      expect(mockOrdApi.getOrgOrder).toHaveBeenCalledWith({ organizationId: 'org-1', orderId: 'ord-1', mode: undefined });
      expect(mockOrdApi.listOrgOrders).toHaveBeenCalledWith({ organizationId: 'org-1', page: 3 });
    });

    it('should cover profile, records and vouchers endpoints', async () => {
      mockProfApi.getOrgAddress.mockResolvedValue({} as any);
      mockProfApi.getOrgProfile.mockResolvedValue({} as any);
      mockProfApi.updateOrgAddress.mockResolvedValue({} as any);
      mockProfApi.updateOrgProfile.mockResolvedValue({} as any);
      mockRecApi.listOrgPlanRecords.mockResolvedValue({ items: [] } as any);
      mockRecApi.listOrgUsageRecords.mockResolvedValue({ items: [] } as any);
      mockVouchApi.listOrgVouchers.mockResolvedValue({ items: [] } as any);

      await organizationsTask.getAddress('org-1');
      await organizationsTask.getProfile('org-1');
      await organizationsTask.updateAddress('org-1', { city: 'Paris' } as any);
      await organizationsTask.updateProfile('org-1', { name: 'Acme' } as any);
      await organizationsTask.listRecords('org-1', { page: 1 } as any);
      await organizationsTask.listUsageRecords('org-1', { page: 2 } as any);
      await organizationsTask.listVouchers('org-1');

      expect(mockProfApi.getOrgAddress).toHaveBeenCalledWith({ organizationId: 'org-1' });
      expect(mockProfApi.getOrgProfile).toHaveBeenCalledWith({ organizationId: 'org-1' });
      expect(mockProfApi.updateOrgAddress).toHaveBeenCalledWith({ organizationId: 'org-1', address: { city: 'Paris' } });
      expect(mockProfApi.updateOrgProfile).toHaveBeenCalledWith({
        organizationId: 'org-1',
        updateOrgProfileRequest: { name: 'Acme' },
      });
      expect(mockRecApi.listOrgPlanRecords).toHaveBeenCalledWith({ organizationId: 'org-1', page: 1 });
      expect(mockRecApi.listOrgUsageRecords).toHaveBeenCalledWith({ organizationId: 'org-1', page: 2 });
      expect(mockVouchApi.listOrgVouchers).toHaveBeenCalledWith({ organizationId: 'org-1' });
    });
  });
});
