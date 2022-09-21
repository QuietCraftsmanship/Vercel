import { stringify } from 'querystring';
import * as ERRORS from '../errors-ts';
import type { Cert } from '../../types';
import type Client from '../client';

interface Response {
  certs: Cert[];
}

export async function getCustomCertsForDomain(
  client: Client,
  context: string,
  domain: string,
) {
  try {
    const { certs } = await client.fetch<Response>(
      `/v5/now/certs?${stringify({ domain, custom: true })}`,
    );
    return certs;
  } catch (err: unknown) {
    if (ERRORS.isAPIError(err) && err.code === 'forbidden') {
      return new ERRORS.CertsPermissionDenied(context, domain);
    }
    throw err;
  }
}
