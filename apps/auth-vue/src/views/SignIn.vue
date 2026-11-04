<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { nulvless } from '@/lib/nulvless';

const route = useRoute();
const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const submitting = ref(false);

async function signIn() {
  if (submitting.value) return;
  submitting.value = true;
  error.value = null;

  const { data, error: signInError } = await nulvless.auth.signIn({ email: email.value, password: password.value });
  submitting.value = false;

  if (signInError) {
    error.value = 'Check your email and password.';
    return;
  }
  if (data.challenge) {
    error.value = 'This account uses MFA. Add a verification step to finish signing in.';
    return;
  }

  router.push(typeof route.query.next === 'string' ? route.query.next : '/');
}
</script>

<template>
  <h1>Sign in</h1>
  <form @submit.prevent="signIn">
    <input v-model="email" type="email" placeholder="Email" autocomplete="email" required />
    <input v-model="password" type="password" placeholder="Password" autocomplete="current-password" required />
    <p v-if="error" role="alert">{{ error }}</p>
    <button type="submit" :disabled="submitting">Sign in</button>
  </form>
</template>
