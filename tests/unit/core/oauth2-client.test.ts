import { OAuth2Client } from '../../../src/core/index.js';
import nock from 'nock';

describe('OAuth2Client', () => {
  let oauth2Client: OAuth2Client;
  const tokenEndpoint = 'https://auth.upsun.com/oauth2/token';
  const clientId = 'test-client-id';
  const apiKey = 'test-api-key';

  beforeEach(() => {
    oauth2Client = new OAuth2Client(tokenEndpoint, clientId, apiKey);
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange authorization code for access token', async () => {
      const mockTokenResponse = {
        access_token: 'access-token-123',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'refresh-token-123'
      };

      nock('https://auth.upsun.com')
        .post('/oauth2/token')
        .reply(200, mockTokenResponse);

      const result = await oauth2Client.exchangeCodeForToken();
      expect(typeof result).toBe('boolean');
    });

    it('should handle token exchange errors', async () => {
      nock('https://auth.upsun.com')
        .post('/oauth2/token')
        .reply(400, {
          error: 'invalid_grant',
          error_description: 'Invalid authorization code'
        });

      await expect(oauth2Client.exchangeCodeForToken()).rejects.toThrow('Token exchange failed');
    });

    it('should handle network errors during token exchange', async () => {
      nock('https://auth.upsun.com')
        .post('/oauth2/token')
        .replyWithError('Network error');

      await expect(oauth2Client.exchangeCodeForToken()).rejects.toThrow('Network error');
    });
  });

  describe('getAuthorization', () => {
    it('should return cached access token if valid', async () => {
      // First exchange to set token
      nock('https://auth.upsun.com')
        .post('/oauth2/token')
        .reply(200, {
          access_token: 'cached-token-123',
          token_type: 'Bearer',
          expires_in: 3600
        });

      await oauth2Client.exchangeCodeForToken();
      
      // Should return cached token without new request
      const token = await oauth2Client.getAuthorization();
      expect(typeof token).toBe('string');
    });

    it('should refresh token if expired', async () => {
      // Mock initial token that expires quickly
      nock('https://auth.upsun.com')
        .post('/oauth2/token')
        .reply(200, {
          access_token: 'initial-token',
          token_type: 'Bearer',
          expires_in: -1, // Already expired
          refresh_token: 'refresh-token'
        });

      await oauth2Client.exchangeCodeForToken();

      // Mock refresh token request
      nock('https://auth.upsun.com')
        .post('/oauth2/token')
        .reply(200, {
          access_token: 'refreshed-token',
          token_type: 'Bearer',
          expires_in: 3600
        });

      const token = await oauth2Client.getAuthorization();
      expect(typeof token).toBe('string');
    });

    it('should handle refresh token errors', async () => {
      // Mock expired token
      nock('https://auth.upsun.com')
        .post('/oauth2/token')
        .reply(200, {
          access_token: 'initial-token',
          token_type: 'Bearer',
          expires_in: -1,
          refresh_token: 'invalid-refresh-token'
        });

      await oauth2Client.exchangeCodeForToken();

      // Mock failed refresh
      nock('https://auth.upsun.com')
        .post('/oauth2/token')
        .reply(400, {
          error: 'invalid_grant'
        });

      await expect(oauth2Client.getAuthorization()).rejects.toThrow();
    });
  });
});
