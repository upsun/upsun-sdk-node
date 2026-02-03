import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class WorkersTask extends TaskBase {
  constructor(protected readonly client: UpsunClient) {
    super(client);
  }
}
