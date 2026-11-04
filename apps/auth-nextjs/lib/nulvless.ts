'use client';

import { createClient, Storage } from '@nulvless/nulvless-js';

export const nulvless = createClient(process.env.NEXT_PUBLIC_NULVLESS_URL!, process.env.NEXT_PUBLIC_NULVLESS_KEY!, {
  storage: Storage.Local,
  trackUser: true,
});
