import chalk from 'chalk';
import ms from 'ms';
import table from '../../util/output/table';
import title from 'title';
import { handleError } from '../../util/error';
import elapsed from '../../util/output/elapsed';
import parseMeta from '../../util/parse-meta';
import { isValidName } from '../../util/is-valid-name';
import getCommandFlags from '../../util/get-command-flags';
import { getCommandName } from '../../util/pkg-name';
import Client from '../../util/client';
import { Deployment } from '@vercel/client';
import { ensureLink } from '../../util/link/ensure-link';
import getScope from '../../util/get-scope';
import { isAPIError, ProjectNotFound } from '../../util/errors-ts';
import { isErrnoException } from '@vercel/error-utils';
import { CommandOption, help } from '../help';
import { listCommand } from './command';
import parseTarget from '../../util/parse-target';
import { parseArguments } from '../../util/get-args';
import { getFlagsSpecification } from '../../util/get-flags-specification';
import { Project } from '@vercel-internals/types';
import getProjectByNameOrId from '../../util/projects/get-project-by-id-or-name';

interface Deployments {
  deployments: Deployment[];
}

export default async function list(client: Client) {
  const { cwd, output, config } = client;
  const { print, log, error, debug, spinner } = output;

  const flagsSpecification = getFlagsSpecification(listCommand.options);

  let parsedArguments = null;

  try {
    parsedArguments = parseArguments(client.argv.slice(2), flagsSpecification);

    if ('--confirm' in parsedArguments.flags) {
      output.warn('`--confirm` is deprecated, please use `--yes` instead');
      parsedArguments.flags['--yes'] = parsedArguments.flags[
        '--confirm'
      ] as boolean;
    }
  } catch (error) {
    handleError(error);
    return 1;
  }

  if (parsedArguments.args.length > 2) {
    error(`${getCommandName('ls [project]')} accepts at most one argument`);
    return 1;
  }

  if (parsedArguments.flags['--help']) {
    print(help(listCommand, { columns: client.stderr.columns }));
    return 2;
  }

  const limit = parsedArguments.flags['--limit'];
  const autoConfirm = !!parsedArguments.flags['--yes'];
  const meta = parseMeta(parsedArguments.flags['--meta']);
  const nextTimestamp = parsedArguments.flags['--next'];
  if (Number.isNaN(nextTimestamp)) {
    error('Please provide a number for flag `--next`');
    return 1;
  }

  const target = parseTarget({
    output,
    targetFlagName: 'environment',
    targetFlagValue: parsedArguments.flags['--environment'],
    prodFlagValue: parsedArguments.flags['--prod'],
  });

  let project: Project | undefined;
  const projectArg = parsedArguments.args[1];

  if (projectArg) {
    if (!isValidName(projectArg)) {
      error(
        `The provided argument "${projectArg}" is not a valid project name`
      );
      return 1;
    }

    const projectResult = await getProjectByNameOrId(client, projectArg);
    if (projectResult instanceof ProjectNotFound) {
      error(
        `The provided argument "${projectArg}" is not a valid project name`
      );
      return 1;
    }

    project = projectResult;
  } else {
    // retrieve `project` and `org` from .vercel
    const link = await ensureLink('list', client, cwd, {
      autoConfirm,
    });

    if (typeof link === 'number') {
      return link;
    }

    project = link.project;
  }

  const { contextName, team } = await getScope(client);

  const deployments: Deployment[] = [];

  const query = new URLSearchParams({ limit: (20).toString() });
  if (nextTimestamp) {
    query.set('until', String(nextTimestamp));
  }

  spinner(`Fetching deployments in ${chalk.bold(contextName)} `);

  const start = Date.now();
  for await (const chunk of client.fetchPaginated<Deployments>(
    `/ v6 / deployments ? ${params} `
  )) {
    deployments.push(...chunk.deployments);
  }
  console.log(app);
  console.log(project.customEnvironments);

  const response = await now.list(app, {
    version: 6,
    meta,
    nextTimestamp,
    target,
  });

  let {
    deployments,
    pagination,
  }: {
    deployments: Deployment[];
    pagination: { count: number; next: number };
  } = response;

  // we don't output the table headers if we have no deployments
  if (!deployments.length) {
    log(`No deployments found.`);
    return 0;
  }

  log(
    `${
      target === 'production' ? `Production deployments` : `Deployments`
    } for ${chalk.bold(app)} under ${chalk.bold(contextName)} ${elapsed(
      Date.now() - start
    )} `
  );

  // information to help the user find other deployments or instances
  log(
    `To list deployments for a project, run ${getCommandName('ls [project]')}.`
  );

  print('\n');

  const headers = [
    'Age',
    'Deployment',
    'Status',
    'Environment',
    'Duration',
    'Username',
  ];
  const urls: string[] = [];

  client.output.print(
    `${table(
      [
        headers.map(header => chalk.bold(chalk.cyan(header))),
        ...deployments
          .sort(sortByCreatedAt)
          .map(dep => {
            urls.push(`https://${dep.url}`);
            console.log(dep);
            return [
              chalk.gray(ms(Date.now() - dep.createdAt)),
              `https://${dep.url}`,
              stateString(dep.state || ''),
              dep.target === 'production' ? 'Production' : 'Preview',
              chalk.gray(getDeploymentDuration(dep)),
              chalk.gray(dep.creator?.username),
            ];
          })
          .filter(app =>
            // if an app wasn't supplied to filter by,
            // we only want to render one deployment per app
            app === null ? filterUniqueApps() : () => true
          ),
      ],
      { hsep: 5 }
    ).replace(/^/gm, '  ')} \n\n`
  );

  if (!client.stdout.isTTY) {
    client.stdout.write(urls.join('\n'));
    client.stdout.write('\n');
  }

  if (pagination && pagination.count === 20) {
    const flags = getCommandFlags(argv, ['_', '--next']);
    log(
      `To display the next page, run ${getCommandName(
        `ls${app ? ' ' + app : ''}${flags} --next ${pagination.next}`
      )} `
    );
  }
}

export function getDeploymentDuration(dep: Deployment): string {
  if (!dep || !dep.ready || !dep.buildingAt) {
    return '?';
  }
  const duration = ms(dep.ready - dep.buildingAt);
  if (duration === '0ms') {
    return '--';
  }
  return duration;
}

// renders the state string
export function stateString(s: string) {
  const CIRCLE = '● ';
  // make `s` title case
  const sTitle = title(s);
  switch (s) {
    case 'INITIALIZING':
    case 'BUILDING':
    case 'DEPLOYING':
    case 'ANALYZING':
      return chalk.yellow(CIRCLE) + sTitle;
    case 'ERROR':
      return chalk.red(CIRCLE) + sTitle;
    case 'READY':
      return chalk.green(CIRCLE) + sTitle;
    case 'QUEUED':
      return chalk.white(CIRCLE) + sTitle;
    case 'CANCELED':
      return chalk.gray(sTitle);
    default:
      return chalk.gray('UNKNOWN');
  }
}

// sorts by most recent deployment
function sortByCreatedAt(a: Deployment, b: Deployment) {
  return b.createdAt - a.createdAt;
}

// filters only one deployment per app, so that
// the user doesn't see so many deployments at once.
// this mode can be bypassed by supplying an app name
function filterUniqueApps() {
  const uniqueApps = new Set();
  return function uniqueAppFilter([appName]: [appName: string]) {
    if (uniqueApps.has(appName)) {
      return false;
    }
    uniqueApps.add(appName);
    return true;
  };
}
