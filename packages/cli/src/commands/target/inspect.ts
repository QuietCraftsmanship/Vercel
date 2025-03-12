import chalk from 'chalk';
import output from '../../output-manager';
import stamp from '../../util/output/stamp';
import link from '../../util/output/link';
import { targetCommand } from './command';
import { getCommandName } from '../../util/pkg-name';
import { ensureLink } from '../../util/link/ensure-link';
import { formatProject } from '../../util/projects/format-project';
import formatDate from '../../util/format-date';
import { formatBranchMatcher } from '../../util/target/format-branch-matcher';
import { getCustomEnvironment } from '../../util/target/get-custom-environments';
import type Client from '../../util/client';
import type { CustomEnvironmentBranchMatcher } from '@vercel-internals/types';

const BRANCH_MATCHER_TYPE_MAP: Record<
  CustomEnvironmentBranchMatcher['type'],
  string
> = {
  equals: 'Matches',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
};

export default async function inspect(client: Client, argv: string[]) {
  const { cwd } = client;
  if (argv.length !== 1) {
    output.error(
      `Invalid number of arguments. Usage: ${chalk.cyan(
        `${getCommandName('target inspect <name>')}`
      )}`
    );
    return 2;
  }

  const projectLink = await ensureLink(targetCommand.name, client, cwd);
  if (typeof projectLink === 'number') {
    return projectLink;
  }
  client.config.currentTeam = projectLink.org.id;

  const inspectStamp = stamp();
  const [nameOrId] = argv;
  const projectSlugLink = formatProject(
    projectLink.org.slug,
    projectLink.project.name,
    '/settings/environments'
  );
  const target = await getCustomEnvironment(
    client,
    projectLink.project.id,
    nameOrId
  );
  if (!target) {
    output.error(
      `Environment "${nameOrId}" was not found under ${projectSlugLink}`
    );
    return 1;
  }

  output.log(
    `Custom Environment ${chalk.bold(target.slug)} found under ${projectSlugLink} ${chalk.gray(
      inspectStamp()
    )}`
  );
  output.print('\n');
  output.print(chalk.bold('  General\n\n'));
  output.print(`    ${chalk.cyan('Name')}\t\t${target.slug}\n`);
  output.print(
    `    ${chalk.cyan('Description')}\t\t${target.description || chalk.dim('(none)')}\n`
  );
  output.print(
    `    ${chalk.cyan('Created At')}\t\t${formatDate(target.createdAt)}\n`
  );

  output.print('\n');
  output.print(chalk.bold('  Branch Tracking\n\n'));
  output.print(
    `    ${chalk.cyan('Status')}\t\t${target.branchMatcher ? 'Enabled' : 'Disabled'}\n`
  );
  if (target.branchMatcher) {
    output.print(
      `    ${chalk.cyan('Branch Pattern')}\t${chalk.dim(BRANCH_MATCHER_TYPE_MAP[target.branchMatcher.type])} ${formatBranchMatcher(target.branchMatcher)}\n`
    );
  }

  output.print('\n');
  output.print(chalk.bold('  Domains\n\n'));
  if (!target.domains || target.domains.length === 0) {
    output.print(`    ${chalk.dim('No Domains Attached')}\n`);
  } else {
    for (const domain of target.domains) {
      output.print(`    ${link(domain.name)}\n`);
    }
  }

  output.print('\n');

  return 0;
}
