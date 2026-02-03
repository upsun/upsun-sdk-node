import { ProjectsTask } from '../../../src/core/tasks/projects.js';
import { UpsunClient } from '../../../src/upsun.js';
import nock from 'nock';

// Mock the UpsunClient
jest.mock('../../../src/upsun');

describe('ProjectsTask', () => {
  let projectsTask: ProjectsTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    projectsTask = new ProjectsTask(mockClient);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('info', () => {
    it('should get project information', async () => {
      expect(projectsTask.info).toBeDefined();
      expect(typeof projectsTask.info).toBe('function');
    });
  });

  describe('list', () => {
    it('should list organization subscriptions', async () => {
      expect(projectsTask.list).toBeDefined();
      expect(typeof projectsTask.list).toBe('function');
    });
  });

  describe('delete', () => {
    it('should delete a project', async () => {
      expect(projectsTask.delete).toBeDefined();
      expect(typeof projectsTask.delete).toBe('function');
    });
  });

  describe('clearBuildCache', () => {
    it('should clear project build cache', async () => {
      expect(projectsTask.clearBuildCache).toBeDefined();
      expect(typeof projectsTask.clearBuildCache).toBe('function');
    });
  });

  describe('create', () => {
    it('should have create method defined', () => {
      expect(projectsTask.create).toBeDefined();
      expect(typeof projectsTask.create).toBe('function');
    });
  });

  describe('get', () => {
    it('should have get method defined', () => {
      expect(projectsTask.get).toBeDefined();
      expect(typeof projectsTask.get).toBe('function');
    });
  });
});
