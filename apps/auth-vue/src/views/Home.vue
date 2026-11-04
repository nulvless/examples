<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUser } from '@/composables/useUser';
import { nulvless } from '@/lib/nulvless';

const router = useRouter();
const { user, refreshUser } = useUser();

onMounted(refreshUser);

async function signOut() {
  await nulvless.auth.signOut();
  router.push({ name: 'sign-in' });
}
</script>

<template>
  <h1>Welcome{{ user?.profile?.name ? `, ${user.profile.name}` : '' }}</h1>
  <p v-if="user">You are signed in as {{ user.email ?? user.username ?? user.id }}.</p>
  <p v-else>Loading…</p>
  <button @click="signOut">Sign out</button>
</template>
