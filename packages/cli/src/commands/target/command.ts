import { packageName } from '../../util/pkg-name';

export const inspectSubcommand = {
  name: 'inspect',
  aliases: [],
  description: 'Displays information related to a project environment',
  arguments: [
    {
      name: 'name|id',
      required: true,
    },
  ],
  options: [],
  examples: [],
} as const;

export const listSubcommand = {
  name: 'list',
  aliases: ['ls'],
  description: 'List targets defined for the current Project',
  arguments: [],
  options: [],
  examples: [
    {
      name: 'List all targets for the current Project',
      value: `${packageName} target ls my-project`,
    },
  ],
} as const;

export const targetCommand = {
  name: 'target',
  aliases: ['targets'],
  description: 'Manage your Vercel Project\'s "targets" (custom environments).',
  arguments: [],
  subcommands: [inspectSubcommand, listSubcommand],
  options: [],
  examples: [],
} as const;
