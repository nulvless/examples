import { createServerClient } from '@nulvless/nulvless-js';

export const nulvless = createServerClient(process.env.NULVLESS_URL!, process.env.NULVLESS_SECRET!);
