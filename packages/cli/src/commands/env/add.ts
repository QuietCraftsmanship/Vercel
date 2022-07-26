import chalk from 'chalk';
import { ProjectEnvTarget, Project, ProjectEnvType } from '../../types.js';
import { Output } from '../../util/output/index.js';
import Client from '../../util/client.js';
import stamp from '../../util/output/stamp.js';
import addEnvRecord from '../../util/env/add-env-record.js';
import getEnvRecords from '../../util/env/get-env-records.js';
import {
  isValidEnvTarget,
  getEnvTargetPlaceholder,
  getEnvTargetChoices,
} from '../../util/env/env-target.js';
import readStandardInput from '../../util/input/read-standard-input.js';
import param from '../../util/output/param.js';
import { emoji, prependEmoji } from '../../util/emoji.js';
import { isKnownError } from '../../util/env/known-error.js';
import { getCommandName } from '../../util/pkg-name.js';
import { isAPIError } from '../../util/errors-ts.js';

type Options = {
  '--debug': boolean;
};

export default async function add(
  client: Client,
  project: Project,
  opts: Partial<Options>,
  args: string[],
  output: Output
) {
  // improve the way we show inquirer prompts
  await import('../../util/input/patch-inquirer.js');

  const stdInput = await readStandardInput(client.stdin);
  let [envName, envTargetArg, envGitBranch] = args;

  if (args.length > 3) {
    output.error(
      `Invalid number of arguments. Usage: ${getCommandName(
        `env add <name> ${getEnvTargetPlaceholder()} <gitbranch>`
      )}`
    );
    return 1;
  }

  if (stdInput && (!envName || !envTargetArg)) {
    output.error(
      `Invalid number of arguments. Usage: ${getCommandName(
        `env add <name> <target> <gitbranch> < <file>`
      )}`
    );
    return 1;
  }

  let envTargets: ProjectEnvTarget[] = [];
  if (envTargetArg) {
    if (!isValidEnvTarget(envTargetArg)) {
      output.error(
        `The Environment ${param(
          envTargetArg
        )} is invalid. It must be one of: ${getEnvTargetPlaceholder()}.`
      );
      return 1;
    }
    envTargets.push(envTargetArg);
  }

  while (!envName) {
    const { inputName } = await client.prompt({
      type: 'input',
      name: 'inputName',
      message: `What’s the name of the variable?`,
    });

    envName = inputName;

    if (!inputName) {
      output.error('Name cannot be empty');
    }
  }

  const { envs } = await getEnvRecords(
    output,
    client,
    project.id,
    'vercel-cli:env:add'
  );
  const existing = new Set(
    envs.filter(r => r.key === envName).map(r => r.target)
  );
  const choices = getEnvTargetChoices().filter(c => !existing.has(c.value));

  if (choices.length === 0) {
    output.error(
      `The variable ${param(
        envName
      )} has already been added to all Environments. To remove, run ${getCommandName(
        `env rm ${envName}`
      )}.`
    );
    return 1;
  }

  let envValue: string;

  if (stdInput) {
    envValue = stdInput;
  } else {
    const { inputValue } = await client.prompt({
      type: 'input',
      name: 'inputValue',
      message: `What’s the value of ${envName}?`,
    });

    envValue = inputValue || '';
  }

  while (envTargets.length === 0) {
    const { inputTargets } = await client.prompt({
      name: 'inputTargets',
      type: 'checkbox',
      message: `Add ${envName} to which Environments (select multiple)?`,
      choices,
    });

    envTargets = inputTargets;

    if (inputTargets.length === 0) {
      output.error('Please select at least one Environment');
    }
  }

  if (
    !stdInput &&
    !envGitBranch &&
    envTargets.length === 1 &&
    envTargets[0] === ProjectEnvTarget.Preview
  ) {
    const { inputValue } = await client.prompt({
      type: 'input',
      name: 'inputValue',
      message: `Add ${envName} to which Git branch? (leave empty for all Preview branches)?`,
    });
    envGitBranch = inputValue || '';
  }

  const addStamp = stamp();
  try {
    output.spinner('Saving');
    await addEnvRecord(
      output,
      client,
      project.id,
      ProjectEnvType.Encrypted,
      envName,
      envValue,
      envTargets,
      envGitBranch
    );
  } catch (err: unknown) {
    if (isAPIError(err) && isKnownError(err)) {
      output.error(err.serverMessage);
      return 1;
    }
    throw err;
  }

  output.print(
    `${prependEmoji(
      `Added Environment Variable ${chalk.bold(
        envName
      )} to Project ${chalk.bold(project.name)} ${chalk.gray(addStamp())}`,
      emoji('success')
    )}\n`
  );

  return 0;
}
