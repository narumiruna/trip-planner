import fs from 'fs';
import path from 'path';

describe('CI workflow dependency audit', () => {
  it('runs production npm audit in GitHub Actions CI', () => {
    const workflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows/ci.yml'), 'utf8');

    expect(workflow).toContain('npm audit --omit=dev');
  });
});
