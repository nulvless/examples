import { ref } from 'vue';
import type { User } from '@nulvless/nulvless-js';
import { nulvless } from '@/lib/nulvless';

const user = ref<User | null>(null);

async function refreshUser() {
  const { data } = await nulvless.auth.users.me();
  user.value = data;
}

nulvless.auth.on('signed-in', refreshUser);
nulvless.auth.on('signed-out', () => (user.value = null));
nulvless.auth.on('unauthorized', () => (user.value = null));

export function useUser() {
  return { user, refreshUser };
}
