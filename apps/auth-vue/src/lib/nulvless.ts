import { createClient, Storage } from '@nulvless/nulvless-js';

export const nulvless = createClient(import.meta.env.VITE_NULVLESS_URL, import.meta.env.VITE_NULVLESS_KEY, {
  storage: Storage.Local,
  trackUser: true,
});
