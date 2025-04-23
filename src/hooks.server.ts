// sv imports
import type { Handle } from '@sveltejs/kit';
import { logger } from '$lib/logger/winston';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
// appwrite imports
import { createSessionClient } from '$lib/server/appwrite';

// appwriteHook sets the user in the current request.
const appwriteHook: Handle = async ({ event, resolve }) => {
  try {
    const { account } = createSessionClient(event);
    event.locals.user = await account.get();
  } catch (e) {
    // TODO: handle error appropriately
    logger.info(e);
  }
  return resolve(event);
};

const authGuard: Handle = async ({ event, resolve }) => {
  // user is trying to access auth route, but there's an existing session
  if (event.locals.user && event.url.pathname.startsWith('/auth')) {
    redirect(303, '/app');
  }

  // no active session, user is trying to access protected route
  if (!event.locals.user && event.url.pathname.startsWith('/app')) {
    redirect(303, '/auth');
  }

  // root '/' is not an actual page
  if (event.url.pathname === '/') {
    redirect(303, '/auth');
  }

  return resolve(event);
};

export const handle: Handle = sequence(appwriteHook, authGuard);
