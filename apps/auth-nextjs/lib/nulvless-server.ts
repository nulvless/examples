import 'server-only';

import { createServerClient } from '@nulvless/nulvless-js';

export const nulvlessServer = createServerClient(process.env.NEXT_PUBLIC_NULVLESS_URL!, process.env.NULVLESS_SECRET!);
