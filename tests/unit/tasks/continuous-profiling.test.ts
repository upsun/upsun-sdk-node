import { ContinuousProfilingTask } from '../../../src/core/tasks/continuous-profiling.js';
import { UpsunClient } from '../../../src/upsun.js';
import { Configuration } from '../../../src/core/runtime.js';

jest.mock('../../../src/upsun');

describe('ContinuousProfilingTask', () => {
  let task: ContinuousProfilingTask;
  let fetchApi: jest.Mock;
  let response: () => Response;

  const json = (body: unknown): (() => Response) => {
    return () =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
  };

  // The generated API runs for real: only the network call is faked, so the tests check the sent URL.
  const sentUrl = (): URL => new URL(fetchApi.mock.calls[0][0]);

  const flamebearer = {
    version: 1,
    flamebearer: { names: ['total', 'main'], levels: [[0, 100, 0, 0]], numTicks: 100, maxSelf: 60 },
    metadata: { format: 'single', spyName: 'gospy', sampleRate: 100, units: 'samples' },
    _profile_type: 'cpu',
    _sample_unit: 'nanoseconds',
    _application: 'app',
  };

  beforeEach(() => {
    response = json({ applications: {} });
    fetchApi = jest.fn().mockImplementation(async () => response());
    const client = {
      apiConfig: new Configuration({ basePath: 'https://api.example.com', fetchApi }),
    } as unknown as UpsunClient;
    task = new ContinuousProfilingTask(client);
  });

  describe('listApplications', () => {
    it('should list the profiled applications of the environment', async () => {
      response = json({
        applications: {
          app: {
            name: 'app',
            profile_types: {
              cpu: {
                name: 'cpu',
                description: 'CPU',
                title: 'CPU Time',
                unit: 'nanoseconds',
                aggregation: 'sum',
              },
            },
            languages: ['go'],
          },
        },
      });

      const result = await task.listApplications('proj-1', 'main', { from: 1, to: 2 });

      const url = sentUrl();
      expect(url.pathname).toBe('/projects/proj-1/environments/main/continuous-profiling');
      expect(url.searchParams.get('from')).toBe('1');
      expect(url.searchParams.get('to')).toBe('2');
      expect(Object.keys(result.applications)).toEqual(['app']);
      expect(Object.keys(result.applications.app.profileTypes)).toEqual(['cpu']);
    });

    it('should work without params', async () => {
      await task.listApplications('proj-1', 'main');

      expect(sentUrl().search).toBe('');
    });

    it('should keep the IDs of the arguments when the params also hold IDs', async () => {
      // A caller without type checks can put IDs in params: the arguments must win.
      const params = { projectId: 'other', envId: 'other' } as any;

      await task.listApplications('proj-1', 'main', params);

      expect(sentUrl().pathname).toBe('/projects/proj-1/environments/main/continuous-profiling');
    });

    it('should require a project ID', async () => {
      await expect(task.listApplications('', 'main')).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(task.listApplications('proj-1', '')).rejects.toThrow(
        'Environment ID is required',
      );
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('timeline', () => {
    it('should send the profile type and the runtime filters with their modes', async () => {
      response = json({
        from: 1,
        to: 2,
        grain: 60,
        unit: 'nanoseconds',
        aggregation_type: 'sum',
        retention: 8,
        points: [],
      });

      const result = await task.timeline('proj-1', 'main', 'app', {
        from: 1,
        to: 2,
        profileType: 'cpu',
        runtime: ['go'],
        runtimeVersion: ['1.22', '1.23'],
        runtimeVersionMode: -1,
      });

      const url = sentUrl();
      expect(url.pathname).toBe('/projects/proj-1/environments/main/continuous-profiling/app/app');
      expect(url.searchParams.get('profile_type')).toBe('cpu');
      expect(url.searchParams.getAll('runtime[]')).toEqual(['go']);
      expect(url.searchParams.getAll('runtime_version[]')).toEqual(['1.22', '1.23']);
      expect(url.searchParams.get('runtime_version_mode')).toBe('-1');
      expect(result.aggregationType).toBe('sum');
    });

    it('should encode the application name in the path', async () => {
      // A probe can report any application name, so the name must not break the path.
      response = json({
        from: 1,
        to: 2,
        grain: 60,
        unit: 'u',
        aggregation_type: 'sum',
        retention: 8,
        points: [],
      });

      await task.timeline('proj-1', 'main', 'my app/v2');

      expect(fetchApi.mock.calls[0][0]).toContain('/continuous-profiling/app/my%20app%2Fv2');
    });

    it('should require an application name', async () => {
      await expect(task.timeline('proj-1', 'main', '')).rejects.toThrow(
        'Application name is required',
      );
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require a project ID', async () => {
      await expect(task.timeline('', 'main', 'app')).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(task.timeline('proj-1', '', 'app')).rejects.toThrow(
        'Environment ID is required',
      );
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('filters', () => {
    it('should get the filter values of the application', async () => {
      response = json({
        fields: { runtime: { values: [{ value: 'go', count: 3 }] } },
        max_applicable_filters: 5,
      });

      const result = await task.filters('proj-1', 'main', 'app', {
        probeVersion: ['1.0.0'],
        probeVersionMode: 1,
      });

      const url = sentUrl();
      expect(url.pathname).toBe(
        '/projects/proj-1/environments/main/continuous-profiling/app/app/filter',
      );
      expect(url.searchParams.getAll('probe_version[]')).toEqual(['1.0.0']);
      expect(url.searchParams.get('probe_version_mode')).toBe('1');
      expect(Object.keys(result.fields)).toEqual(['runtime']);
      expect(result.maxApplicableFilters).toBe(5);
    });

    it('should require an application name', async () => {
      await expect(task.filters('proj-1', 'main', '')).rejects.toThrow(
        'Application name is required',
      );
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require a project ID', async () => {
      await expect(task.filters('', 'main', 'app')).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(task.filters('proj-1', '', 'app')).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });

  describe('merge', () => {
    it('should parse a JSON response as the flamebearerv2 model', async () => {
      response = json(flamebearer);

      const result = await task.merge('proj-1', 'main', 'app', {
        out: 'flamebearerv2',
        profileType: 'cpu',
      });

      const url = sentUrl();
      expect(url.pathname).toBe(
        '/projects/proj-1/environments/main/continuous-profiling/app/app/merge',
      );
      expect(url.searchParams.get('out')).toBe('flamebearerv2');
      expect(url.searchParams.get('profile_type')).toBe('cpu');
      expect(result.format).toBe('flamebearerv2');
      if (result.format !== 'flamebearerv2') throw new Error('unreachable');
      expect(result.data.profileType).toBe('cpu');
      expect(result.data.sampleUnit).toBe('nanoseconds');
      expect(result.data.flamebearer.names).toEqual(['total', 'main']);
    });

    it('should return a graphviz response as dot text', async () => {
      response = () =>
        new Response('digraph "app" {}', {
          status: 200,
          headers: { 'Content-Type': 'text/vnd.graphviz' },
        });

      const result = await task.merge('proj-1', 'main', 'app', { out: 'dot' });

      expect(result).toEqual({ format: 'dot', text: 'digraph "app" {}' });
    });

    it('should return a binary response as pprof bytes with the file name', async () => {
      const bytes = new Uint8Array([0x1f, 0x8b, 0x08, 0x00]);
      response = () =>
        new Response(bytes, {
          status: 200,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename=merged_profile_1-2.pb.gz',
          },
        });

      const result = await task.merge('proj-1', 'main', 'app', { out: 'pprof' });

      expect(result).toEqual({
        format: 'pprof',
        data: bytes,
        filename: 'merged_profile_1-2.pb.gz',
      });
    });

    it('should return pprof bytes without a file name when the header is missing', async () => {
      response = () =>
        new Response(new Uint8Array([1]), {
          status: 200,
          headers: { 'Content-Type': 'application/octet-stream' },
        });

      const result = await task.merge('proj-1', 'main', 'app');

      expect(result).toEqual({ format: 'pprof', data: new Uint8Array([1]), filename: undefined });
    });

    it('should fail on an unknown content type', async () => {
      // A new output format must fail loudly, not come back as the wrong variant.
      response = () =>
        new Response('<html></html>', { status: 200, headers: { 'Content-Type': 'text/html' } });

      await expect(task.merge('proj-1', 'main', 'app')).rejects.toThrow(
        'Unexpected content type for a merged profile: "text/html"',
      );
    });

    it('should require an application name', async () => {
      await expect(task.merge('proj-1', 'main', '')).rejects.toThrow(
        'Application name is required',
      );
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require a project ID', async () => {
      await expect(task.merge('', 'main', 'app')).rejects.toThrow('Project ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });

    it('should require an environment ID', async () => {
      await expect(task.merge('proj-1', '', 'app')).rejects.toThrow('Environment ID is required');
      expect(fetchApi).not.toHaveBeenCalled();
    });
  });
});
