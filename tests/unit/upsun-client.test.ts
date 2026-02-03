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
});
