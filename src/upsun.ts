import {
  // Common
  Configuration,
  ConfigurationParameters,
  HTTPHeaders,
  Middleware,
  OAuth2Client,
  // Tasks
  ActivitiesTask,
  ApplicationsTask,
  BackupsTask,
  CertificatesTask,
  DomainsTask,
  EnvironmentsTask,
  MetricsTask,
  MountsTask,
  OperationsTask,
  OrganizationsTask,
  ProjectsTask,
  ResourcesTask,
  RoutesTask,
  ServicesTask,
  SourceOperationsTask,
  SshTask,
  TeamsTask,
  UsersTask,
  VariablesTask,
  WorkersTask,
} from './core/index.js';
import { IntegrationsTask } from './core/tasks/integrations.js';
import { UsersInvitationsTask } from './core/tasks/users-invitations.js';
import {
  AddOnsApi,
  ApiTokensApi,
  AutoscalingApi,
  CertManagementApi,
  ConnectionsApi,
  DeploymentApi,
  DeploymentTargetApi,
  DomainManagementApi,
  EnvironmentActivityApi,
  EnvironmentApi,
  EnvironmentBackupsApi,
  EnvironmentTypeApi,
  EnvironmentVariablesApi,
  GrantsApi,
  Integrations,
  InvoicesApi,
  MfaApi,
  OrdersApi,
  OrganizationInvitationsApi,
  OrganizationMembersApi,
  OrganizationProjectsApi,
  OrganizationsApi,
  PhoneNumberApi,
  ProfilesApi,
  ProjectActivityApi,
  ProjectApi,
  ProjectInvitationsApi,
  ProjectSettingsApi,
  ProjectVariablesApi,
  RecordsApi,
  RepositoryApi,
  RoutingApi,
  RuntimeOperationsApi,
  SourceOperationsApi,
  SshKeysApi,
  SubscriptionsApi,
  SystemInformationApi,
  TeamAccessApi,
  TeamsApi,
  ThirdPartyIntegrationsApi,
  UserAccessApi,
  UserProfilesApi,
  UsersApi,
  VouchersApi,
} from './index.js';

/**
 * Configuration interface for the Upsun API client.
 * This interface defines the structure of the configuration object
 * that is used to initialize the UpsunClient.
 *
 * @interface UpsunConfig
 * @property {string} base_url - The base URL for the Upsun API.
 * @property {string} auth_url - The authentication URL for the Upsun API.
 * @property {string} apiKey - The API key for authentication.
 * @property {string} token_endpoint - The endpoint for obtaining access tokens.
 * @property {string} refresh_endpoint - The endpoint for refreshing access tokens.
 * @property {string} clientId - The client ID for OAuth2 authentication.
 */
export interface UpsunConfig {
  base_url: string;
  auth_url: string;
  apiKey?: string;
  token_endpoint: string;
  refresh_endpoint: string;
  clientId: string;
}

/**
 * Default configuration for the Upsun API client.
 * This object provides default values for the configuration properties
 * defined in the UpsunConfig interface.
 */
export const DEFAULT_UPSUN_CONFIG: UpsunConfig = {
  base_url: 'https://api.upsun.com', // Default base URL for the Upsun API
  auth_url: 'https://auth.upsun.com', // Default authentication URL for the Upsun API
  token_endpoint: 'oauth2/token',
  refresh_endpoint: 'oauth2/token',
  clientId: 'sdk-node-client-id',
};

/**
 * UpsunClient class for interacting with the Upsun API.
 * This class provides methods for authentication and accessing various API endpoints.
 * It uses the OAuth2Client for handling authentication.
 */
export class UpsunClient {
  // Configuration for the Upsun API client.
  protected upsunConfig: UpsunConfig;
  public apiConfig: Configuration;
  protected auth?: OAuth2Client;
  protected accessToken?: string;
  protected userId!: string;

  // Facades - Tasks.
  public activities: ActivitiesTask;
  public applications: ApplicationsTask;
  public backups: BackupsTask;
  public certificates: CertificatesTask;
  public domains: DomainsTask;
  public environments: EnvironmentsTask;
  public integrations: IntegrationsTask;
  public invitations: UsersInvitationsTask;
  public metrics: MetricsTask;
  public mounts: MountsTask;
  public operations: OperationsTask;
  public organizations: OrganizationsTask;
  public projects: ProjectsTask;
  public routes: RoutesTask;
  public services: ServicesTask;
  public sourceOperations: SourceOperationsTask;
  public ssh: SshTask;
  public teams: TeamsTask;
  public users: UsersTask;
  public variables: VariablesTask;
  public workers: WorkersTask;

