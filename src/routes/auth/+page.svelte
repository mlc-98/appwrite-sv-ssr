<script lang="ts">
  // sv imports
  import { getContext, setContext } from 'svelte';
  import type { PageData } from './$types';
  // ui imports
  import { blur } from 'svelte/transition';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { ChevronLeft } from '@lucide/svelte';
  import { Separator } from '$lib/components/ui/separator/index.js';

  import { emailKey, showOtpFormKey, userIdKey } from './auth-context';
  import EmailForm from './email-form.svelte';
  import OtpForm from './otp-form.svelte';

  let { data }: { data: PageData } = $props();

  const { appName } = data;

  let emailProps = {
    form: data.loginForm
  };

  let otpProps = {
    form: data.otpForm
  };

  let emailPlaceholder = $state('');
  let userId = $state('');
  let showOtpForm = $state(false);

  // While waiting for the OTP, we want to let the user know the email
  // address they provided; this context allow us to save it temporarily.
  // This email instance is independent from the one in the form.
  setContext(emailKey, {
    get email() {
      return emailPlaceholder;
    },
    set email(value: string) {
      emailPlaceholder = value;
    }
  });
  // Sending the OTP to the server for validation requires us to
  // attach the user id too. Since the user id is returned in a server action,
  // we use this context to store it from login-form.svelte, and make it
  // available in sibling and child components.
  setContext(userIdKey, {
    get userId() {
      return userId;
    },
    set userId(value: string) {
      userId = value;
    }
  });

  // This store simply tells the +page.svelte parent component if it should
  // render the email form, or the otp form.
  setContext(showOtpFormKey, {
    get showOtpForm() {
      return showOtpForm;
    },
    set showOtpForm(value: boolean) {
      showOtpForm = value;
    }
  });

  const emailContext = getContext<{ email: string }>(emailKey);
  const otpFormContext = getContext<{ showOtpForm: boolean }>(showOtpFormKey);
</script>

<div class="flex h-full flex-col items-center justify-center bg-white">
  <div class="text-center">
    <h1 class="text-4xl font-medium">{appName}</h1>
  </div>
  <Separator class="mb-5 mt-20" />
  <Card.Root class="m-2 max-w-[350px] border-0 shadow-xl">
    <Card.Header>
      <Card.Title>Sign in</Card.Title>
      <Card.Description
        >Use your email address and the one-time password we will provide you to sign in to the app.</Card.Description
      >
    </Card.Header>
    <Card.Content>
      {#if showOtpForm}
        <div transition:blur>
          <Button
            variant="ghost"
            onclick={() => (otpFormContext.showOtpForm = false)}
            class="text-sm"
          >
            <ChevronLeft size="2" />
            Go back</Button
          >
          <div class="mb-2 text-xs text-gray-500">
            We've sent the verification code to <strong>{emailContext.email}</strong>.
          </div>
          <OtpForm {otpProps} />
        </div>
      {:else}
        <EmailForm {emailProps} />
      {/if}
    </Card.Content>
  </Card.Root>
</div>
