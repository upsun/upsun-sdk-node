import { TeamsTask } from '../../../src/core/tasks/teams.js';
import { UpsunClient } from '../../../src/upsun.js';

// Mock the UpsunClient
jest.mock('../../../src/upsun');

describe('TeamsTask', () => {
  let teamsTask: TeamsTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    teamsTask = new TeamsTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should have TeamTask instance defined', () => {
      expect(teamsTask).toBeDefined();
      expect(teamsTask).toBeInstanceOf(TeamsTask);
    });

    it('should inherit from TaskBase', () => {
      expect(teamsTask).toHaveProperty('client');
    });
  });
});
