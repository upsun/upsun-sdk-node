import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class SourceOperationsTask extends TaskBase {
  constructor(protected readonly client: UpsunClient) {
    super(client);
  }
}
