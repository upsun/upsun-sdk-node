import { RegionsTask } from '../../../src/core/tasks/regions.js';
import { UpsunClient } from '../../../src/upsun.js';
import { RegionsApi } from '../../../src/api/index.js';

jest.mock('../../../src/upsun.js');
jest.mock('../../../src/api/index.js');

describe('RegionsTask', () => {
  let regionsTask: RegionsTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockRegionsApi: jest.Mocked<RegionsApi>;

  beforeEach(() => {
    mockRegionsApi = {
      getRegion: jest.fn(),
      listRegions: jest.fn(),
    } as any;

    (RegionsApi as jest.MockedClass<typeof RegionsApi>).mockImplementation(() => mockRegionsApi);

    mockClient = {
      apiConfig: { basePath: 'https://api.upsun.com' },
    } as any;

    regionsTask = new RegionsTask(mockClient, mockRegionsApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should have get method defined', () => {
      expect(regionsTask.get).toBeDefined();
      expect(typeof regionsTask.get).toBe('function');
    });

    it('should return a specific region', async () => {
      const mockRegion = { id: 'eu-5.platform.sh', label: 'Europe (Belgium)' };
      mockRegionsApi.getRegion.mockResolvedValue(mockRegion as any);

      const result = await regionsTask.get('eu-5.platform.sh');
      expect(result).toBeDefined();
      expect((result as any).id).toBe('eu-5.platform.sh');
      expect(mockRegionsApi.getRegion).toHaveBeenCalledWith({ regionId: 'eu-5.platform.sh' });
    });

    it('should throw when region ID is empty', async () => {
      await expect(regionsTask.get('')).rejects.toThrow('Project region is required');
    });

    it('should handle API error', async () => {
      mockRegionsApi.getRegion.mockRejectedValue(new Error('Region not found'));
      await expect(regionsTask.get('eu-5.platform.sh')).rejects.toThrow('Region not found');
    });
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(regionsTask.list).toBeDefined();
      expect(typeof regionsTask.list).toBe('function');
    });

    it('should list all regions without filters', async () => {
      const mockResponse = {
        regions: [
          { id: 'eu-5.platform.sh', label: 'Europe (Belgium)' },
          { id: 'us-3.platform.sh', label: 'United States (Virginia)' },
        ],
        count: 2,
      };
      mockRegionsApi.listRegions.mockResolvedValue(mockResponse as any);

      const result = await regionsTask.list();
      expect(result).toBeDefined();
      expect(mockRegionsApi.listRegions).toHaveBeenCalledWith(undefined);
    });

    it('should pass filters to the API', async () => {
      const mockResponse = { regions: [], count: 0 };
      mockRegionsApi.listRegions.mockResolvedValue(mockResponse as any);

      const filters = { available: true } as any;
      await regionsTask.list(filters);
      expect(mockRegionsApi.listRegions).toHaveBeenCalledWith(filters);
    });

    it('should handle API error', async () => {
      mockRegionsApi.listRegions.mockRejectedValue(new Error('Server error'));
      await expect(regionsTask.list()).rejects.toThrow('Server error');
    });
  });
});
