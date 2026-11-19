import nock from 'nock';

export function mockOAuth2() {
  return nock('https://auth.upsun.com')
    .post('/oauth2/token')
    .reply(200, {
      access_token: 'mock-token',
      token_type: 'Bearer',
      expires_in: 3600,
    })
    .persist();
}

export function clearOAuthMocks() {
  nock.cleanAll();
}