  public resources: ResourcesTask;

  private authMiddleware: Middleware;

  /**
   * Constructor for the UpsunClient class.
   *
   * @param config - Configuration object for the Upsun API client.
   */
  constructor(config: UpsunConfig = DEFAULT_UPSUN_CONFIG) {
    this.upsunConfig = {
      ...DEFAULT_UPSUN_CONFIG,
      ...config,
    };

    if (this.upsunConfig.apiKey) {
      this.auth = new OAuth2Client(
        `${this.upsunConfig.auth_url}/${this.upsunConfig.token_endpoint}`,
        this.upsunConfig.clientId,
        this.upsunConfig.apiKey,
      );
    }

    this.authMiddleware = this.createAuthRetryMiddleware();

    const param: ConfigurationParameters = {
      basePath: this.upsunConfig.base_url,
      accessToken: this.getToken.bind(this),
      middleware: [this.authMiddleware],
    };
    this.apiConfig = new Configuration(param);

    // Init API classes only once
    const addOnsApi = new AddOnsApi(this.apiConfig);
    const autoscalingApi = new AutoscalingApi(this.apiConfig);
    const apiTokensApi = new ApiTokensApi(this.apiConfig);
    const certManagementApi = new CertManagementApi(this.apiConfig);
    const connectionsApi = new ConnectionsApi(this.apiConfig);
    const deploymentApi = new DeploymentApi(this.apiConfig);
    const deploymentTargetApi = new DeploymentTargetApi(this.apiConfig);
    const domainManagementApi = new DomainManagementApi(this.apiConfig);
    const environmentApi = new EnvironmentApi(this.apiConfig);
    const environmentBackupsApi = new EnvironmentBackupsApi(this.apiConfig);
    const environmentTypeApi = new EnvironmentTypeApi(this.apiConfig);
    const environmentVariablesApi = new EnvironmentVariablesApi(this.apiConfig);
    const grantsApi = new GrantsApi(this.apiConfig);
    const invoicesApi = new InvoicesApi(this.apiConfig);
    const mfaApi = new MfaApi(this.apiConfig);
    const ordersApi = new OrdersApi(this.apiConfig);
    const organizationInvitationsApi = new OrganizationInvitationsApi(this.apiConfig);
    const organizationMembersApi = new OrganizationMembersApi(this.apiConfig);
    const organizationProjectsApi = new OrganizationProjectsApi(this.apiConfig);
    const organizationsApi = new OrganizationsApi(this.apiConfig);
    const phoneNumberApi = new PhoneNumberApi(this.apiConfig);
    const profilesApi = new ProfilesApi(this.apiConfig);
    const projectApi = new ProjectApi(this.apiConfig);
    const projectInvitationsApi = new ProjectInvitationsApi(this.apiConfig);
    const projectSettingsApi = new ProjectSettingsApi(this.apiConfig);
    const projectVariablesApi = new ProjectVariablesApi(this.apiConfig);
    const recordsApi = new RecordsApi(this.apiConfig);
    const repositoryApi = new RepositoryApi(this.apiConfig);
    const routingApi = new RoutingApi(this.apiConfig);
    const runtimeOperationsApi = new RuntimeOperationsApi(this.apiConfig);
    const sourceOperationsApi = new SourceOperationsApi(this.apiConfig);
    const subscriptionsApi = new SubscriptionsApi(this.apiConfig);
    const sshKeysApi = new SshKeysApi(this.apiConfig);
    const systemInformationApi = new SystemInformationApi(this.apiConfig);
    const teamAccessApi = new TeamAccessApi(this.apiConfig);
    const teamsApi = new TeamsApi(this.apiConfig);
    const thirdPartyIntegrationsApi = new ThirdPartyIntegrationsApi(this.apiConfig);
    const userAccessApi = new UserAccessApi(this.apiConfig);
    const userProfilesApi = new UserProfilesApi(this.apiConfig);
    const usersApi = new UsersApi(this.apiConfig);
    const vouchersApi = new VouchersApi(this.apiConfig);
    
    // Initialize the commands tasks.
    this.activities = new ActivitiesTask(
      this,
      new ProjectActivityApi(this.apiConfig),
      new EnvironmentActivityApi(this.apiConfig),
    );
    this.applications = new ApplicationsTask(this);
    this.backups = new BackupsTask(this, environmentBackupsApi);
    this.certificates = new CertificatesTask(this, certManagementApi);
    this.domains = new DomainsTask(this, domainManagementApi);
    this.environments = new EnvironmentsTask(
      this,
      environmentApi,
      environmentTypeApi,
      deploymentApi,
    );
    this.integrations = new IntegrationsTask(this, thirdPartyIntegrationsApi);
    this.invitations = new UsersInvitationsTask(
      this,
      organizationInvitationsApi,
      projectInvitationsApi,
    );
    this.metrics = new MetricsTask(this);
    this.mounts = new MountsTask(this);
    this.operations = new OperationsTask(this, runtimeOperationsApi);
    this.organizations = new OrganizationsTask(
      this,
      organizationsApi,
      organizationMembersApi,
      subscriptionsApi,
      invoicesApi,
      mfaApi,
      ordersApi,
      profilesApi,
      recordsApi,
      vouchersApi,
      addOnsApi,
    );
    this.projects = new ProjectsTask(
      this,
      projectApi,
      organizationProjectsApi,
      subscriptionsApi,
      projectSettingsApi,
      repositoryApi,
      systemInformationApi,
    );
    this.resources = new ResourcesTask(this, deploymentApi, autoscalingApi);    
    this.routes = new RoutesTask(this, routingApi);
    this.services = new ServicesTask(this);
    this.sourceOperations = new SourceOperationsTask(this, sourceOperationsApi);
    this.ssh = new SshTask(this, sshKeysApi);
    this.teams = new TeamsTask(
      this,
      teamsApi,
      teamAccessApi,
    );
    this.users = new UsersTask(
      this,
      usersApi,
      userProfilesApi,
      userAccessApi,
      apiTokensApi,
      connectionsApi,
      grantsApi,
      mfaApi,
      phoneNumberApi,
    );
    this.variables = new VariablesTask(
      this,
      projectVariablesApi,
      environmentVariablesApi,
    );
    this.workers = new WorkersTask(this);
  }

