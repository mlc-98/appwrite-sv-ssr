import { Account, Client } from 'node-appwrite';
import { APPWRITE_KEY } from '$env/static/private';
import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT } from '$env/static/public';
import type { RequestEvent } from '@sveltejs/kit';

export const SESSION_COOKIE = '__appwrite_session_cookie';

// createAdminClient is used to connect to the backend without being
// authenticated. Its purpose is to allow users to create accounts.
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
    .setProject(PUBLIC_APPWRITE_PROJECT)
    .setKey(APPWRITE_KEY); // Set the Appwrite API key!

  // Return the services we want to use.
  return {
    get account() {
      return new Account(client);
    }
  };
}

// createSessionClient is called whenever an authenticated user
// wants to perform an action. This will first check if there's
// a session, and if there's one, it will return the Account
// entity that allows users to interact with the backend.
export function createSessionClient(event: RequestEvent) {
  const client = new Client()
    .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
    .setProject(PUBLIC_APPWRITE_PROJECT);

  // Extract our custom domain's session cookie from the request
  const session = event.cookies.get(SESSION_COOKIE);
  if (!session) {
    throw new Error('No user session');
  }

  client.setSession(session);

  // Return the services we want to use.
  return {
    get account() {
      return new Account(client);
    }
  };
}
