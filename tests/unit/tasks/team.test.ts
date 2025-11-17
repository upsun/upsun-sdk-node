import { TeamTask } from '../../../src/core/tasks/team.js';
import { UpsunClient } from '../../../src/upsun.js';

// Mock the UpsunClient
jest.mock('../../../src/upsun');

describe('TeamTask', () => {
  let teamTask: TeamTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    teamTask = new TeamTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should have TeamTask instance defined', () => {
      expect(teamTask).toBeDefined();
      expect(teamTask).toBeInstanceOf(TeamTask);
    });

    it('should inherit from TaskBase', () => {
      expect(teamTask).toHaveProperty('client');
    });
  });
});
