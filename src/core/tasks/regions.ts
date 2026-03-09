import { ListRegionsRequest, RegionsApi } from '../../api/index.js';
import { ListRegions200Response, Region } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class RegionsTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private regionsApi: RegionsApi,
  ) {
    super(client);
  }

  /**
   * Get details of a specific region.
   * @param regionId - The ID of the region to retrieve.
   * @returns The details of the specified region.
   */
  async get(regionId: string): Promise<Region> {
    TaskBase.checkProjectRegion(regionId);

    return await this.regionsApi.getRegion({ regionId });
  }

  /**
   * List regions with optional filtering and pagination.
   * @param filters - Optional filters and pagination options.
   * @returns A paginated collection of regions.
   */
  async list(filters?: ListRegionsRequest): Promise<ListRegions200Response> {
    return await this.regionsApi.listRegions(filters);
  }
}
