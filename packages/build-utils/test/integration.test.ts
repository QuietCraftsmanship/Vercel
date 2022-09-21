import path from 'path';
import fs from 'fs-extra';
import {
  testDeployment,
  // @ts-expect-error
} from '../../../test/lib/deployment/test-deployment';

jest.setTimeout(4 * 60 * 1000);

const fixturesPath = path.resolve(__dirname, 'fixtures');

// Fixtures that have separate tests and should be skipped in the loop
const skipFixtures: string[] = [
  '01-zero-config-api',
  '02-zero-config-api',
  '03-zero-config-angular',
  '04-zero-config-brunch',
  '05-zero-config-gatsby',
  '06-zero-config-hugo',
  '07-zero-config-jekyll',
  '08-zero-config-middleman',
  '21-npm-workspaces',
  '23-pnpm-workspaces',
  '41-nx-monorepo',
  '42-npm-workspace-with-nx',
];

for (const fixture of fs.readdirSync(fixturesPath)) {
  if (skipFixtures.includes(fixture)) {
    continue;
  }

  it(`Should build "${fixture}"`, async () => {
    await expect(
      testDeployment(path.join(fixturesPath, fixture)),
    ).resolves.toBeDefined();
  });
}

// few foreign tests

const buildersToTestWith = ['node'];

for (const builder of buildersToTestWith) {
  const fixturesPath2 = path.resolve(
    __dirname,
    `../../${builder}/test/fixtures`,
  );

  for (const fixture of fs.readdirSync(fixturesPath2)) {
    // don't run all foreign fixtures, just some
    if (['01-cowsay', '01-cache-headers', '03-env-vars'].includes(fixture)) {
      it(`Should build "${builder}/${fixture}"`, async () => {
        await expect(
          testDeployment(path.join(fixturesPath2, fixture)),
        ).resolves.toBeDefined();
      });
    }
  }
}
