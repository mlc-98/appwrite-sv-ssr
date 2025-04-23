// sv imports
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
// form imports
import { emailSchema, otpSchema } from './schemas';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createAdminClient, SESSION_COOKIE } from '$lib/server/appwrite';
import { handleAppwrite } from '$lib/utils';
import { logger } from '$lib/logger/winston';
import { uuidv7 } from 'uuidv7';

export const load: PageServerLoad = async () => {
  return {
    loginForm: await superValidate(zod(emailSchema)),
    otpForm: await superValidate(zod(otpSchema))
  };
};

export const actions: Actions = {
  sendEmail: async (event) => {
    const form = await superValidate(event, zod(emailSchema));
    if (!form.valid) {
      return fail(400, { form });
    }
    const newId = uuidv7();
    const { email } = form.data;
    const adminClient = createAdminClient();
    const [session, error] = await handleAppwrite(() =>
      adminClient.account.createEmailToken(newId, email)
    );
    if (error) {
      logger.error(error);
      throw error;
    }
    if (!session) {
      throw new Error('Session not found');
    }
    const userId = session.userId;
    return message(form, { userId, email });
  },
  signIn: async (event) => {
    const form = await superValidate(event, zod(otpSchema));
    if (!form.valid) {
      return fail(400, { form });
    }
    const { userId, otp } = form.data;
    const adminClient = createAdminClient();
    const [session, error] = await handleAppwrite(() =>
      adminClient.account.createSession(userId, otp)
    );

    if (error) {
      logger.error(error);
      return message(form, error.message, { status: 500 });
    }
    if (!session) {
      throw new Error('Session not found');
    }
    logger.info(`User successfully logged in: ${session.$id}, ${session.userId}`);
    event.cookies.set(SESSION_COOKIE, session.secret, {
      sameSite: 'strict',
      expires: new Date(session.expire),
      secure: true,
      path: '/'
    });

    redirect(303, '/');
  }
};
