import chalk from 'chalk';
import type { LinkOptions } from '../output/create-output';
import output from '../../output-manager';

export function formatProject(
  orgSlug: string,
  projectSlug: string,
  urlPathSuffix = '',
  options?: LinkOptions
) {
  const orgProjectSlug = `${orgSlug}/${projectSlug}`;
  const projectUrl = `https://vercel.com/${orgProjectSlug}${urlPathSuffix}`;
  const projectSlugLink = output.link(chalk.bold(orgProjectSlug), projectUrl, {
    fallback: () => chalk.bold(orgProjectSlug),
    color: false,
    ...options,
  });
  return projectSlugLink;
}
