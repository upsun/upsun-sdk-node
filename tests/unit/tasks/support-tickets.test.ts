import { SupportTicketsTask } from '../../../src/core/tasks/support-tickets.js';
import { UpsunClient } from '../../../src/upsun.js';
import { DefaultApi, SupportApi } from '../../../src/api/index.js';

jest.mock('../../../src/upsun.js');
jest.mock('../../../src/api/index.js');

describe('SupportTicketsTask', () => {
  let supportTicketsTask: SupportTicketsTask;
  let mockClient: jest.Mocked<UpsunClient>;
  let mockDefaultApi: jest.Mocked<DefaultApi>;
  let mockSupportApi: jest.Mocked<SupportApi>;

  beforeEach(() => {
    mockDefaultApi = {
      listTickets: jest.fn(),
    } as any;

    mockSupportApi = {
      createTicket: jest.fn(),
      listTicketCategories: jest.fn(),
      listTicketPriorities: jest.fn(),
      updateTicket: jest.fn(),
    } as any;

    (DefaultApi as jest.MockedClass<typeof DefaultApi>).mockImplementation(
      () => mockDefaultApi,
    );
    (SupportApi as jest.MockedClass<typeof SupportApi>).mockImplementation(
      () => mockSupportApi,
    );

    mockClient = {
      apiConfig: { basePath: 'https://api.upsun.com' },
      projects: {
        get: jest.fn(),
      },
    } as any;

    supportTicketsTask = new SupportTicketsTask(mockClient, mockDefaultApi, mockSupportApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should have list method defined', () => {
      expect(supportTicketsTask.list).toBeDefined();
      expect(typeof supportTicketsTask.list).toBe('function');
    });

    it('should list support tickets without filters', async () => {
      const mockResponse = { tickets: [{ id: 'tkt-1', subject: 'Help' }], count: 1 };
      mockDefaultApi.listTickets.mockResolvedValue(mockResponse as any);

      const result = await supportTicketsTask.list();
      expect(result).toBeDefined();
      expect(mockDefaultApi.listTickets).toHaveBeenCalledWith(undefined);
    });

    it('should pass filters to the API', async () => {
      const mockResponse = { tickets: [], count: 0 };
      mockDefaultApi.listTickets.mockResolvedValue(mockResponse as any);

      const filters = { status: 'open' } as any;
      await supportTicketsTask.list(filters);
      expect(mockDefaultApi.listTickets).toHaveBeenCalledWith(filters);
    });

    it('should handle API error', async () => {
      mockDefaultApi.listTickets.mockRejectedValue(new Error('Unauthorized'));
      await expect(supportTicketsTask.list()).rejects.toThrow('Unauthorized');
    });
  });

  describe('create', () => {
    it('should have create method defined', () => {
      expect(supportTicketsTask.create).toBeDefined();
      expect(typeof supportTicketsTask.create).toBe('function');
    });

    it('should create a support ticket', async () => {
      const mockTicket = { id: 'tkt-1', subject: 'My issue', description: 'Details here' };
      mockSupportApi.createTicket.mockResolvedValue(mockTicket as any);

      const result = await supportTicketsTask.create('My issue', 'Details here');
      expect(result).toBeDefined();
      expect((result as any).id).toBe('tkt-1');
      expect(mockSupportApi.createTicket).toHaveBeenCalledWith({
        createTicketRequest: {
          subject: 'My issue',
          description: 'Details here',
        },
      });
    });

    it('should create a ticket with optional params', async () => {
      const mockTicket = { id: 'tkt-2', subject: 'Priority issue' };
      mockSupportApi.createTicket.mockResolvedValue(mockTicket as any);

      await supportTicketsTask.create('Priority issue', 'Details', { priority: 'high' } as any);
      expect(mockSupportApi.createTicket).toHaveBeenCalledWith({
        createTicketRequest: {
          subject: 'Priority issue',
          description: 'Details',
          priority: 'high',
        },
      });
    });

    it('should throw when subject is empty', async () => {
      await expect(supportTicketsTask.create('', 'description')).rejects.toThrow(
        'Subject is required',
      );
    });

    it('should throw when description is empty', async () => {
      await expect(supportTicketsTask.create('subject', '')).rejects.toThrow(
        'Description is required',
      );
    });

    it('should handle API error', async () => {
      mockSupportApi.createTicket.mockRejectedValue(new Error('Bad request'));
      await expect(supportTicketsTask.create('subject', 'desc')).rejects.toThrow('Bad request');
    });
  });

  describe('listCategories', () => {
    it('should have listCategories method defined', () => {
      expect(supportTicketsTask.listCategories).toBeDefined();
    });

    it('should list categories without project ID', async () => {
      const mockCategories = [{ id: 'cat-1', label: 'Billing' }];
      mockSupportApi.listTicketCategories.mockResolvedValue(mockCategories as any);

      const result = await supportTicketsTask.listCategories();
      expect(result).toBeDefined();
      expect(mockSupportApi.listTicketCategories).toHaveBeenCalledWith({
        subscriptionId: undefined,
        organizationId: undefined,
      });
    });

    it('should resolve subscription ID from project when projectId is provided', async () => {
      const mockProject = {
        subscription: { licenseUri: 'https://api.upsun.com/subscriptions/sub-123' },
      };
      (mockClient.projects.get as jest.Mock).mockResolvedValue(mockProject);

      const mockCategories = [{ id: 'cat-1', label: 'Billing' }];
      mockSupportApi.listTicketCategories.mockResolvedValue(mockCategories as any);

      await supportTicketsTask.listCategories(undefined, 'proj-1');
      expect(mockClient.projects.get).toHaveBeenCalledWith('proj-1');
      expect(mockSupportApi.listTicketCategories).toHaveBeenCalledWith({
        subscriptionId: 'sub-123',
        organizationId: undefined,
      });
    });

    it('should not call the API with a subscriptionId when projectId is empty string (falsy)', async () => {
      const mockCategories = [{ id: 'cat-1', label: 'Billing' }];
      mockSupportApi.listTicketCategories.mockResolvedValue(mockCategories as any);

      // empty string is falsy → the `if (projectId)` branch is skipped
      await supportTicketsTask.listCategories(undefined, '');
      expect(mockSupportApi.listTicketCategories).toHaveBeenCalledWith({
        subscriptionId: undefined,
        organizationId: undefined,
      });
    });

    it('should call categories API without subscriptionId when project has no licenseUri', async () => {
      (mockClient.projects.get as jest.Mock).mockResolvedValue({ subscription: {} });
      mockSupportApi.listTicketCategories.mockResolvedValue([] as any);

      await supportTicketsTask.listCategories(undefined, 'proj-1');
      expect(mockSupportApi.listTicketCategories).toHaveBeenCalledWith({
        subscriptionId: undefined,
        organizationId: undefined,
      });
    });
  });

  describe('listPriorities', () => {
    it('should have listPriorities method defined', () => {
      expect(supportTicketsTask.listPriorities).toBeDefined();
    });

    it('should list priorities without project ID', async () => {
      const mockPriorities = [{ id: 'low', label: 'Low' }, { id: 'high', label: 'High' }];
      mockSupportApi.listTicketPriorities.mockResolvedValue(mockPriorities as any);

      const result = await supportTicketsTask.listPriorities();
      expect(result).toBeDefined();
      expect(mockSupportApi.listTicketPriorities).toHaveBeenCalledWith({
        subscriptionId: undefined,
        category: undefined,
      });
    });

    it('should resolve subscription ID from project when projectId is provided', async () => {
      const mockProject = {
        subscription: { licenseUri: 'https://api.upsun.com/subscriptions/sub-456' },
      };
      (mockClient.projects.get as jest.Mock).mockResolvedValue(mockProject);

      const mockPriorities = [{ id: 'high', label: 'High' }];
      mockSupportApi.listTicketPriorities.mockResolvedValue(mockPriorities as any);

      await supportTicketsTask.listPriorities('proj-1', 'billing');
      expect(mockSupportApi.listTicketPriorities).toHaveBeenCalledWith({
        subscriptionId: 'sub-456',
        category: 'billing',
      });
    });

    it('should handle API error', async () => {
      mockSupportApi.listTicketPriorities.mockRejectedValue(new Error('Server error'));
      await expect(supportTicketsTask.listPriorities()).rejects.toThrow('Server error');
    });

    it('should call priorities API without subscriptionId when project has no licenseUri', async () => {
      (mockClient.projects.get as jest.Mock).mockResolvedValue({ subscription: {} });
      mockSupportApi.listTicketPriorities.mockResolvedValue([] as any);

      await supportTicketsTask.listPriorities('proj-1');
      expect(mockSupportApi.listTicketPriorities).toHaveBeenCalledWith({
        subscriptionId: undefined,
        category: undefined,
      });
    });
  });

  describe('update', () => {
    it('should have update method defined', () => {
      expect(supportTicketsTask.update).toBeDefined();
    });

    it('should update a ticket', async () => {
      const mockTicket = { id: 'tkt-1', status: 'closed' };
      mockSupportApi.updateTicket.mockResolvedValue(mockTicket as any);

      const result = await supportTicketsTask.update('tkt-1', { status: 'closed' } as any);
      expect(result).toBeDefined();
      expect(mockSupportApi.updateTicket).toHaveBeenCalledWith({
        ticketId: 'tkt-1',
        updateTicketRequest: { status: 'closed' },
      });
    });

    it('should throw when ticket ID is empty', async () => {
      await expect(supportTicketsTask.update('')).rejects.toThrow('Ticket ID is required');
    });

    it('should handle API error', async () => {
      mockSupportApi.updateTicket.mockRejectedValue(new Error('Not found'));
      await expect(supportTicketsTask.update('tkt-1')).rejects.toThrow('Not found');
    });
  });
});
