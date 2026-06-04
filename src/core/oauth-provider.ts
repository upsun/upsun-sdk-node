type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // in secondes
  token_type: string;
};

/**
 * OAuth2Client class for handling OAuth2 authentication.
 * This class provides methods for exchanging an API token for an access token,
 * refreshing the access token, and ensuring that the access token is valid.
 * It also provides a method to get the authorization header for API requests.
 *
 * Token lifecycle follows RFC 6749 §6 and RFC 6750 §3.1:
 * - Proactive refresh when token is within the expiry buffer (P3: 120s)
 * - On 401 from the resource server, forceRefresh() re-acquires unconditionally
 *   preferring refresh_token grant over api_token grant (RFC 6749 Fig.2 steps F→G→H)
 * - Concurrent callers share a single in-flight acquisition promise (thundering-herd protection)
 */
export class OAuth2Client {
  private typeToken: string | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0; // timestamp en ms

  /** Deduplicates concurrent token acquisition calls (thundering-herd protection). */
  private pendingToken: Promise<void> | null = null;

  /**
   * Constructor for the OAuth2Client class.
   *
   * @param tokenEndpoint - The endpoint for exchanging the API token for an access token.
   * @param clientId - The client ID for OAuth2 authentication.
   * @param clientSecret - The client secret for OAuth2 authentication.
   * @param refreshEndpoint - Optional separate endpoint for refresh_token grant.
   *                          Defaults to tokenEndpoint when not provided (P4).
   */
  constructor(
    private readonly tokenEndpoint: string,
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly refreshEndpoint: string = tokenEndpoint,
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
    }

    const data: TokenResponse = await response.json();
    this.storeTokenData(data);

    return true;
  }

  /**
   * Forces an unconditional token re-acquisition, bypassing the expiry check.
   *
   * Called by the retry middleware on 401 responses from the resource server
   * (RFC 6750 §3.1: "The client MAY request a new access token and retry").
   * Clears any cached token state so ensureValidToken() always re-acquires.
   * Prefers refresh_token grant over api_token grant (RFC 6749 Fig.2 F→G→H).
   */
  async forceRefresh(): Promise<void> {
    this.accessToken = null;
    this.tokenExpiry = 0;
    // Do NOT clear pendingToken here — if multiple concurrent callers invoke
    // forceRefresh() simultaneously, the first one creates a new pendingToken
    // and all subsequent ones join it, preventing a thundering-herd.
    await this.ensureValidToken();
  }

  /**
   * Gets the authorization header for API requests.
   *
   * @returns {Promise<string>} - Returns a promise that resolves to the authorization header.
   */
  async getAuthorization(): Promise<string> {
    await this.ensureValidToken();

    //TODO use typeToken.
    return `${this.accessToken}`;
  }

  /**
   * Stores the token data in the class properties.
   *
   * @param data - The token response data.
   */
  private storeTokenData(data: TokenResponse): void {
    this.typeToken = data.token_type;
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token ?? null;
    this.tokenExpiry = Date.now() + data.expires_in * 1000;
  }

  /**
   * Refreshes the access token using the refresh_token grant (RFC 6749 §6).
   * Sends the Authorization: Basic header as required for confidential clients (RFC 6749 §3.2.1).
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) throw new Error('No refresh token available');

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.clientId,
    });

    const response = await fetch(this.refreshEndpoint, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa('platform-api-user:'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) throw new Error('Token refresh failed');

    const data: TokenResponse = await response.json();
    this.storeTokenData(data);
  }

  /**
   * Acquires a new token, preferring the refresh_token grant over api_token.
   * This is the internal implementation used by ensureValidToken().
   */
  private async doAcquireToken(): Promise<void> {
    if (this.refreshToken) {
      try {
        await this.refreshAccessToken();
        return;
      } catch {
        // Refresh token is invalid/expired — fall back to full re-exchange
        this.accessToken = null;
        this.refreshToken = null;
      }
    }
    await this.exchangeCodeForToken();
  }

  /**
   * Ensures that the access token is valid and refreshes it if necessary.
   * Uses a shared in-flight promise to deduplicate concurrent calls (thundering-herd protection).
   *
   * Buffer is 120s (P3) to account for clock skew between client and server.
   *
   * @returns {Promise<void>} - Returns a promise that resolves when the token is valid.
   */
  private async ensureValidToken(): Promise<void> {
    const buffer = 120 * 1000;
    if (!this.accessToken || Date.now() > this.tokenExpiry - buffer) {
      if (!this.pendingToken) {
        this.pendingToken = this.doAcquireToken().finally(() => {
          this.pendingToken = null;
        });
      }
      await this.pendingToken;
    }
  }
}
