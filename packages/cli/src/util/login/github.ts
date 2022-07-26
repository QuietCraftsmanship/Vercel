import { URL } from 'url';
import Client from '../client.js';
import doOauthLogin from './oauth.js';

export default function doGithubLogin(
  client: Client,
  outOfBand?: boolean,
  ssoUserId?: string
) {
  const url = new URL(
    '/api/registration/login-with-github',
    // Can't use `apiUrl` here because this URL sets a
    // cookie that the OAuth callback URL depends on
    'https://vercel.com'
  );
  return doOauthLogin(client, url, 'GitHub', outOfBand, ssoUserId);
}
