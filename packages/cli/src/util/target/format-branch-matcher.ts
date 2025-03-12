import chalk from 'chalk';
import type { CustomEnvironmentBranchMatcher } from '@vercel-internals/types';

export function formatBranchMatcher(
  branchMatcher?: CustomEnvironmentBranchMatcher
): string {
  if (branchMatcher?.type === 'equals') {
    return branchMatcher.pattern;
  } else if (branchMatcher?.type === 'startsWith') {
    return `${branchMatcher.pattern}${chalk.dim('*')}`;
  } else if (branchMatcher?.type === 'endsWith') {
    return `${chalk.dim('*')}${branchMatcher.pattern}`;
  }
  return chalk.dim('No branch configuration');
}
