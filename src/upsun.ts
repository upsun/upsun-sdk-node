import {
  // Common
  Configuration,
  ConfigurationParameters,
  HTTPHeaders,
  Middleware,
  OAuth2Client,
  // Tasks
  ActivityTask,
  ApplicationTask,
  BackupTask,
  CertificateTask,
  DomainTask,
  EnvironementTask,
  MetricsTask,
  MountTask,
  OperationTask,
  OrganizationTask,
  ProjectTask,
  ResourcesTask,
  RouteTask,
  ServiceTask,
  SourceOperationTask,
  SshTask,
  TeamTask,
  UserTask,
  VariableTask,
  WorkerTask,
} from './core/index.js';

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
  public activity: ActivityTask;
  public application: ApplicationTask;
  public backup: BackupTask;
  public certificate: CertificateTask;
  public domain: DomainTask;
  public environment: EnvironementTask;
  public metrics: MetricsTask;
  public mount: MountTask;
  public operation: OperationTask;
  public organization: OrganizationTask;
  public project: ProjectTask;
  public route: RouteTask;
  public service: ServiceTask;
  public sourceOperation: SourceOperationTask;
  public ssh: SshTask;
  public team: TeamTask;
  public user: UserTask;
  public variable: VariableTask;
  public worker: WorkerTask;

  public resource: ResourcesTask;

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
    this.activity = new ActivityTask(this);
    this.application = new ApplicationTask(this);
    this.backup = new BackupTask(this);
    this.certificate = new CertificateTask(this);
    this.domain = new DomainTask(this);
    this.environment = new EnvironementTask(this);
    this.metrics = new MetricsTask(this);
    this.mount = new MountTask(this);
    this.operation = new OperationTask(this);
    this.organization = new OrganizationTask(this);
    this.project = new ProjectTask(this);
    this.route = new RouteTask(this);
    this.service = new ServiceTask(this);
    this.sourceOperation = new SourceOperationTask(this);
    this.ssh = new SshTask(this);
    this.team = new TeamTask(this);
    this.user = new UserTask(this);
    this.variable = new VariableTask(this);
    this.worker = new WorkerTask(this);

    this.resource = new ResourcesTask(this);
  }

  private createAuthRetryMiddleware(): Middleware {
    type RetryableInit = RequestInit & { __upsunRetry?: boolean };

    return {
      post: async ({ fetch, url, init, response }) => {
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
        console.log('[UpsunClient] refreshing authentication after 401 response');
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
      this.userId = (await this.user.me()).id;
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
