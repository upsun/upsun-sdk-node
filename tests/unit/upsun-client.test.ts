import { UpsunClient, UpsunConfig, DEFAULT_UPSUN_CONFIG } from '../../src/upsun.js';
import nock from 'nock';

describe('UpsunClient', () => {
  let client: UpsunClient;
  
  beforeEach(() => {
    const config: UpsunConfig = {
      ...DEFAULT_UPSUN_CONFIG,
      apiKey: 'test-api-key'
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
      expect(defaultClient.activity).toBeDefined();
      expect(defaultClient.project).toBeDefined();
      expect(defaultClient.environment).toBeDefined();
    });

    it('should initialize with custom config', () => {
      const customConfig: UpsunConfig = {
        base_url: 'https://custom.api.com',
        auth_url: 'https://custom.auth.com',
        apiKey: 'custom-key',
        token_endpoint: 'custom/token',
        refresh_endpoint: 'custom/refresh',
        clientId: 'custom-client'
      };
      
      const customClient = new UpsunClient(customConfig);
      expect(customClient).toBeDefined();
    });
  });

  describe('task initialization', () => {
    it('should initialize all task instances', () => {
      expect(client.activity).toBeDefined();
      expect(client.application).toBeDefined();
      expect(client.backup).toBeDefined();
      expect(client.certificate).toBeDefined();
      expect(client.domain).toBeDefined();
      expect(client.environment).toBeDefined();
      expect(client.metrics).toBeDefined();
      expect(client.mount).toBeDefined();
      expect(client.operation).toBeDefined();
      expect(client.organization).toBeDefined();
      expect(client.project).toBeDefined();
      expect(client.route).toBeDefined();
      expect(client.service).toBeDefined();
      expect(client.sourceOperation).toBeDefined();
      expect(client.team).toBeDefined();
      expect(client.user).toBeDefined();
      expect(client.variable).toBeDefined();
      expect(client.worker).toBeDefined();
      expect(client.resource).toBeDefined();
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
