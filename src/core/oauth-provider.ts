type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number; // en secondes
  token_type: string;
};

/**
 * OAuth2Client class for handling OAuth2 authentication.
 * This class provides methods for exchanging an API token for an access token,
 * refreshing the access token, and ensuring that the access token is valid.
 * It also provides a method to get the authorization header for API requests.
 */
export class OAuth2Client {
  private typeToken: string | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0; // timestamp en ms

  /**
   * Constructor for the OAuth2Client class.
   *
   * @param tokenEndpoint - The endpoint for exchanging the API token for an access token.
   * @param clientId - The client ID for OAuth2 authentication.
   * @param clientSecret - The client secret for OAuth2 authentication.
   */
  constructor(
    private readonly tokenEndpoint: string,
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {}

  /**
   * Exchanges the API token for an access token.
   *
   * @returns {Promise<boolean>} - Returns true if the exchange was successful, false otherwise.
   */
  async exchangeCodeForToken(): Promise<boolean> {
    const params = new URLSearchParams({
      grant_type: 'api_token',
      api_token: this.clientSecret,
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa('platform-api-user:'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error('Token exchange failed');
      return false;
    }

    const data: TokenResponse = await response.json();
    this.storeTokenData(data);

    return true;
  }

  /**
   * Stores the token data in the class properties.
   *
   * @param data - The token response data.
   */
  private storeTokenData(data: TokenResponse): void {
    this.typeToken = data.token_type;
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000;
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) throw new Error('No refresh token available');

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.clientId,
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) throw new Error('Token refresh failed');

    const data: TokenResponse = await response.json();
    this.storeTokenData(data);
  }

  /**
   * Ensures that the access token is valid and refreshes it if necessary.
   *
   * @returns {Promise<void>} - Returns a promise that resolves when the token is valid.
   */
  private async ensureValidToken(): Promise<void> {
    const buffer = 60 * 1000;
    if (!this.accessToken || Date.now() > this.tokenExpiry - buffer) {
      //await this.refreshAccessToken();
      await this.exchangeCodeForToken();
    }
  }

  /**
   * Gets the authorization header for API requests.
   *
   * @returns {Promise<string>} - Returns a promise that resolves to the authorization header.
   */
  async getAuthorization(): Promise<string> {
    await this.ensureValidToken();

    //TODO use typeToken.
    return `Bearer ${this.accessToken}`;
  }
}
