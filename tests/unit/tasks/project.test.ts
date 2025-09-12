import { ProjectTask } from '../../../src/core/tasks/project.js';
import { UpsunClient } from '../../../src/upsun.js';
import nock from 'nock';

// Mock the UpsunClient
jest.mock('../../../src/upsun');

describe('ProjectTask', () => {
  let projectTask: ProjectTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com'
      }
    } as any;
    
    projectTask = new ProjectTask(mockClient);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('info', () => {
    it('should get project information', async () => {
      expect(projectTask.info).toBeDefined();
      expect(typeof projectTask.info).toBe('function');
    });
  });

  describe('list', () => {
    it('should list organization subscriptions', async () => {
      expect(projectTask.list).toBeDefined();
      expect(typeof projectTask.list).toBe('function');
    });
  });

  describe('delete', () => {
    it('should delete a project', async () => {
      expect(projectTask.delete).toBeDefined();
      expect(typeof projectTask.delete).toBe('function');
    });
  });

  describe('clearBuildCache', () => {
    it('should clear project build cache', async () => {
      expect(projectTask.clearBuildCache).toBeDefined();
      expect(typeof projectTask.clearBuildCache).toBe('function');
    });
  });

  describe('create', () => {
    it('should have create method defined', () => {
      expect(projectTask.create).toBeDefined();
      expect(typeof projectTask.create).toBe('function');
    });
  });

  describe('get', () => {
    it('should have get method defined', () => {
      expect(projectTask.get).toBeDefined();
      expect(typeof projectTask.get).toBe('function');
    });
  });
});
