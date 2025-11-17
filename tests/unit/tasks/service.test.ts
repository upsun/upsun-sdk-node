import { ServiceTask } from '../../../src/core/tasks/service.js';
import { UpsunClient } from '../../../src/upsun.js';

// Mock the UpsunClient
jest.mock('../../../src/upsun');

describe('ServiceTask', () => {
  let serviceTask: ServiceTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    serviceTask = new ServiceTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should have ServiceTask instance defined', () => {
      expect(serviceTask).toBeDefined();
      expect(serviceTask).toBeInstanceOf(ServiceTask);
    });

    it('should inherit from TaskBase', () => {
      expect(serviceTask).toHaveProperty('client');
    });
  });
});
