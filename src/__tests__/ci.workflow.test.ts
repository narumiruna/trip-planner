import fs from 'fs';
import path from 'path';

describe('CI workflow dependency audit', () => {
  it('runs production npm audit in GitHub Actions CI', () => {
    const workflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows/ci.yml'), 'utf8');

    expect(workflow).toContain('npm audit --omit=dev');
  });

  it('runs Prisma generation in local just ci before checks', () => {
    const justfile = fs.readFileSync(path.join(process.cwd(), 'justfile'), 'utf8');

    expect(justfile).toContain('ci: ci-install audit-prod db-generate lint test-ci ci-build');
  });
});
