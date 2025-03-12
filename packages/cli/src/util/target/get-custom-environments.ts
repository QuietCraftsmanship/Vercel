import type Client from '../client';
import type { CustomEnvironment } from '@vercel-internals/types';
import { isAPIError } from '../errors-ts';

export async function getCustomEnvironment(
  client: Client,
  projectId: string,
  customEnvironmentSlugOrId: string
) {
  try {
    return await client.fetch<CustomEnvironment>(
      `/projects/${encodeURIComponent(projectId)}/custom-environments/${encodeURIComponent(
        customEnvironmentSlugOrId
      )}`
    );
  } catch (err) {
    if (isAPIError(err) && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function getCustomEnvironments(client: Client, projectId: string) {
  const res = await client.fetch<{ environments: CustomEnvironment[] }>(
    `/projects/${encodeURIComponent(projectId)}/custom-environments`
  );
  return res.environments;
}

export function pickCustomEnvironment(
  customEnvironments: CustomEnvironment[],
  customEnvironmentSlugOrId?: string | undefined
): CustomEnvironment | undefined {
  if (!customEnvironmentSlugOrId) return undefined;
  return customEnvironments.find(
    ({ slug, id }) =>
      slug === customEnvironmentSlugOrId || id === customEnvironmentSlugOrId
  );
}
