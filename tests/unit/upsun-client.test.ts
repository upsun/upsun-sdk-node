import { UpsunClient, UpsunConfig, DEFAULT_UPSUN_CONFIG } from '../../src/upsun.js';
import nock from 'nock';

describe('UpsunClient', () => {
  let client: UpsunClient;

  beforeEach(() => {
    const config: UpsunConfig = {
      ...DEFAULT_UPSUN_CONFIG,
      apiKey: 'test-api-key',
    };
    client = new UpsunClient(config);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const defaultClient = new UpsunClient();
      expect(defaultClient).toBeDefined();
      expect(defaultClient.activities).toBeDefined();
      expect(defaultClient.projects).toBeDefined();
      expect(defaultClient.environments).toBeDefined();
    });

    it('should initialize with custom config', () => {
      const customConfig: UpsunConfig = {
        base_url: 'https://custom.api.com',
        auth_url: 'https://custom.auth.com',
        apiKey: 'custom-key',
        token_endpoint: 'custom/token',
        refresh_endpoint: 'custom/refresh',
        clientId: 'custom-client',
      };

      const customClient = new UpsunClient(customConfig);
      expect(customClient).toBeDefined();
    });
  });

  describe('task initialization', () => {
    it('should initialize all task instances', () => {
      expect(client.activities).toBeDefined();
      expect(client.applications).toBeDefined();
      expect(client.backups).toBeDefined();
      expect(client.certificates).toBeDefined();
      expect(client.domains).toBeDefined();
      expect(client.environments).toBeDefined();
      expect(client.metrics).toBeDefined();
      expect(client.mounts).toBeDefined();
      expect(client.operations).toBeDefined();
      expect(client.organizations).toBeDefined();
      expect(client.projects).toBeDefined();
      expect(client.routes).toBeDefined();
      expect(client.services).toBeDefined();
      expect(client.sourceOperations).toBeDefined();
      expect(client.teams).toBeDefined();
      expect(client.users).toBeDefined();
      expect(client.variables).toBeDefined();
      expect(client.workers).toBeDefined();
      expect(client.resources).toBeDefined();
    });
  });

  describe('authentication', () => {
    it('should have authenticate method', () => {
      expect(typeof client.authenticate).toBe('function');
    });

    it('should have getUserId method', () => {
      expect(typeof client.getUserId).toBe('function');
    });
  });

  // ---------------------------------------------------------------------------
  // createAuthRetryMiddleware — RFC 6750 §3.1 P1 fix
  // ---------------------------------------------------------------------------
  describe('createAuthRetryMiddleware', () => {
    const AUTH_URL = 'https://auth.upsun.com';
    const API_URL = 'https://api.upsun.com';
    const TOKEN_PATH = '/oauth2/token';
    const ME_PATH = '/users/me';

    const mockUser = { id: 'test-user-id' };
    const tokenReply = (token: string) => ({
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600,
    });

    it('should pass through non-401 responses without retry', async () => {
      nock(AUTH_URL).post(TOKEN_PATH).reply(200, tokenReply('token-1'));
      nock(API_URL).get(ME_PATH).reply(200, mockUser);

      const result = await client.users.me();
      expect(result.id).toBe('test-user-id');
      expect(nock.pendingMocks()).toHaveLength(0);
    });

    it('should call forceRefresh and retry with new token after 401 (P1 fix)', async () => {
      // Initial token acquisition
      nock(AUTH_URL).post(TOKEN_PATH).reply(200, tokenReply('token-1'));
      // First API call → 401 (expired / revoked token)
      nock(API_URL).get(ME_PATH).reply(401, { error: 'invalid_token' });
      // forceRefresh() re-acquires a new token
      nock(AUTH_URL).post(TOKEN_PATH).reply(200, tokenReply('token-2'));
      // Retry with new token → success
      nock(API_URL).get(ME_PATH).reply(200, mockUser);

      const result = await client.users.me();
      expect(result.id).toBe('test-user-id');
      expect(nock.pendingMocks()).toHaveLength(0);
    });

    it('should not retry a second time when __upsunRetry guard is set', async () => {
      nock(AUTH_URL).post(TOKEN_PATH).reply(200, tokenReply('token-1'));
      nock(API_URL).get(ME_PATH).reply(401, { error: 'invalid_token' });
      // forceRefresh is called once
      nock(AUTH_URL).post(TOKEN_PATH).reply(200, tokenReply('token-2'));
      // Retry still returns 401 — must not loop again
      nock(API_URL).get(ME_PATH).reply(401, { error: 'invalid_token' });

      await expect(client.users.me()).rejects.toThrow();
      expect(nock.pendingMocks()).toHaveLength(0);
    });

    it('should return 401 without retry in Bearer-only mode (no auth client)', async () => {
      const bearerClient = new UpsunClient();
      bearerClient.setBearerToken('static-bearer-token');

      // Only one request — no retry, no auth call
      nock(API_URL).get(ME_PATH).reply(401, { error: 'invalid_token' });

      await expect(bearerClient.users.me()).rejects.toThrow();
      expect(nock.pendingMocks()).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // getUserId
  // ---------------------------------------------------------------------------
  describe('getUserId', () => {
    it('should fetch user ID from API and cache it for subsequent calls', async () => {
      nock('https://auth.upsun.com').post('/oauth2/token').reply(200, {
        access_token: 'token-1',
        token_type: 'Bearer',
        expires_in: 3600,
      });
      nock('https://api.upsun.com').get('/users/me').reply(200, { id: 'user-abc' });

      const userId = await client.getUserId();
      expect(userId).toBe('user-abc');

      // Second call must use the cached value — no new network request
      const cachedId = await client.getUserId();
      expect(cachedId).toBe('user-abc');
      expect(nock.pendingMocks()).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // getToken
  // ---------------------------------------------------------------------------
  describe('getToken', () => {
    it('should return bearer token when set via setBearerToken', async () => {
      const unauthClient = new UpsunClient();
      unauthClient.setBearerToken('my-bearer-token');

      const token = await (unauthClient as any).getToken();
      expect(token).toBe('my-bearer-token');
    });

    it('should throw when neither apiKey nor bearer token is configured', async () => {
      const unauthClient = new UpsunClient();

      await expect((unauthClient as any).getToken()).rejects.toThrow(
        'No authentication method available',
      );
    });
  });

  // ---------------------------------------------------------------------------
  // authenticate
  // ---------------------------------------------------------------------------
  describe('authenticate', () => {
    it('should throw when no API key is configured', async () => {
      const unauthClient = new UpsunClient();

      await expect(unauthClient.authenticate()).rejects.toThrow('API Key is not defined');
    });

    it('should return true on successful token exchange', async () => {
      nock('https://auth.upsun.com').post('/oauth2/token').reply(200, {
        access_token: 'fresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
      });

      await expect(client.authenticate()).resolves.toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // cloneHeaders (private — tests via cast to any)
  // ---------------------------------------------------------------------------
  describe('cloneHeaders', () => {
    it('should return empty object when headers is undefined', () => {
      const result = (client as any).cloneHeaders(undefined);
      expect(result).toEqual({});
    });

    it('should clone a Headers instance (keys normalised to lower-case)', () => {
      const headers = new Headers({ 'Content-Type': 'application/json', 'X-Custom': 'value' });
      const result = (client as any).cloneHeaders(headers);
      expect(result['content-type']).toBe('application/json');
      expect(result['x-custom']).toBe('value');
    });

    it('should clone an array of [key, value] header pairs', () => {
      const headers: [string, string][] = [
        ['Authorization', 'Bearer test'],
        ['Accept', 'application/json'],
      ];
      const result = (client as any).cloneHeaders(headers);
      expect(result).toEqual({ Authorization: 'Bearer test', Accept: 'application/json' });
    });

    it('should clone a plain-object header map', () => {
      const headers = { Authorization: 'Bearer test', 'Content-Type': 'application/json' };
      const result = (client as any).cloneHeaders(headers);
      expect(result).toEqual({ Authorization: 'Bearer test', 'Content-Type': 'application/json' });
    });
  });
});
