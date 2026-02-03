import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class MountsTask extends TaskBase {
  constructor(protected readonly client: UpsunClient) {
    super(client);
  }

  async download(projectId: string, mountId: string): Promise<never> {
    throw new Error('Cannot be implemented');
  }

  async list(projectId: string): Promise<never> {
    throw new Error('Cannot be implemented');
  }

  async upload(projectId: string, mountId: string): Promise<never> {
    throw new Error('Cannot be implemented');
  }
}
