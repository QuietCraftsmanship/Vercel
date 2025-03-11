import chalk from 'chalk';
import output from '../../output-manager';
import stamp from '../../util/output/stamp';
import { targetCommand } from './command';
import { getCommandName } from '../../util/pkg-name';
import { ensureLink } from '../../util/link/ensure-link';
import { formatProject } from '../../util/projects/format-project';
import { formatEnvironment } from '../../util/target/format-environment';
import type Client from '../../util/client';
import type { CustomEnvironment } from '@vercel-internals/types';
import formatDate from '../../util/format-date';

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

  const inspectStamp = stamp();
  const link = await ensureLink(targetCommand.name, client, cwd);
  if (typeof link === 'number') {
    return link;
  }

  console.log(link.project);

  const [nameOrId] = argv;
  const target = link.project.customEnvironments?.find(
    t => t.slug === nameOrId || t.id === nameOrId
  );
  const projectSlugLink = formatProject(
    link.org.slug,
    link.project.name,
    '/settings/environments'
  );
  if (!target) {
    output.error(`Target "${nameOrId}" was not found under ${projectSlugLink}`);
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

  output.print('\n');
  output.print(chalk.bold('  Domains\n\n'));
  output.print(
    `    ${chalk.cyan('Status')}\t\t${target.branchMatcher ? 'Enabled' : 'Disabled'}\n`
  );

  return 0;
}
