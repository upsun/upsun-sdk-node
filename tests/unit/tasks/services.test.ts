import { ServicesTask } from '../../../src/core/tasks/services.js';
import { UpsunClient } from '../../../src/upsun.js';

// Mock the UpsunClient
jest.mock('../../../src/upsun');

describe('ServicesTask', () => {
  let serviceTask: ServicesTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    serviceTask = new ServicesTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should have ServiceTask instance defined', () => {
      expect(serviceTask).toBeDefined();
      expect(serviceTask).toBeInstanceOf(ServicesTask);
    });

    it('should inherit from TaskBase', () => {
      expect(serviceTask).toHaveProperty('client');
    });
  });
});
