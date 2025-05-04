import { Configuration, ConfigurationParameters } from "./apis-gen/index.js";
import { OAuth2Client } from "./core/index.js";
import { Environements } from "./core/tasks/environments.js";
import { Projects } from "./core/tasks/projects.js";

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
  apiKey: string;
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
  base_url: "https://api.upsun.com", // Default base URL for the Upsun API
  auth_url: "https://auth.upsun.com", // Default authentication URL for the Upsun API
  apiKey: "UPSUN_CLI_TOKEN is not define !",
  token_endpoint: "oauth2/token",
  refresh_endpoint: "oauth2/token",
  clientId: "sdk-node-client-id",
}

/**
 * UpsunClient class for interacting with the Upsun API.
 * This class provides methods for authentication and accessing various API endpoints.
 * It uses the OAuth2Client for handling authentication.
 */
export class UpsunClient {

  // Configuration for the Upsun API client.
  protected upsunConfig: UpsunConfig;
  public apiConfig: Configuration;
  protected auth: OAuth2Client;

  // Facades - Tasks.
  public projects: Projects;
  public environments: Environements;


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

    // Initialize the API configuration with the base URL and access token.
    // The access token is obtained through the getToken method.
    // The getToken method is bound to the current instance of the UpsunClient.
    const param: ConfigurationParameters = {
      basePath: this.upsunConfig.base_url,
      accessToken: this.getToken.bind(this),
    };
    this.apiConfig = new Configuration(param);

    // Initialize the OAuth2Client with the authentication URL, client ID, and API key.
    // The OAuth2Client is responsible for handling the OAuth2 authentication flow.
    // The auth_url is used to obtain the access token, and the clientId and apiKey are used for authentication.
    this.auth = new OAuth2Client(
      `${this.upsunConfig.auth_url}/${this.upsunConfig.token_endpoint}`,
      this.upsunConfig.clientId,
      this.upsunConfig.apiKey,
    );

    // Initialize the commands tasks.
    this.projects = new Projects(this);
    this.environments = new Environements(this);
  }

  /**
   * Authenticate the client using OAuth2.
   * 
   * This method exchanges the authorization code for an access token.
   * It uses the OAuth2Client to handle the authentication flow.
   * The access token is then used to authenticate API requests.
   * @returns {Promise<boolean>} - Returns true if authentication is successful, false otherwise.
   */
  async authenticate() {
    return await this.auth.exchangeCodeForToken();
  }

  /**
   * Get the access token for authentication.
   */
  protected async getToken(name?: string, scopes?: string[]): Promise<string> {
    return await this.auth.getAuthorization()
  }

}
