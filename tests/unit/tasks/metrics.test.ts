import { MetricsTask } from '../../../src/core/tasks/metrics.js';
import { UpsunClient } from '../../../src/upsun.js';

jest.mock('../../../src/upsun.js');

describe('MetricsTask', () => {
  let metricsTask: MetricsTask;
  let mockClient: jest.Mocked<UpsunClient>;

  beforeEach(() => {
    mockClient = {
      apiConfig: { basePath: 'https://api.upsun.com' },
      getToken: jest.fn().mockResolvedValue('Bearer mock-token'),
    } as any;

    metricsTask = new MetricsTask(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('fetchMetrics', () => {
    it('should have fetchMetrics method defined', () => {
      expect(metricsTask.fetchMetrics).toBeDefined();
      expect(typeof metricsTask.fetchMetrics).toBe('function');
    });

    it('should return parsed metrics from a successful response', async () => {
      const line1 = JSON.stringify({ metric: 'cpu.max', value: 1.5 });
      const line2 = JSON.stringify({ metric: 'cpu.max', value: 2.0 });
      const responseText = `${line1}\n${line2}\n`;

      const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(responseText),
      } as any);

      const result = await metricsTask.fetchMetrics('proj-1', 'main', 'eu-3');

      expect(result).toHaveLength(2);
      expect((result[0] as any).metric).toBe('cpu.max');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://metrics-proj-1.eu-3.platformsh.site/v1/metrics/query',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token',
          }),
        }),
      );
    });

    it('should ignore empty lines in the response', async () => {
      const line1 = JSON.stringify({ metric: 'cpu.max', value: 1.0 });
      const responseText = `${line1}\n\n\n`;

      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(responseText),
      } as any);

      const result = await metricsTask.fetchMetrics('proj-1', 'main', 'eu-3');
      expect(result).toHaveLength(1);
    });

    it('should return an empty array when response body is empty', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(''),
      } as any);

      const result = await metricsTask.fetchMetrics('proj-1', 'main', 'eu-3');
      expect(result).toEqual([]);
    });

    it('should throw when the response is not ok', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as any);

      await expect(metricsTask.fetchMetrics('proj-1', 'main', 'eu-3')).rejects.toThrow(
        'Fetch failed: 403 Forbidden',
      );
    });

    it('should skip lines that are not valid JSON and continue', async () => {
      const goodLine = JSON.stringify({ metric: 'cpu.max', value: 1.0 });
      const badLine = 'not-json';
      const responseText = `${goodLine}\n${badLine}\n`;
      //const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(responseText),
      } as any);

      const result = await metricsTask.fetchMetrics('proj-1', 'main', 'eu-3');
      // The bad line is silently swallowed; only the good line should be returned
      expect(result).toHaveLength(1);
      // expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
