import { ObservabilityTask } from '../../../src/core/tasks/observability.js';
import { UpsunClient } from '../../../src/upsun.js';
import { Configuration } from '../../../src/core/runtime.js';

jest.mock('../../../src/upsun');

describe('ObservabilityTask', () => {
  let task: ObservabilityTask;
  let fetchApi: jest.Mock;
  let responseBody: unknown;

  // The generated APIs run for real: only the network call is faked, so the tests check the sent URL.
  const sentUrl = (): URL => new URL(fetchApi.mock.calls[0][0]);

  beforeEach(() => {
    responseBody = { data: [] };
    fetchApi = jest.fn().mockImplementation(
      async () =>
        new Response(JSON.stringify(responseBody), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );
    const client = {
      apiConfig: new Configuration({ basePath: 'https://api.example.com', fetchApi }),
    } as unknown as UpsunClient;
    task = new ObservabilityTask(client);
  });

  describe('entrypoint', () => {
    it('should get the observability entrypoint of the environment', async () => {
      await task.entrypoint('proj-1', 'main');

      expect(fetchApi).toHaveBeenCalledTimes(1);
      expect(sentUrl().pathname).toBe('/projects/proj-1/environments/main/observability');
      expect(fetchApi.mock.calls[0][1].method).toBe('GET');
    });

    it('should require a project ID', async () => {
      await expect(task.entrypoint('', 'main')).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(task.entrypoint('proj-1', '')).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('logsOverview', () => {
    it('should send the time range and the filters as query parameters', async () => {
      await task.logsOverview('proj-1', 'main', {
        from: 1700000000,
        to: 1700003600,
        severities: ['ERROR', 'CRITICAL'],
        severitiesMode: '1',
        services: ['app'],
      });

      const url = sentUrl();
      expect(url.pathname).toBe('/projects/proj-1/environments/main/observability/logs/overview');
      expect(url.searchParams.get('from')).toBe('1700000000');
      expect(url.searchParams.get('to')).toBe('1700003600');
      expect(url.searchParams.getAll('severities[]')).toEqual(['ERROR', 'CRITICAL']);
      expect(url.searchParams.get('severities_mode')).toBe('1');
      expect(url.searchParams.getAll('services[]')).toEqual(['app']);
    });

    it('should keep the IDs of the arguments when the params also hold IDs', async () => {
      // A caller without type checks can put IDs in params: the arguments must win.
      const params = { from: 1, to: 2, projectId: 'other', environmentId: 'other' } as any;

      await task.logsOverview('proj-1', 'main', params);

      expect(sentUrl().pathname).toBe(
        '/projects/proj-1/environments/main/observability/logs/overview',
      );
    });

    it('should require a project ID', async () => {
      await expect(task.logsOverview('', 'main', { from: 1, to: 2 })).rejects.toThrow(
        'Project ID is required',
      );
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(task.logsOverview('proj-1', '', { from: 1, to: 2 })).rejects.toThrow(
        'Environment ID is required',
      );
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('logsQuery', () => {
    it('should send the time range, the order, the cursor and the filters as query parameters', async () => {
      await task.logsQuery('proj-1', 'main', {
        from: 1700000000,
        to: 1700003600,
        order: 'ASC',
        cursor: 'next-page',
        hosts: ['web-1', 'web-2'],
        hostsMode: '-1',
      });

      const url = sentUrl();
      expect(url.pathname).toBe('/projects/proj-1/environments/main/observability/logs/query');
      expect(url.searchParams.get('from')).toBe('1700000000');
      expect(url.searchParams.get('to')).toBe('1700003600');
      expect(url.searchParams.get('order')).toBe('ASC');
      expect(url.searchParams.get('cursor')).toBe('next-page');
      expect(url.searchParams.getAll('hosts[]')).toEqual(['web-1', 'web-2']);
      expect(url.searchParams.get('hosts_mode')).toBe('-1');
    });

    it('should return the log entries as models', async () => {
      responseBody = {
        data: [
          {
            cursor: 'c1',
            datetime: '2026-11-16T10:00:00Z',
            severity: 'ERROR',
            container_id: 'abc',
            content: 'boom',
          },
        ],
      };

      const result = await task.logsQuery('proj-1', 'main', { from: 1, to: 2 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].datetime).toEqual(new Date('2026-11-16T10:00:00Z'));
      expect(result.data[0].containerId).toBe('abc');
      expect(result.data[0].content).toBe('boom');
    });

    it('should require a project ID', async () => {
      await expect(task.logsQuery('', 'main', { from: 1, to: 2 })).rejects.toThrow(
        'Project ID is required',
      );
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(task.logsQuery('proj-1', '', { from: 1, to: 2 })).rejects.toThrow(
        'Environment ID is required',
      );
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('httpTimelineByUrl', () => {
    it('should call GET /observability/http/breakdown/urls', async () => {
      await task.httpTimelineByUrl('proj-1', 'main', { from: 1700000000, to: 1700003600 });

      const url = sentUrl();
      expect(url.pathname).toBe(
        '/projects/proj-1/environments/main/observability/http/breakdown/urls',
      );
      expect(url.searchParams.get('from')).toBe('1700000000');
      expect(url.searchParams.get('to')).toBe('1700003600');
    });

    it('should require a project ID', async () => {
      await expect(
        task.httpTimelineByUrl('', 'main', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(
        task.httpTimelineByUrl('proj-1', '', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('httpTimelineByIp', () => {
    it('should call GET /observability/http/breakdown/ips', async () => {
      await task.httpTimelineByIp('proj-1', 'main', { from: 1700000000, to: 1700003600 });

      const url = sentUrl();
      expect(url.pathname).toBe(
        '/projects/proj-1/environments/main/observability/http/breakdown/ips',
      );
      expect(url.searchParams.get('from')).toBe('1700000000');
      expect(url.searchParams.get('to')).toBe('1700003600');
    });

    it('should require a project ID', async () => {
      await expect(
        task.httpTimelineByIp('', 'main', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(
        task.httpTimelineByIp('proj-1', '', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('httpTimelineByUserAgent', () => {
    it('should call GET /observability/http/breakdown/user-agents', async () => {
      await task.httpTimelineByUserAgent('proj-1', 'main', { from: 1700000000, to: 1700003600 });

      const url = sentUrl();
      expect(url.pathname).toBe(
        '/projects/proj-1/environments/main/observability/http/breakdown/user-agents',
      );
      expect(url.searchParams.get('from')).toBe('1700000000');
      expect(url.searchParams.get('to')).toBe('1700003600');
    });

    it('should require a project ID', async () => {
      await expect(
        task.httpTimelineByUserAgent('', 'main', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(
        task.httpTimelineByUserAgent('proj-1', '', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('resourcesOverview', () => {
    it('should call GET /observability/resources/overview', async () => {
      await task.resourcesOverview('proj-1', 'main', { from: 1700000000, to: 1700003600 });

      const url = sentUrl();
      expect(url.pathname).toBe(
        '/projects/proj-1/environments/main/observability/resources/overview',
      );
      expect(url.searchParams.get('from')).toBe('1700000000');
      expect(url.searchParams.get('to')).toBe('1700003600');
    });

    it('should require a project ID', async () => {
      await expect(
        task.resourcesOverview('', 'main', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(
        task.resourcesOverview('proj-1', '', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('resourcesSummary', () => {
    it('should call GET /observability/resources/summary', async () => {
      await task.resourcesSummary('proj-1', 'main', { from: 1700000000, to: 1700003600 });

      const url = sentUrl();
      expect(url.pathname).toBe(
        '/projects/proj-1/environments/main/observability/resources/summary',
      );
      expect(url.searchParams.get('from')).toBe('1700000000');
      expect(url.searchParams.get('to')).toBe('1700003600');
    });

    it('should require a project ID', async () => {
      await expect(
        task.resourcesSummary('', 'main', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(
        task.resourcesSummary('proj-1', '', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('resourcesByService', () => {
    it('should call GET /observability/resources/service/{service}', async () => {
      await task.resourcesByService('proj-1', 'main', 'db', { from: 1700000000, to: 1700003600 });

      const url = sentUrl();
      expect(url.pathname).toBe(
        '/projects/proj-1/environments/main/observability/resources/service/db',
      );
      expect(url.searchParams.get('from')).toBe('1700000000');
      expect(url.searchParams.get('to')).toBe('1700003600');
    });

    it('should require a project ID', async () => {
      await expect(
        task.resourcesByService('', 'main', 'db', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(
        task.resourcesByService('proj-1', '', 'db', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require the service name', async () => {
      await expect(
        task.resourcesByService('proj-1', 'main', '', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Service name is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('serverOverview', () => {
    it('should call GET /observability/server', async () => {
      responseBody = { alert_evaluations: [], server: { total: 0, data: [] } };
      await task.serverOverview('proj-1', 'main', {
        from: 1700000000,
        to: 1700003600,
        keys: ['wt', 'mu'],
      });

      const url = sentUrl();
      expect(url.pathname).toBe('/projects/proj-1/environments/main/observability/server');
      expect(url.searchParams.get('from')).toBe('1700000000');
      expect(url.searchParams.get('to')).toBe('1700003600');
      expect(url.searchParams.getAll('keys[]')).toEqual(['wt', 'mu']);
    });

    it('should require a project ID', async () => {
      await expect(
        task.serverOverview('', 'main', { from: 1700000000, to: 1700003600, keys: ['wt', 'mu'] }),
      ).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(
        task.serverOverview('proj-1', '', { from: 1700000000, to: 1700003600, keys: ['wt', 'mu'] }),
      ).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('serverCaches', () => {
    it('should call GET /observability/server/caches', async () => {
      await task.serverCaches('proj-1', 'main', { from: 1700000000, to: 1700003600 });

      const url = sentUrl();
      expect(url.pathname).toBe('/projects/proj-1/environments/main/observability/server/caches');
      expect(url.searchParams.get('from')).toBe('1700000000');
      expect(url.searchParams.get('to')).toBe('1700003600');
    });

    it('should require a project ID', async () => {
      await expect(
        task.serverCaches('', 'main', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(
        task.serverCaches('proj-1', '', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('serverTopSpans', () => {
    it('should call GET /observability/server/top-spans', async () => {
      await task.serverTopSpans('proj-1', 'main', { from: 1700000000, to: 1700003600 });

      const url = sentUrl();
      expect(url.pathname).toBe(
        '/projects/proj-1/environments/main/observability/server/top-spans',
      );
      expect(url.searchParams.get('from')).toBe('1700000000');
      expect(url.searchParams.get('to')).toBe('1700003600');
    });

    it('should require a project ID', async () => {
      await expect(
        task.serverTopSpans('', 'main', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(
        task.serverTopSpans('proj-1', '', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('serverTransactionsBreakdown', () => {
    it('should call GET /observability/server/transactions-break-down', async () => {
      await task.serverTransactionsBreakdown('proj-1', 'main', {
        from: 1700000000,
        to: 1700003600,
      });

      const url = sentUrl();
      expect(url.pathname).toBe(
        '/projects/proj-1/environments/main/observability/server/transactions-break-down',
      );
      expect(url.searchParams.get('from')).toBe('1700000000');
      expect(url.searchParams.get('to')).toBe('1700003600');
    });

    it('should require a project ID', async () => {
      await expect(
        task.serverTransactionsBreakdown('', 'main', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(
        task.serverTransactionsBreakdown('proj-1', '', { from: 1700000000, to: 1700003600 }),
      ).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('listProfiles', () => {
    it('should call GET /observability/profiles', async () => {
      responseBody = { profiles: [] };
      await task.listProfiles('proj-1', 'main');

      const url = sentUrl();
      expect(url.pathname).toBe('/projects/proj-1/environments/main/observability/profiles');
    });

    it('should send the filters, the sort and the pagination as query parameters', async () => {
      responseBody = { profiles: [] };
      await task.listProfiles('proj-1', 'main', {
        transaction: 'GET /cart',
        sortBy: 'wt',
        sortOrder: 'desc',
        startDate: new Date('2026-11-01T00:00:00.000Z'),
        page: 2,
        itemsPerPage: 20,
      });

      const url = sentUrl();
      expect(url.searchParams.get('transaction')).toBe('GET /cart');
      expect(url.searchParams.get('sort_by')).toBe('wt');
      expect(url.searchParams.get('sort_order')).toBe('desc');
      expect(url.searchParams.get('start_date')).toBe('2026-11-01T00:00:00.000Z');
      expect(url.searchParams.get('page')).toBe('2');
      expect(url.searchParams.get('items_per_page')).toBe('20');
    });

    it('should keep the IDs of the arguments when the params also hold IDs', async () => {
      // A caller without type checks can put IDs in params: the arguments must win.
      responseBody = { profiles: [] };
      const params = { projectId: 'other', environmentId: 'other' } as any;

      await task.listProfiles('proj-1', 'main', params);

      expect(sentUrl().pathname).toBe('/projects/proj-1/environments/main/observability/profiles');
    });

    it('should require a project ID', async () => {
      await expect(task.listProfiles('', 'main')).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(task.listProfiles('proj-1', '')).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('profileRecommendations', () => {
    it('should call GET /observability/profiles/recommendations', async () => {
      responseBody = { recommendations: [] };
      await task.profileRecommendations('proj-1', 'main');

      const url = sentUrl();
      expect(url.pathname).toBe(
        '/projects/proj-1/environments/main/observability/profiles/recommendations',
      );
    });

    it('should send the time range, the transaction and the limit as query parameters', async () => {
      responseBody = { recommendations: [] };
      await task.profileRecommendations('proj-1', 'main', {
        from: 1700000000,
        to: 1700003600,
        transaction: 'GET /cart',
        limit: 20,
      });

      const url = sentUrl();
      expect(url.searchParams.get('from')).toBe('1700000000');
      expect(url.searchParams.get('to')).toBe('1700003600');
      expect(url.searchParams.get('transaction')).toBe('GET /cart');
      expect(url.searchParams.get('limit')).toBe('20');
    });

    it('should keep the IDs of the arguments when the params also hold IDs', async () => {
      // A caller without type checks can put IDs in params: the arguments must win.
      responseBody = { recommendations: [] };
      const params = { projectId: 'other', environmentId: 'other' } as any;

      await task.profileRecommendations('proj-1', 'main', params);

      expect(sentUrl().pathname).toBe(
        '/projects/proj-1/environments/main/observability/profiles/recommendations',
      );
    });

    it('should require a project ID', async () => {
      await expect(task.profileRecommendations('', 'main')).rejects.toThrow(
        'Project ID is required',
      );
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(task.profileRecommendations('proj-1', '')).rejects.toThrow(
        'Environment ID is required',
      );
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should call GET /observability/profiles/{uuid}/profile', async () => {
      await task.getProfile('proj-1', 'main', '0b7e5c1a-1111-4222-8333-944455556666');

      const url = sentUrl();
      expect(url.pathname).toBe(
        '/projects/proj-1/environments/main/observability/profiles/0b7e5c1a-1111-4222-8333-944455556666/profile',
      );
    });

    it('should require a project ID', async () => {
      await expect(
        task.getProfile('', 'main', '0b7e5c1a-1111-4222-8333-944455556666'),
      ).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(
        task.getProfile('proj-1', '', '0b7e5c1a-1111-4222-8333-944455556666'),
      ).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require the profile UUID', async () => {
      await expect(task.getProfile('proj-1', 'main', '')).rejects.toThrow(
        'Profile UUID is required',
      );
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('profileGraph', () => {
    it('should call GET /observability/profiles/{uuid}/graph', async () => {
      await task.profileGraph('proj-1', 'main', '0b7e5c1a-1111-4222-8333-944455556666');

      const url = sentUrl();
      expect(url.pathname).toBe(
        '/projects/proj-1/environments/main/observability/profiles/0b7e5c1a-1111-4222-8333-944455556666/graph',
      );
    });

    it('should require a project ID', async () => {
      await expect(
        task.profileGraph('', 'main', '0b7e5c1a-1111-4222-8333-944455556666'),
      ).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(
        task.profileGraph('proj-1', '', '0b7e5c1a-1111-4222-8333-944455556666'),
      ).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require the profile UUID', async () => {
      await expect(task.profileGraph('proj-1', 'main', '')).rejects.toThrow(
        'Profile UUID is required',
      );
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('profileSubprofiles', () => {
    it('should call GET /observability/profiles/{uuid}/subprofiles', async () => {
      await task.profileSubprofiles('proj-1', 'main', '0b7e5c1a-1111-4222-8333-944455556666');

      const url = sentUrl();
      expect(url.pathname).toBe(
        '/projects/proj-1/environments/main/observability/profiles/0b7e5c1a-1111-4222-8333-944455556666/subprofiles',
      );
    });

    it('should require a project ID', async () => {
      await expect(
        task.profileSubprofiles('', 'main', '0b7e5c1a-1111-4222-8333-944455556666'),
      ).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(
        task.profileSubprofiles('proj-1', '', '0b7e5c1a-1111-4222-8333-944455556666'),
      ).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require the profile UUID', async () => {
      await expect(task.profileSubprofiles('proj-1', 'main', '')).rejects.toThrow(
        'Profile UUID is required',
      );
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('profileTimeline', () => {
    it('should call GET /observability/profiles/{uuid}/timeline', async () => {
      await task.profileTimeline('proj-1', 'main', '0b7e5c1a-1111-4222-8333-944455556666');

      const url = sentUrl();
      expect(url.pathname).toBe(
        '/projects/proj-1/environments/main/observability/profiles/0b7e5c1a-1111-4222-8333-944455556666/timeline',
      );
    });

    it('should require a project ID', async () => {
      await expect(
        task.profileTimeline('', 'main', '0b7e5c1a-1111-4222-8333-944455556666'),
      ).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(
        task.profileTimeline('proj-1', '', '0b7e5c1a-1111-4222-8333-944455556666'),
      ).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require the profile UUID', async () => {
      await expect(task.profileTimeline('proj-1', 'main', '')).rejects.toThrow(
        'Profile UUID is required',
      );
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('navigation data', () => {
    // The next call needs these fields: the generated models must keep them after FromJSON.
    it('should keep the transaction name and its links in the transaction breakdown', async () => {
      responseBody = {
        transactions: {
          data: [
            {
              transaction: 'App\\Controller\\Cart::show',
              impact: 12.5,
              top_hit: true,
              _links: {
                profiles: { href: 'https://api.example.com/profiles?transaction=x' },
                top_spans: { href: 'https://api.example.com/top-spans' },
                recommendations: { href: 'https://api.example.com/recommendations' },
              },
            },
          ],
        },
      };

      const result = await task.serverTransactionsBreakdown('proj-1', 'main', { from: 1, to: 2 });

      const row = result.transactions.data[0];
      expect(row.transaction).toBe('App\\Controller\\Cart::show');
      expect(row.links.profiles.href).toBe('https://api.example.com/profiles?transaction=x');
    });

    it('should keep the profile UUID and the Blackfire environment UUID in the profile list', async () => {
      responseBody = {
        _agent: 'agent-uuid',
        profiles: [
          {
            uuid: 'profile-uuid',
            name: 'GET /cart',
            agent: { uuid: 'agent-uuid', env_uuid: 'env-uuid', is_env: true },
            _links: {
              graph_url: { href: 'https://blackfire.io/envs/env-uuid/profiles/profile-uuid/graph' },
              api_graph: { href: 'https://api.example.com/profiles/profile-uuid/graph' },
              api_profile: { href: 'https://api.example.com/profiles/profile-uuid/profile' },
              api_subprofiles: {
                href: 'https://api.example.com/profiles/profile-uuid/subprofiles',
              },
            },
          },
        ],
        page: 1,
        pages: 3,
        total: 25,
      };

      const result = await task.listProfiles('proj-1', 'main');

      expect(result.agent).toBe('agent-uuid');
      expect(result.pages).toBe(3);
      expect(result.profiles[0].uuid).toBe('profile-uuid');
      expect(result.profiles[0].agent?.envUuid).toBe('env-uuid');
      expect(result.profiles[0].links.graphUrl?.href).toBe(
        'https://blackfire.io/envs/env-uuid/profiles/profile-uuid/graph',
      );
    });

    it('should keep the cursor of the next log page', async () => {
      responseBody = {
        _cursor: 'next-page',
        _has_more_results: true,
        _links: {
          self: { href: 'https://api.example.com/self' },
          overview: { href: 'https://api.example.com/o' },
        },
        data: [],
      };

      const result = await task.logsQuery('proj-1', 'main', { from: 1, to: 2 });

      expect(result.hasMoreResults).toBe(true);
      expect(result.cursor).toBe('next-page');
    });
  });
});
