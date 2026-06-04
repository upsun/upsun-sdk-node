import { OAuth2Client } from '../../../src/core/index.js';
import nock from 'nock';

describe('OAuth2Client', () => {
  let oauth2Client: OAuth2Client;
  const tokenEndpoint = 'https://auth.upsun.com/oauth2/token';
  const clientId = 'test-client-id';
  const apiKey = 'test-api-key';

  beforeEach(() => {
    oauth2Client = new OAuth2Client(tokenEndpoint, clientId, apiKey);
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange authorization code for access token', async () => {
      const mockTokenResponse = {
        access_token: 'access-token-123',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'refresh-token-123',
      };

      nock('https://auth.upsun.com').post('/oauth2/token').reply(200, mockTokenResponse);

      const result = await oauth2Client.exchangeCodeForToken();
      expect(typeof result).toBe('boolean');
    });

    it('should send Authorization: Basic header and include client_id in body', async () => {
      let capturedAuth: string | undefined;
      let capturedBody: string | undefined;
      nock('https://auth.upsun.com')
        .post('/oauth2/token')
        .reply(function (_uri, body) {
          capturedAuth = this.req.headers['authorization'] as string;
          capturedBody = body as string;
          return [200, { access_token: 'tok', token_type: 'Bearer', expires_in: 3600 }];
        });

      await oauth2Client.exchangeCodeForToken();
      expect(capturedAuth).toMatch(/^Basic /);
      expect(capturedBody).toContain('client_id=test-client-id');
      expect(capturedBody).toContain('grant_type=api_token');
    });

    it('should handle token exchange errors', async () => {
      nock('https://auth.upsun.com').post('/oauth2/token').reply(400, {
        error: 'invalid_grant',
        error_description: 'Invalid authorization code',
      });

      await expect(oauth2Client.exchangeCodeForToken()).rejects.toThrow('Token exchange failed');
    });

    it('should handle network errors during token exchange', async () => {
      nock('https://auth.upsun.com').post('/oauth2/token').replyWithError('Network error');

      await expect(oauth2Client.exchangeCodeForToken()).rejects.toThrow('Network error');
    });
  });

  describe('getAuthorization', () => {
    it('should return cached access token if valid', async () => {
      nock('https://auth.upsun.com').post('/oauth2/token').reply(200, {
        access_token: 'cached-token-123',
        token_type: 'Bearer',
        expires_in: 3600,
      });

      await oauth2Client.exchangeCodeForToken();

      // Should return cached token without a new network request
      const token = await oauth2Client.getAuthorization();
      expect(token).toBe('cached-token-123');
      expect(nock.pendingMocks()).toHaveLength(0); // no extra AUTH call
    });

    it('should use refresh_token grant when token is expired (P1)', async () => {
      // Acquire initial token with a refresh_token
      nock('https://auth.upsun.com').post('/oauth2/token').reply(200, {
        access_token: 'initial-token',
        token_type: 'Bearer',
        expires_in: -1, // already expired
        refresh_token: 'my-refresh-token',
      });
      await oauth2Client.exchangeCodeForToken();

      let capturedBody: string | undefined;
      nock('https://auth.upsun.com')
        .post('/oauth2/token')
        .reply(function (_uri, body) {
          capturedBody = body as string;
          return [200, { access_token: 'refreshed-token', token_type: 'Bearer', expires_in: 3600 }];
        });

      const token = await oauth2Client.getAuthorization();
      expect(token).toBe('refreshed-token');
      expect(capturedBody).toContain('grant_type=refresh_token');
      expect(capturedBody).toContain('refresh_token=my-refresh-token');
    });

    it('should send Authorization: Basic header on refresh_token grant (P2)', async () => {
      nock('https://auth.upsun.com').post('/oauth2/token').reply(200, {
        access_token: 'initial-token',
        token_type: 'Bearer',
        expires_in: -1,
        refresh_token: 'my-refresh-token',
      });
      await oauth2Client.exchangeCodeForToken();

      let capturedAuth: string | undefined;
      nock('https://auth.upsun.com')
        .post('/oauth2/token')
        .reply(function () {
          capturedAuth = this.req.headers['authorization'] as string;
          return [200, { access_token: 'refreshed-token', token_type: 'Bearer', expires_in: 3600 }];
        });

      await oauth2Client.getAuthorization();
      expect(capturedAuth).toMatch(/^Basic /);
    });

    it('should fall back to api_token grant when refresh fails', async () => {
      nock('https://auth.upsun.com').post('/oauth2/token').reply(200, {
        access_token: 'initial-token',
        token_type: 'Bearer',
        expires_in: -1,
        refresh_token: 'invalid-refresh-token',
      });
      await oauth2Client.exchangeCodeForToken();

      // First call: failed refresh
      // Second call: successful api_token exchange
      let callCount = 0;
      nock('https://auth.upsun.com')
        .post('/oauth2/token')
        .twice()
        .reply(function (_uri, body) {
          callCount++;
          const b = body as string;
          if (b.includes('refresh_token')) return [400, { error: 'invalid_grant' }];
          return [200, { access_token: 'new-token', token_type: 'Bearer', expires_in: 3600 }];
        });

      const token = await oauth2Client.getAuthorization();
      expect(token).toBe('new-token');
      expect(callCount).toBe(2);
    });
  });

  describe('forceRefresh (P1 — RFC 6749 Fig.2 F→G→H)', () => {
    it('should re-acquire token even when cached token appears valid', async () => {
      // Seed a "valid" token (expires in 1h)
      nock('https://auth.upsun.com').post('/oauth2/token').reply(200, {
        access_token: 'valid-but-server-revoked',
        token_type: 'Bearer',
        expires_in: 3600,
      });
      await oauth2Client.exchangeCodeForToken();

      // forceRefresh must issue a new AUTH call despite the token appearing valid
      nock('https://auth.upsun.com').post('/oauth2/token').reply(200, {
        access_token: 'fresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
      });

      await oauth2Client.forceRefresh();
      const token = await oauth2Client.getAuthorization();
      expect(token).toBe('fresh-token');
    });

    it('should prefer refresh_token grant on forceRefresh when available', async () => {
      nock('https://auth.upsun.com').post('/oauth2/token').reply(200, {
        access_token: 'initial-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'my-refresh-token',
      });
      await oauth2Client.exchangeCodeForToken();

      let capturedBody: string | undefined;
      nock('https://auth.upsun.com')
        .post('/oauth2/token')
        .reply(function (_uri, body) {
          capturedBody = body as string;
          return [200, { access_token: 'force-refreshed', token_type: 'Bearer', expires_in: 3600 }];
        });

      await oauth2Client.forceRefresh();
      expect(capturedBody).toContain('grant_type=refresh_token');
    });

    it('should deduplicate concurrent forceRefresh calls (thundering-herd)', async () => {
      // Seed a valid token to avoid initial exchange
      nock('https://auth.upsun.com').post('/oauth2/token').reply(200, {
        access_token: 'initial',
        token_type: 'Bearer',
        expires_in: 3600,
      });
      await oauth2Client.exchangeCodeForToken();

      let authCallCount = 0;
      nock('https://auth.upsun.com')
        .post('/oauth2/token')
        .reply(200, () => {
          authCallCount++;
          return { access_token: 'deduped-token', token_type: 'Bearer', expires_in: 3600 };
        });

      // Fire 5 concurrent forceRefresh calls
      await Promise.all([
        oauth2Client.forceRefresh(),
        oauth2Client.forceRefresh(),
        oauth2Client.forceRefresh(),
        oauth2Client.forceRefresh(),
        oauth2Client.forceRefresh(),
      ]);

      expect(authCallCount).toBe(1);
    });
  });

  describe('P4 — separate refresh endpoint', () => {
    it('should use refreshEndpoint for refresh_token grant when provided', async () => {
      const refreshEndpoint = 'https://auth.upsun.com/oauth2/refresh';
      const clientWithSeparateRefresh = new OAuth2Client(
        tokenEndpoint,
        clientId,
        apiKey,
        refreshEndpoint,
      );

      // Initial exchange on tokenEndpoint
      nock('https://auth.upsun.com').post('/oauth2/token').reply(200, {
        access_token: 'initial-token',
        token_type: 'Bearer',
        expires_in: -1,
        refresh_token: 'my-refresh-token',
      });
      await clientWithSeparateRefresh.exchangeCodeForToken();

      // Refresh on refreshEndpoint (different path)
      nock('https://auth.upsun.com').post('/oauth2/refresh').reply(200, {
        access_token: 'refreshed-via-separate-endpoint',
        token_type: 'Bearer',
        expires_in: 3600,
      });

      const token = await clientWithSeparateRefresh.getAuthorization();
      expect(token).toBe('refreshed-via-separate-endpoint');
    });
  });

  // ---------------------------------------------------------------------------
  // refreshAccessToken defensive guard (private method, line 121)
  // ---------------------------------------------------------------------------
  describe('refreshAccessToken (defensive guard)', () => {
    it('should throw when called without a stored refresh token', async () => {
      // oauth2Client has no refresh token because no exchange has been performed
      await expect((oauth2Client as any).refreshAccessToken()).rejects.toThrow(
        'No refresh token available',
      );
    });
  });
});