  private createAuthRetryMiddleware(): Middleware {
    type RetryableInit = RequestInit & { __upsunRetry?: boolean };

    return {
      post: async ({ fetch, url, init, response }): Promise<Response> => {
        if (response.status !== 401) {
          return response;
        }
        const retryInit: RetryableInit = {
          ...(init || {}),
          __upsunRetry: (init as RetryableInit)?.__upsunRetry,
        };
        if (retryInit.__upsunRetry) {
          return response;
        }
        retryInit.__upsunRetry = true;
        if (!this.auth) {
          return response;
        }
        await this.auth.exchangeCodeForToken();
        const token = await this.getToken();
        retryInit.headers = {
          ...this.cloneHeaders(init.headers),
          Authorization: `Bearer ${token}`,
        };
        return fetch(url, retryInit);
      },
    };
  }

  private cloneHeaders(headers?: HeadersInit): HTTPHeaders {
    const normalized: HTTPHeaders = {};
    if (!headers) {
      return normalized;
    }
    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        normalized[key] = value;
      });
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        normalized[key] = value;
      });
    } else {
      Object.assign(normalized, headers);
    }
    return normalized;
  }

  /**
   * Authenticate the client using OAuth2.
   *
   * This method exchanges the authorization code for an access token.
   * It uses the OAuth2Client to handle the authentication flow.
   * The access token is then used to authenticate API requests.
   * @returns {Promise<boolean>} - Returns true if authentication is successful, false otherwise.
   */
  async authenticate(): Promise<boolean> {
    if (!this.auth) {
      throw new Error('API Key is not defined. Cannot authenticate.');
    }
    return await this.auth.exchangeCodeForToken();
  }

  async getUserId(): Promise<string | undefined> {
    if (this.userId == null) {
      this.userId = (await this.users.me()).id;
    }

    return this.userId;
  }

  setBearerToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Get the access token for authentication.
   */
  public async getToken(name?: string, scopes?: string[]): Promise<string> {
    if (this.auth) {
      return await this.auth.getAuthorization();
    } else if (this.accessToken) {
      return `${this.accessToken}`;
    } else {
      throw new Error(
        'No authentication method available. Please provide an API key or set a bearer token.',
      );
    }
  }
}
