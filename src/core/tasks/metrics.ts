import { UpsunClient } from '../../upsun.js';
import { Metrics } from '../../model/index.js';
import { TaskBase } from './task_base.js';

// Si fetch n'est pas disponible nativement, utiliser node-fetch ou globalThis.fetch

export class MetricsTask extends TaskBase {
  async fetchMetrics(projectId: string, env_name: string, region: string): Promise<Metrics[]> {
    const results: Metrics[] = [];
    const url = `https://metrics-${projectId}.${region}.platformsh.site/v1/metrics/query`;

    const query = {
      // "stream": {
      //     "collection": `vendor=platformsh/region=eu-3.platform.sh/project=${projectId}/environment=${env_name}`,
      //     "stream": "metrics"
      // },
      // "range": {
      //   "from": "2025-09-29T12:25:02+02:00",
      //   "to": "2025-09-29T12:27:02+02:00"
      // }
      interval: '120s',
      stream: {
        collection: `vendor=platformsh/region=${region}.platform.sh/project=${projectId}/environment=${env_name}`,
        stream: 'metrics',
      },
      range: {
        from: '2025-09-29T12:25:02+02:00',
        to: '2025-09-29T12:27:02+02:00',
      },
      fields: [
        {
          name: 'cpu.max',
          expr: '`cpu.cores`',
        },
        //   {
        //     "name": "memory.max",
        //     "expr": "`memory.limit`"
        //   },
        //   {
        //     "name": "disk.value",
        //     "expr": "`disk.space.used`"
        //   },
        //   {
        //     "name": "cpu.value",
        //     "expr": "SUM((`cpu.user` + `cpu.kernel`) / `interval`, 'service', 'instance')"
        //   },
        //   {
        //     "name": "cpu.percentage",
        //     "expr": "100 * SUM((`cpu.user` + `cpu.kernel`) / (`interval` * `cpu.cores`), 'service', 'instance')"
        //   },

        //   {
        //     "name": "cpu.average.value",
        //     "expr": "AVG(SUM((`cpu.user` + `cpu.kernel`) / `interval`, 'service', 'instance'), 'service')"
        //   },
        //   {
        //     "name": "cpu.average.percentage",
        //     "expr": "AVG(100 * SUM((`cpu.user` + `cpu.kernel`) / (`interval` * `cpu.cores`), 'service', 'instance'), 'service')"
        //   },
        //   {
        //     "name": "memory.value",
        //     "expr": "SUM(`memory.apps` + `memory.kernel` + `memory.buffers`, 'service', 'instance')"
        //   },
        //   {
        //     "name": "memory.percentage",
        //     "expr": "100 * SUM((`memory.apps` + `memory.kernel` + `memory.buffers`) / `memory.limit`, 'service', 'instance')"
        //   },

        //   {
        //     "name": "memory.average.value",
        //     "expr": "AVG(SUM(`memory.apps` + `memory.kernel` + `memory.buffers`, 'service', 'instance'), 'service')"
        //   },
        //   {
        //     "name": "memory.average.percentage",
        //     "expr": "AVG(100 * SUM((`memory.apps` + `memory.kernel` + `memory.buffers`) / `memory.limit`, 'service', 'instance'), 'service')"
        //   },
        //   {
        //     "name": "disk.percentage",
        //     "expr": "100 * (`disk.space.used`/`disk.space.limit`)"
        //   },
        //   {
        //     "name": "disk.max",
        //     "expr": "AVG(`disk.space.limit`, 'mountpoint', 'service', 'instance')"
        //   },
        //   {
        //     "name": "disk.average.value",
        //     "expr": "AVG(`disk.space.used`, 'mountpoint', 'service')"
        //   },
        //   {
        //     "name": "disk.average.percentage",
        //     "expr": "AVG(100*(`disk.space.used`/`disk.space.limit`), 'mountpoint', 'service')"
        //   }
      ],
    };

    const bearer = await this.client.getToken();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: bearer,
      },
      body: JSON.stringify(query),
    });
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    }

    // Hack because response is text/plain not application/json !!
    // (not valid JSON because multiple JSON objects separated by new lines)
    const text = await response.text();
    const texts = text.split('\n');
    texts.forEach((t, i) => {
      try {
        if (t.trim() !== '') {
          const dto = JSON.parse(t);
          results.push(dto);
        }
      } catch (error) {
        // console.error('Error parsing response:', error);
      }
    });

    return results;
  }

  constructor(protected readonly client: UpsunClient) {
    super(client);
  }
}
