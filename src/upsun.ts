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
import { InvitationsTask } from './core/tasks/invitations.js';
import { AddOnsApi, ApiTokensApi, AutoscalingApi, CertManagementApi, ConnectionsApi, DeploymentApi, DeploymentTargetApi, DomainManagementApi, EnvironmentActivityApi, EnvironmentApi, EnvironmentBackupsApi, EnvironmentTypeApi, EnvironmentVariablesApi, GrantsApi, InvoicesApi, MfaApi, OrdersApi, OrganizationInvitationsApi, OrganizationMembersApi, OrganizationProjectsApi, OrganizationsApi, PhoneNumberApi, ProfilesApi, ProjectActivityApi, ProjectApi, ProjectInvitationsApi, ProjectSettingsApi, ProjectVariablesApi, RecordsApi, RepositoryApi, RoutingApi, RuntimeOperationsApi, SubscriptionsApi, SystemInformationApi, TeamAccessApi, TeamsApi, ThirdPartyIntegrationsApi, UserAccessApi, UserProfilesApi, UsersApi, VouchersApi } from './index.js';

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
  public invitations: InvitationsTask;
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

    // Initialize the commands tasks.
    this.activities = new ActivitiesTask(
      this,
      new ProjectActivityApi(this.apiConfig),
      new EnvironmentActivityApi(this.apiConfig),
    );
    this.applications = new ApplicationsTask(
      this,
      new DeploymentApi(this.apiConfig),
    );
    this.backups = new BackupsTask(
      this,
      new EnvironmentBackupsApi(this.apiConfig),
    );
    this.certificates = new CertificatesTask(
      this,
      new CertManagementApi(this.apiConfig),
    );
    this.domains = new DomainsTask(
      this,
      new DomainManagementApi(this.apiConfig),
    );
    this.environments = new EnvironmentsTask(
      this,
      new EnvironmentApi(this.apiConfig),
      new EnvironmentTypeApi(this.apiConfig),
      new DeploymentApi(this.apiConfig),
      new AutoscalingApi(this.apiConfig),
    );
    this.invitations = new InvitationsTask(
      this,
      new OrganizationInvitationsApi(this.apiConfig),
      new ProjectInvitationsApi(this.apiConfig),
    );
    this.metrics = new MetricsTask(this);
    this.mounts = new MountsTask(this);
    this.operations = new OperationsTask(
      this,
      new RuntimeOperationsApi(this.apiConfig),
    );
    this.organizations = new OrganizationsTask(
      this,
      new OrganizationsApi(this.apiConfig),
      new OrganizationMembersApi(this.apiConfig),
      new SubscriptionsApi(this.apiConfig),
      new InvoicesApi(this.apiConfig),
      new MfaApi(this.apiConfig),
      new OrdersApi(this.apiConfig),
      new ProfilesApi(this.apiConfig),
      new RecordsApi(this.apiConfig),
      new VouchersApi(this.apiConfig),
      new AddOnsApi(this.apiConfig),
    );
    this.projects = new ProjectsTask(
      this,
      new ProjectApi(this.apiConfig),
      new SubscriptionsApi(this.apiConfig),
      new ProjectSettingsApi(this.apiConfig),
      new DeploymentTargetApi(this.apiConfig),
      new RepositoryApi(this.apiConfig),
      new SystemInformationApi(this.apiConfig),
      new ThirdPartyIntegrationsApi(this.apiConfig),
    );
    this.routes = new RoutesTask(
      this,
      new RoutingApi(this.apiConfig),
    );
    this.services = new ServicesTask(this);
    this.sourceOperations = new SourceOperationsTask(this);
    this.ssh = new SshTask(this);
    this.teams = new TeamsTask(
      this,
      new TeamsApi(this.apiConfig),
      new TeamAccessApi(this.apiConfig),
    );
    this.users = new UsersTask(
      this,
      new UsersApi(this.apiConfig),
      new UserProfilesApi(this.apiConfig), 
      new UserAccessApi(this.apiConfig),
      new ApiTokensApi(this.apiConfig),
      new ConnectionsApi(this.apiConfig),
      new GrantsApi(this.apiConfig),
      new MfaApi(this.apiConfig),
      new PhoneNumberApi(this.apiConfig),
    );
    this.variables = new VariablesTask(
      this,
      new ProjectVariablesApi(this.apiConfig),
      new EnvironmentVariablesApi(this.apiConfig),
    );
    this.workers = new WorkersTask(this);

    this.resources = new ResourcesTask(
      this,
      new DeploymentApi(this.apiConfig),
    );
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
