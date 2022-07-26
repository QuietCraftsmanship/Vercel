import Client from '../client.js';

export default async function confirm(
  client: Client,
  message: string,
  preferred: boolean
): Promise<boolean> {
  await import('./patch-inquirer.js');

  const answers = await client.prompt({
    type: 'confirm',
    name: 'value',
    message,
    default: preferred,
  });

  return answers.value;
}
