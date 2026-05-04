import { ProjectsTask } from '../../../src/core/tasks/projects.js';
import { UpsunClient } from '../../../src/upsun.js';
import {
  ProjectApi,
  OrganizationProjectsApi,
  SubscriptionsApi,
  ProjectSettingsApi,
} from '../../../src/api/index.js';

// Mock the UpsunClient and APIs
jest.mock('../../../src/upsun.js');
jest.mock('../../../src/api/index.js');

describe('ProjectsTask', () => {
  let projectsTask: ProjectsTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockProjectApi: jest.Mocked<ProjectApi>;
  let mockOrgProjectsApi: jest.Mocked<OrganizationProjectsApi>;
  let mockSubscriptionsApi: jest.Mocked<SubscriptionsApi>;
  let mockSettingsApi: jest.Mocked<ProjectSettingsApi>;

  beforeEach(() => {
    mockProjectApi = {
      actionProjectsClearBuildCache: jest.fn(),
      getProjects: jest.fn(),
      getProjectsCapabilities: jest.fn(),
    } as any;

    mockOrgProjectsApi = {
      listOrgProjects: jest.fn(),
      updateOrgProject: jest.fn(),
    } as any;

    mockSubscriptionsApi = {
      createOrgSubscription: jest.fn(),
      deleteOrgSubscription: jest.fn(),
      canCreateNewOrgSubscription: jest.fn(),
      getOrgSubscription: jest.fn(),
    } as any;

    mockSettingsApi = {
      getProjectsSettings: jest.fn(),
      updateProjectsSettings: jest.fn(),
    } as any;

    (ProjectApi as jest.MockedClass<typeof ProjectApi>).mockImplementation(() => mockProjectApi);
    (
      OrganizationProjectsApi as jest.MockedClass<typeof OrganizationProjectsApi>
    ).mockImplementation(() => mockOrgProjectsApi);
    (SubscriptionsApi as jest.MockedClass<typeof SubscriptionsApi>).mockImplementation(
      () => mockSubscriptionsApi,
    );
    (ProjectSettingsApi as jest.MockedClass<typeof ProjectSettingsApi>).mockImplementation(
      () => mockSettingsApi,
    );

    mockClient = {
      apiConfig: { basePath: 'https://api.upsun.com' },
      invitations: {
        cancelProjectInvite: jest.fn(),
        createProjectInvite: jest.fn(),
        listProjectInvites: jest.fn(),
      },
      variables: {
        createProjectVariable: jest.fn(),
        getProjectVariable: jest.fn(),
        deleteProjectVariable: jest.fn(),
        listProjectVariables: jest.fn(),
        updateProjectVariable: jest.fn(),
      },
      activities: {
        list: jest.fn(),
        get: jest.fn(),
        cancel: jest.fn(),
      },
      domains: {
        add: jest.fn(),
        delete: jest.fn(),
        get: jest.fn(),
        list: jest.fn(),
        update: jest.fn(),
      },
      certificates: {
        add: jest.fn(),
        delete: jest.fn(),
        get: jest.fn(),
        list: jest.fn(),
        update: jest.fn(),
      },
      teams: {
        getTeamProjectAccessByProject: jest.fn(),
        getTeamProjectAccessByTeam: jest.fn(),
        grantTeamProjectAccessToProject: jest.fn(),
        grantTeamProjectAccessToTeam: jest.fn(),
        listTeamProjectAccessByProject: jest.fn(),
        listTeamProjectAccessByTeam: jest.fn(),
        revokeTeamProjectAccessByProject: jest.fn(),
        revokeTeamProjectAccessByTeam: jest.fn(),
      },
      users: {
        getUserProjectAccessByProject: jest.fn(),
        addToProject: jest.fn(),
        removeFromProject: jest.fn(),
        updateUserProjectAccessByProject: jest.fn(),
        listProjectUserAccesses: jest.fn(),
        listUserProjectAccessByUser: jest.fn(),
      },
      environments: {
        list: jest.fn(),
      },
    } as any;

    projectsTask = new ProjectsTask(
      mockClient,
      mockProjectApi,
      mockOrgProjectsApi,
      mockSubscriptionsApi,
      mockSettingsApi,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should have get method defined', () => {
      expect(projectsTask.get).toBeDefined();
      expect(typeof projectsTask.get).toBe('function');
    });

    it('should return a project by ID', async () => {
      const mockProject = { id: 'proj-1', title: 'My Project' };
      mockProjectApi.getProjects.mockResolvedValue(mockProject as any);

      const result = await projectsTask.get('proj-1');
      expect(result).toBeDefined();
      expect((result as any).id).toBe('proj-1');
      expect(mockProjectApi.getProjects).toHaveBeenCalledWith({ projectId: 'proj-1' });
    });

    it('should throw when project ID is empty', async () => {
      await expect(projectsTask.get('')).rejects.toThrow('Project ID is required');
    });

    it('should handle API error', async () => {
      mockProjectApi.getProjects.mockRejectedValue(new Error('Not found'));
      await expect(projectsTask.get('proj-1')).rejects.toThrow('Not found');
    });
  });

  describe('info', () => {
    it('should get project information', async () => {
      expect(projectsTask.info).toBeDefined();
      expect(typeof projectsTask.info).toBe('function');
    });

    it('should fetch project without params', async () => {
      const mockProject = { id: 'proj-1', title: 'My Project' };
      mockProjectApi.getProjects.mockResolvedValue(mockProject as any);

      const result = await projectsTask.info('proj-1');
      expect(result).toBeDefined();
      expect(mockProjectApi.getProjects).toHaveBeenCalledWith({ projectId: 'proj-1' });
    });

    it('should update project when params provided', async () => {
      const mockProject = { id: 'proj-1', title: 'Updated Title', organization: 'org-1' };
      mockOrgProjectsApi.updateOrgProject.mockResolvedValue(mockProject as any);
      mockProjectApi.getProjects.mockResolvedValue(mockProject as any);

      const result = await projectsTask.info('proj-1', { title: 'Updated Title' });
      expect(result).toBeDefined();
      expect(mockOrgProjectsApi.updateOrgProject).toHaveBeenCalledWith({
        organizationId: 'org-1',
        projectId: 'proj-1',
        updateOrgProjectRequest: { title: 'Updated Title' },
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(projectsTask.info('')).rejects.toThrow('Project ID is required');
    });
  });

  describe('create', () => {
    it('should have create method defined', () => {
      expect(projectsTask.create).toBeDefined();
      expect(typeof projectsTask.create).toBe('function');
    });

    it('should create a project', async () => {
      const mockSubscription = { id: 'sub-1', projectRegion: 'eu-5.platform.sh' };
      mockSubscriptionsApi.createOrgSubscription.mockResolvedValue(mockSubscription as any);

      const result = await projectsTask.create('org-1', 'eu-5.platform.sh');
      expect(result).toBeDefined();
      expect(mockSubscriptionsApi.createOrgSubscription).toHaveBeenCalledWith({
        organizationId: 'org-1',
        createOrgSubscriptionRequest: { projectRegion: 'eu-5.platform.sh' },
      });
    });

    it('should throw when organization ID is empty', async () => {
      await expect(projectsTask.create('', 'eu-5.platform.sh')).rejects.toThrow(
        'Organization ID is required',
      );
    });

    it('should throw when project region is empty', async () => {
      await expect(projectsTask.create('org-1', '')).rejects.toThrow('Project region is required');
    });

    it('should handle API error', async () => {
      mockSubscriptionsApi.createOrgSubscription.mockRejectedValue(new Error('Quota exceeded'));
      await expect(projectsTask.create('org-1', 'eu-5.platform.sh')).rejects.toThrow(
        'Quota exceeded',
      );
    });
  });

  describe('canCreate', () => {
    it('should return project creation eligibility', async () => {
      const response = { canCreate: true };
      mockSubscriptionsApi.canCreateNewOrgSubscription.mockResolvedValue(response as any);

      const result = await projectsTask.canCreate('org-1');
      expect(result).toEqual(response);
      expect(mockSubscriptionsApi.canCreateNewOrgSubscription).toHaveBeenCalledWith({
        organizationId: 'org-1',
      });
    });

    it('should validate organization id', async () => {
      await expect(projectsTask.canCreate('')).rejects.toThrow('Organization ID is required');
    });
  });

  describe('delete', () => {
    it('should delete a project', async () => {
      expect(projectsTask.delete).toBeDefined();
      expect(typeof projectsTask.delete).toBe('function');
    });

    it('should delete a project by ID', async () => {
      const mockProject = {
        id: 'proj-1',
        organization: 'org-1',
        subscription: { licenseUri: 'https://api.upsun.com/subscriptions/sub-123' },
      };
      mockProjectApi.getProjects.mockResolvedValue(mockProject as any);
      mockSubscriptionsApi.deleteOrgSubscription.mockResolvedValue(undefined);

      await projectsTask.delete('proj-1');
      expect(mockSubscriptionsApi.deleteOrgSubscription).toHaveBeenCalledWith({
        organizationId: 'org-1',
        subscriptionId: 'sub-123',
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(projectsTask.delete('')).rejects.toThrow('Project ID is required');
    });
  });

  describe('list', () => {
    it('should list organization subscriptions', async () => {
      expect(projectsTask.list).toBeDefined();
      expect(typeof projectsTask.list).toBe('function');
    });

    it('should list projects for an organization', async () => {
      const mockResponse = { projects: [{ id: 'proj-1' }], count: 1 };
      mockOrgProjectsApi.listOrgProjects.mockResolvedValue(mockResponse as any);

      const result = await projectsTask.list('org-1');
      expect(result).toBeDefined();
      expect(mockOrgProjectsApi.listOrgProjects).toHaveBeenCalledWith({
        organizationId: 'org-1',
      });
    });

    it('should throw when organization ID is empty', async () => {
      await expect(projectsTask.list('')).rejects.toThrow('Organization ID is required');
    });

    it('should handle API error', async () => {
      mockOrgProjectsApi.listOrgProjects.mockRejectedValue(new Error('Server error'));
      await expect(projectsTask.list('org-1')).rejects.toThrow('Server error');
    });
  });

  describe('clearBuildCache', () => {
    it('should clear project build cache', async () => {
      expect(projectsTask.clearBuildCache).toBeDefined();
      expect(typeof projectsTask.clearBuildCache).toBe('function');
    });

    it('should clear the build cache', async () => {
      const mockResponse = { status: 'ok' };
      mockProjectApi.actionProjectsClearBuildCache.mockResolvedValue(mockResponse as any);

      const result = await projectsTask.clearBuildCache('proj-1');
      expect(result).toBeDefined();
      expect(mockProjectApi.actionProjectsClearBuildCache).toHaveBeenCalledWith({
        projectId: 'proj-1',
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(projectsTask.clearBuildCache('')).rejects.toThrow('Project ID is required');
    });
  });

  describe('getSettings', () => {
    it('should have getSettings method defined', () => {
      expect(projectsTask.getSettings).toBeDefined();
    });

    it('should return project settings', async () => {
      const mockSettings = { allow_production_environments: 3 };
      mockSettingsApi.getProjectsSettings.mockResolvedValue(mockSettings as any);

      const result = await projectsTask.getSettings('proj-1');
      expect(result).toBeDefined();
      expect(mockSettingsApi.getProjectsSettings).toHaveBeenCalledWith({ projectId: 'proj-1' });
    });

    it('should throw when project ID is empty', async () => {
      await expect(projectsTask.getSettings('')).rejects.toThrow('Project ID is required');
    });

    it('should handle API error', async () => {
      mockSettingsApi.getProjectsSettings.mockRejectedValue(new Error('Not found'));
      await expect(projectsTask.getSettings('proj-1')).rejects.toThrow('Not found');
    });
  });

  describe('getCapabilities', () => {
    it('should have getCapabilities method defined', () => {
      expect(projectsTask.getCapabilities).toBeDefined();
    });

    it('should return project capabilities', async () => {
      const mockCapabilities = { has_production: true };
      mockProjectApi.getProjectsCapabilities.mockResolvedValue(mockCapabilities as any);

      const result = await projectsTask.getCapabilities('proj-1');
      expect(result).toBeDefined();
      expect(mockProjectApi.getProjectsCapabilities).toHaveBeenCalledWith({
        projectId: 'proj-1',
      });
    });

    it('should throw when project ID is empty', async () => {
      await expect(projectsTask.getCapabilities('')).rejects.toThrow('Project ID is required');
    });
  });

  describe('cancelInvite', () => {
    it('should have cancelInvite method defined', () => {
      expect(projectsTask.cancelInvite).toBeDefined();
    });

    it('should delegate to client.invitations.cancelProjectInvite', async () => {
      (mockClient.invitations.cancelProjectInvite as jest.Mock).mockResolvedValue(undefined);

      await projectsTask.cancelInvite('proj-1', 'inv-1');
      expect(mockClient.invitations.cancelProjectInvite).toHaveBeenCalledWith('proj-1', 'inv-1');
    });
  });

  describe('createInvite', () => {
    it('should have createInvite method defined', () => {
      expect(projectsTask.createInvite).toBeDefined();
    });

    it('should delegate to client.invitations.createProjectInvite', async () => {
      const mockInvite = { id: 'inv-1', email: 'dev@example.com' };
      (mockClient.invitations.createProjectInvite as jest.Mock).mockResolvedValue(mockInvite);

      const params = { role: 'viewer' } as any;
      const result = await projectsTask.createInvite('proj-1', 'dev@example.com', params);
      expect(result).toBeDefined();
      expect(mockClient.invitations.createProjectInvite).toHaveBeenCalledWith(
        'proj-1',
        'dev@example.com',
        params,
      );
    });
  });

  describe('listInvites', () => {
    it('should have listInvites method defined', () => {
      expect(projectsTask.listInvites).toBeDefined();
    });

    it('should delegate to client.invitations.listProjectInvites', async () => {
      const mockInvites = [{ id: 'inv-1' }];
      (mockClient.invitations.listProjectInvites as jest.Mock).mockResolvedValue(mockInvites);

      const result = await projectsTask.listInvites('proj-1');
      expect(result).toBeDefined();
      expect(mockClient.invitations.listProjectInvites).toHaveBeenCalledWith('proj-1', undefined);
    });
  });

  describe('additional delegations', () => {
    it('should get project subscription', async () => {
      const project = {
        organization: 'org-1',
        subscription: { licenseUri: 'https://api.upsun.com/subscriptions/sub-123' },
      };
      const subscription = { id: 'sub-123' };
      mockProjectApi.getProjects.mockResolvedValue(project as any);
      mockSubscriptionsApi.getOrgSubscription.mockResolvedValue(subscription as any);

      const result = await projectsTask.getSubscription('proj-1');
      expect(result).toEqual(subscription);
      expect(mockSubscriptionsApi.getOrgSubscription).toHaveBeenCalledWith({
        organizationId: 'org-1',
        subscriptionId: 'sub-123',
      });
    });

    it('should fail getSubscription when organization is missing', async () => {
      mockProjectApi.getProjects.mockResolvedValue({
        organization: '',
        subscription: { licenseUri: 'https://api.upsun.com/subscriptions/sub-123' },
      } as any);

      await expect(projectsTask.getSubscription('proj-1')).rejects.toThrow(
        'Organization ID is required',
      );
      expect(mockSubscriptionsApi.getOrgSubscription).not.toHaveBeenCalled();
    });

    it('should update project settings', async () => {
      const accepted = { status: 'ok' };
      mockSettingsApi.updateProjectsSettings.mockResolvedValue(accepted as any);

      const result = await projectsTask.updateSettings('proj-1', { some: 'setting' } as any);
      expect(result).toEqual(accepted);
      expect(mockSettingsApi.updateProjectsSettings).toHaveBeenCalledWith({
        projectId: 'proj-1',
        projectSettingsPatch: { some: 'setting' },
      });
    });

    it('should delegate variables operations', async () => {
      (mockClient.variables.createProjectVariable as jest.Mock).mockResolvedValue({ ok: true });
      (mockClient.variables.getProjectVariable as jest.Mock).mockResolvedValue({ id: 'var-1' });
      (mockClient.variables.deleteProjectVariable as jest.Mock).mockResolvedValue(undefined);
      (mockClient.variables.listProjectVariables as jest.Mock).mockResolvedValue([{ id: 'var-1' }]);
      (mockClient.variables.updateProjectVariable as jest.Mock).mockResolvedValue({ ok: true });

      await projectsTask.createVariable('proj-1', 'NAME', 'VALUE', { isJson: false } as any);
      await projectsTask.getVariable('proj-1', 'var-1');
      await projectsTask.deleteVariable('proj-1', 'var-1');
      await projectsTask.listVariables('proj-1');
      await projectsTask.updateVariable('proj-1', 'var-1', { isSensitive: true } as any);

      expect(mockClient.variables.createProjectVariable).toHaveBeenCalledWith(
        'proj-1',
        'NAME',
        'VALUE',
        { isJson: false },
      );
      expect(mockClient.variables.getProjectVariable).toHaveBeenCalledWith('proj-1', 'var-1');
      expect(mockClient.variables.deleteProjectVariable).toHaveBeenCalledWith('proj-1', 'var-1');
      expect(mockClient.variables.listProjectVariables).toHaveBeenCalledWith('proj-1');
      expect(mockClient.variables.updateProjectVariable).toHaveBeenCalledWith('proj-1', 'var-1', {
        isSensitive: true,
      });
    });

    it('should delegate activities operations', async () => {
      (mockClient.activities.list as jest.Mock).mockResolvedValue([{ id: 'act-1' }]);
      (mockClient.activities.get as jest.Mock).mockResolvedValue({ id: 'act-1' });
      (mockClient.activities.cancel as jest.Mock).mockResolvedValue({ status: 'ok' });

      await projectsTask.listActivities('proj-1');
      await projectsTask.getActivity('proj-1', 'act-1');
      await projectsTask.cancelActivity('proj-1', 'act-1');

      expect(mockClient.activities.list).toHaveBeenCalledWith('proj-1');
      expect(mockClient.activities.get).toHaveBeenCalledWith('proj-1', 'act-1');
      expect(mockClient.activities.cancel).toHaveBeenCalledWith('proj-1', 'act-1');
    });

    it('should delegate domains operations', async () => {
      (mockClient.domains.add as jest.Mock).mockResolvedValue({ status: 'ok' });
      (mockClient.domains.delete as jest.Mock).mockResolvedValue({ status: 'ok' });
      (mockClient.domains.get as jest.Mock).mockResolvedValue({ id: 'dom-1' });
      (mockClient.domains.list as jest.Mock).mockResolvedValue([{ id: 'dom-1' }]);
      (mockClient.domains.update as jest.Mock).mockResolvedValue({ status: 'ok' });

      await projectsTask.addDomain('proj-1', 'example.com', { env: 'main' }, true, 'old-dom');
      await projectsTask.deleteDomain('proj-1', 'dom-1');
      await projectsTask.getDomain('proj-1', 'dom-1');
      await projectsTask.listDomains('proj-1');
      await projectsTask.updateDomain('proj-1', 'dom-1', { default: true } as any);

      expect(mockClient.domains.add).toHaveBeenCalledWith(
        'proj-1',
        'example.com',
        { env: 'main' },
        true,
        'old-dom',
      );
      expect(mockClient.domains.delete).toHaveBeenCalledWith('proj-1', 'dom-1');
      expect(mockClient.domains.get).toHaveBeenCalledWith('proj-1', 'dom-1');
      expect(mockClient.domains.list).toHaveBeenCalledWith('proj-1');
      expect(mockClient.domains.update).toHaveBeenCalledWith('proj-1', 'dom-1', { default: true });
    });

    it('should delegate certificates operations', async () => {
      (mockClient.certificates.add as jest.Mock).mockResolvedValue({ status: 'ok' });
      (mockClient.certificates.delete as jest.Mock).mockResolvedValue({ status: 'ok' });
      (mockClient.certificates.get as jest.Mock).mockResolvedValue({ id: 'crt-1' });
      (mockClient.certificates.list as jest.Mock).mockResolvedValue([{ id: 'crt-1' }]);
      (mockClient.certificates.update as jest.Mock).mockResolvedValue({ status: 'ok' });

      await projectsTask.addCertificate('proj-1', 'cert', 'key', { csr: 'x' } as any);
      await projectsTask.deleteCertificate('proj-1', 'crt-1');
      await projectsTask.getCertificate('proj-1', 'crt-1');
      await projectsTask.listCertificates('proj-1');
      await projectsTask.updateCertificate('proj-1', 'crt-1', { id: 'x' } as any);

      expect(mockClient.certificates.add).toHaveBeenCalledWith('proj-1', 'cert', 'key', {
        csr: 'x',
      });
      expect(mockClient.certificates.delete).toHaveBeenCalledWith('proj-1', 'crt-1');
      expect(mockClient.certificates.get).toHaveBeenCalledWith('proj-1', 'crt-1');
      expect(mockClient.certificates.list).toHaveBeenCalledWith('proj-1');
      expect(mockClient.certificates.update).toHaveBeenCalledWith('proj-1', 'crt-1', { id: 'x' });
    });

    it('should delegate team access operations', async () => {
      (mockClient.teams.getTeamProjectAccessByProject as jest.Mock).mockResolvedValue({});
      (mockClient.teams.getTeamProjectAccessByTeam as jest.Mock).mockResolvedValue({});
      (mockClient.teams.grantTeamProjectAccessToProject as jest.Mock).mockResolvedValue(undefined);
      (mockClient.teams.grantTeamProjectAccessToTeam as jest.Mock).mockResolvedValue(undefined);
      (mockClient.teams.listTeamProjectAccessByProject as jest.Mock).mockResolvedValue({
        items: [],
      });
      (mockClient.teams.listTeamProjectAccessByTeam as jest.Mock).mockResolvedValue({ items: [] });
      (mockClient.teams.revokeTeamProjectAccessByProject as jest.Mock).mockResolvedValue(undefined);
      (mockClient.teams.revokeTeamProjectAccessByTeam as jest.Mock).mockResolvedValue(undefined);

      await projectsTask.getTeamProjectAccessByProject('proj-1', 'team-1');
      await projectsTask.getTeamProjectAccessByTeam('team-1', 'proj-1');
      await projectsTask.grantTeamProjectAccessToProject('proj-1', [{ teamId: 'team-1' }] as any);
      await projectsTask.grantTeamProjectAccessToTeam('team-1', [{ projectId: 'proj-1' }] as any);
      await projectsTask.listTeamProjectAccessByProject('proj-1', { page: 1 } as any);
      await projectsTask.listTeamProjectAccessByTeam('team-1', { page: 2 } as any);
      await projectsTask.revokeTeamProjectAccessByProject('proj-1', 'team-1');
      await projectsTask.revokeTeamProjectAccessByTeam('team-1', 'proj-1');

      expect(mockClient.teams.getTeamProjectAccessByProject).toHaveBeenCalledWith(
        'proj-1',
        'team-1',
      );
      expect(mockClient.teams.getTeamProjectAccessByTeam).toHaveBeenCalledWith('team-1', 'proj-1');
      expect(mockClient.teams.grantTeamProjectAccessToProject).toHaveBeenCalledWith('proj-1', [
        { teamId: 'team-1' },
      ]);
      expect(mockClient.teams.grantTeamProjectAccessToTeam).toHaveBeenCalledWith('team-1', [
        { projectId: 'proj-1' },
      ]);
      expect(mockClient.teams.listTeamProjectAccessByProject).toHaveBeenCalledWith('proj-1', {
        page: 1,
      });
      expect(mockClient.teams.listTeamProjectAccessByTeam).toHaveBeenCalledWith('team-1', {
        page: 2,
      });
      expect(mockClient.teams.revokeTeamProjectAccessByProject).toHaveBeenCalledWith(
        'proj-1',
        'team-1',
      );
      expect(mockClient.teams.revokeTeamProjectAccessByTeam).toHaveBeenCalledWith(
        'team-1',
        'proj-1',
      );
    });

    it('should delegate user access and environments operations', async () => {
      (mockClient.users.getUserProjectAccessByProject as jest.Mock).mockResolvedValue({});
      (mockClient.users.addToProject as jest.Mock).mockResolvedValue(undefined);
      (mockClient.users.removeFromProject as jest.Mock).mockResolvedValue(undefined);
      (mockClient.users.updateUserProjectAccessByProject as jest.Mock).mockResolvedValue(undefined);
      (mockClient.users.listProjectUserAccesses as jest.Mock).mockResolvedValue({ items: [] });
      (mockClient.users.listUserProjectAccessByUser as jest.Mock).mockResolvedValue({ items: [] });
      (mockClient.environments.list as jest.Mock).mockResolvedValue([{ name: 'main' }]);

      await projectsTask.getUserProjectAccessByProject('proj-1', 'user-1');
      await projectsTask.grantUserProjectAccessByProject('proj-1', [{ userId: 'user-1' }] as any);
      await projectsTask.revokeUserProjectAccessByProject('proj-1', 'user-1');
      await projectsTask.updateUserProjectAccessByProject('proj-1', 'user-1', {
        permissions: ['admin'],
      } as any);
      await projectsTask.listUserProjectAccessByProject('proj-1', { page: 1 } as any);
      await projectsTask.listUserProjectAccessByUser('user-1', { page: 2 } as any);
      await projectsTask.listEnvironments('proj-1');

      expect(mockClient.users.getUserProjectAccessByProject).toHaveBeenCalledWith(
        'proj-1',
        'user-1',
      );
      expect(mockClient.users.addToProject).toHaveBeenCalledWith('proj-1', [{ userId: 'user-1' }]);
      expect(mockClient.users.removeFromProject).toHaveBeenCalledWith('user-1', 'proj-1');
      expect(mockClient.users.updateUserProjectAccessByProject).toHaveBeenCalledWith(
        'proj-1',
        'user-1',
        { permissions: ['admin'] },
      );
      expect(mockClient.users.listProjectUserAccesses).toHaveBeenCalledWith('proj-1', { page: 1 });
      expect(mockClient.users.listUserProjectAccessByUser).toHaveBeenCalledWith('user-1', {
        page: 2,
      });
      expect(mockClient.environments.list).toHaveBeenCalledWith('proj-1');
    });
  });
});
