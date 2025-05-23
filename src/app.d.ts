// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { Models } from 'node-appwrite';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: Models.User<Models.Preferences> | undefined;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
