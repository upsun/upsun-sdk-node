import { RoutesTask } from '../../../src/core/tasks/routes.js';
import { UpsunClient } from '../../../src/upsun.js';
import { RoutingApi } from '../../../src/api/index.js';

// Mock the UpsunClient and RoutingApi
jest.mock('../../../src/upsun');
jest.mock('../../../src/api/index.js');

describe('RoutesTask', () => {
  let routesTask: RoutesTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockRoutingApi: jest.Mocked<RoutingApi>;

  beforeEach(() => {
    mockRoutingApi = {
      getProjectsEnvironmentsRoutes: jest.fn(),
      listProjectsEnvironmentsRoutes: jest.fn(),
    } as any;

    (RoutingApi as jest.MockedClass<typeof RoutingApi>).mockImplementation(() => mockRoutingApi);

    mockClient = {
      apiConfig: {
        basePath: 'https://api.upsun.com',
      },
    } as any;

    routesTask = new RoutesTask(mockClient, mockRoutingApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should get route information', async () => {
      const mockRoute = {
        primary: true,
        id: 'route-123',
        productionUrl: 'https://main-abcd123.upsun.app',
        attributes: {},
        type: 'upstream' as const,
        tls: {
          strictTransportSecurity: null,
          minVersion: null,
          clientAuthentication: null,
          clientCertificateAuthorities: [],
        },
        cache: {
          enabled: true,
          defaultTtl: 300,
          headers: [],
          cookies: [],
        },
        ssi: {
          enabled: false,
        },
        upstream: 'app:http',
        redirects: {
          expires: null,
          paths: {},
        },
      };

      mockRoutingApi.getProjectsEnvironmentsRoutes.mockResolvedValue(mockRoute as any);

      const result = await routesTask.get('project-123', 'main', 'route-123');
      expect(result).toBeDefined();
      expect(result.id).toBe('route-123');
      expect(result.type).toBe('upstream');
      expect(mockRoutingApi.getProjectsEnvironmentsRoutes).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
        routeId: 'route-123',
      });
      // Type-safe check for upstream property
      if (result.type === 'upstream') {
        expect((result as any).upstream).toBe('app:http');
      }
    });

    it('should handle get errors for non-existent route', async () => {
      mockRoutingApi.getProjectsEnvironmentsRoutes.mockRejectedValue(new Error('Route not found'));

      await expect(routesTask.get('project-123', 'main', 'non-existent')).rejects.toThrow(
        'Route not found',
      );
    });
  });

  describe('list', () => {
    it('should list environment routes', async () => {
      const mockRoutes = [
        {
          primary: true,
          id: 'route-1',
          productionUrl: 'https://main-abcd123.upsun.app',
          attributes: {},
          type: 'upstream' as const,
          tls: {
            strictTransportSecurity: null,
            minVersion: null,
            clientAuthentication: null,
            clientCertificateAuthorities: [],
          },
          cache: {
            enabled: false,
            defaultTtl: 0,
            headers: [],
            cookies: [],
          },
          ssi: {
            enabled: false,
          },
          upstream: 'app:http',
          redirects: {
            expires: null,
            paths: {},
          },
        },
        {
          primary: false,
          id: 'route-2',
          productionUrl: 'https://api-main-abcd123.upsun.app',
          attributes: {},
          type: 'upstream' as const,
          tls: {
            strictTransportSecurity: null,
            minVersion: null,
            clientAuthentication: null,
            clientCertificateAuthorities: [],
          },
          cache: {
            enabled: false,
            defaultTtl: 0,
            headers: [],
            cookies: [],
          },
          ssi: {
            enabled: false,
          },
          upstream: 'api:http',
          redirects: {
            expires: null,
            paths: {},
          },
        },
      ];

      mockRoutingApi.listProjectsEnvironmentsRoutes.mockResolvedValue(mockRoutes as any);

      const result = await routesTask.list('project-123', 'main');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('route-1');
      expect(result[1].id).toBe('route-2');
      expect(mockRoutingApi.listProjectsEnvironmentsRoutes).toHaveBeenCalledWith({
        projectId: 'project-123',
        environmentId: 'main',
      });
    });

    it('should handle empty route list', async () => {
      mockRoutingApi.listProjectsEnvironmentsRoutes.mockResolvedValue([]);

      const result = await routesTask.list('project-123', 'main');
      expect(result).toEqual([]);
    });
  });
});
