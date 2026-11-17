import * as fs from 'fs';
import * as path from 'path';
import { Configuration } from '../../../src/core/runtime.js';

describe('User-Agent', () => {
  it('sends the package.json version', () => {
    const { version } = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'),
    );

    expect(new Configuration().headers?.['User-Agent']).toBe(`upsun-sdk-node@${version}`);
  });
});
