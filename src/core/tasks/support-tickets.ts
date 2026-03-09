import { DefaultApi, ListTicketsRequest, SupportApi } from '../../api/index.js';
import {
  CreateTicketRequest,
  ListTicketCategories200ResponseInner,
  ListTicketPriorities200ResponseInner,
  ListTickets200Response,
  Ticket,
  UpdateTicketRequest,
} from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class SupportTicketsTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private defaultApi: DefaultApi,
    private supportApi: SupportApi,
  ) {
    super(client);
  }

  /**
   * List support tickets.
   * @param filters - Optional filters and pagination options.
   * @returns A paginated list of support tickets.
   */
  async list(filters?: ListTicketsRequest): Promise<ListTickets200Response> {
    return await this.defaultApi.listTickets(filters);
  }

  /**
   * Create a new support ticket.
   * @param subject - Ticket subject.
   * @param description - Ticket description.
   * @param params - Optional ticket fields.
   * @returns The created ticket.
   */
  async create(
    subject: string,
    description: string,
    params?: Omit<CreateTicketRequest, 'subject' | 'description'>,
  ): Promise<Ticket> {
    if (!subject) {
      throw new Error('Subject is required');
    }

    if (!description) {
      throw new Error('Description is required');
    }

    return await this.supportApi.createTicket({
      createTicketRequest: {
        subject,
        description,
        ...params,
      },
    });
  }

  /**
   * List support ticket categories.
   * @param organizationId - Optional organization ID.
   * @param projectId - Optional project ID used to infer subscription ID.
   * @returns Available ticket categories.
   */
  async listCategories(
    organizationId?: string,
    projectId?: string,
  ): Promise<Array<ListTicketCategories200ResponseInner>> {
    let subscriptionId: string | undefined;

    if (projectId) {
      TaskBase.checkProjectId(projectId);
      const project = await this.client.projects.get(projectId);
      const projectLicenseUri = project.subscription?.licenseUri;

      if (projectLicenseUri) {
        subscriptionId = TaskBase.extractSubscriptionId(projectLicenseUri);
      }
    }

    return await this.supportApi.listTicketCategories({
      subscriptionId,
      organizationId,
    });
  }

  /**
   * List support ticket priorities.
   * @param projectId - Optional project ID used to infer subscription ID.
   * @param category - Optional category.
   * @returns Available ticket priorities.
   */
  async listPriorities(
    projectId?: string,
    category?: string,
  ): Promise<Array<ListTicketPriorities200ResponseInner>> {
    let subscriptionId: string | undefined;

    if (projectId) {
      TaskBase.checkProjectId(projectId);
      const project = await this.client.projects.get(projectId);
      const projectLicenseUri = project.subscription?.licenseUri;

      if (projectLicenseUri) {
        subscriptionId = TaskBase.extractSubscriptionId(projectLicenseUri);
      }
    }

    return await this.supportApi.listTicketPriorities({
      subscriptionId,
      category,
    });
  }

  /**
   * Update a support ticket.
   * @param ticketId - The ID of the ticket to update.
   * @param params - Fields to update.
   * @returns The updated ticket.
   */
  async update(ticketId: string, params?: UpdateTicketRequest): Promise<Ticket | null | undefined> {
    TaskBase.checkTicketId(ticketId);

    return await this.supportApi.updateTicket({
      ticketId,
      updateTicketRequest: params,
    });
  }
}
