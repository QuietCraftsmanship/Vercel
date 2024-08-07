import { Command } from '../help';
import { packageName } from '../../util/pkg-name';

export const listCommand = {
  name: 'list',
  description: 'List deployments for a project.',
  arguments: [
    {
      name: 'project',
      required: false,
    },
  ],
  options: [
    {
      name: 'meta',
      description:
        'Filter deployments by metadata (e.g.: `-m KEY=value`). Can appear many times',
      argument: 'KEY=value',
      shorthand: null,
      type: [String],
      deprecated: false,
    },
    {
      name: 'environment',
      description: 'Specify the target deployment environment to filter by',
      shorthand: null,
      type: String,
      deprecated: false,
    },
    {
      name: 'next',
      description: 'Show next page of results',
      argument: 'MS',
      shorthand: 'n',
      type: String,
      deprecated: false,
    },
    {
      name: 'limit',
      shorthand: null,
      description:
        'Number of results to return per page (default: 20, max: 100)',
      argument: 'NUMBER',
      type: Number,
      deprecated: false,
    },
    {
      name: 'prod',
      shorthand: null,
      type: Boolean,
      deprecated: false,
      description:
        'List only Production deployments (shorthand for `--environment=production`)',
    },
    {
      name: 'yes',
      shorthand: 'y',
      type: Boolean,
      deprecated: false,
      description: 'Use default options to skip all prompts',
    },
  ],
  examples: [
    {
      name: 'List all deployments for the currently linked project',
      value: `${packageName} list`,
    },
    {
      name: 'List all deployments for the project `my-app` in the team of the currently linked project',
      value: `${packageName} list my-app`,
    },
    {
      name: 'Filter deployments by metadata',
      value: `${packageName} list -m key1=value1 -m key2=value2`,
    },
    {
      name: 'Paginate deployments for a project, where `1584722256178` is the time in milliseconds since the UNIX epoch',
      value: `${packageName} list my-app --next 1584722256178`,
    },
  ],
} as const satisfies Command;
