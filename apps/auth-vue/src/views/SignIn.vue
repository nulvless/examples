<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthLayout from '@/components/AuthLayout.vue';
import { nulvless } from '@/lib/nulvless';

const STEPS = [
  { title: 'Sign in', call: 'auth.signIn' },
  { title: 'Open a guarded route', call: 'auth.getSession' },
  { title: 'Read the profile', call: 'auth.users.me' },
];

const route = useRoute();
const router = useRouter();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const error = ref<string | null>(null);
const submitting = ref(false);

async function signIn() {
  if (submitting.value) return;
  submitting.value = true;
  error.value = null;

  const { data, error: signInError } = await nulvless.auth.signIn({ email: email.value, password: password.value });
  submitting.value = false;

  if (signInError) {
    error.value = 'Email or password is incorrect.';
    return;
  }
  if (data.challenge) {
    error.value = 'This account uses two-step sign-in. Add a verification step to finish signing in.';
    return;
  }

  router.push(typeof route.query.next === 'string' ? route.query.next : '/');
}
</script>

<template>
  <AuthLayout :steps="STEPS" :current="0">
    <div class="auth-heading">
      <h1>Sign in to Acme</h1>
      <p class="muted">Use the email and password of a user in your Nulvless project.</p>
    </div>
    <form class="stack" @submit.prevent="signIn">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" autocomplete="email" required autofocus />
      </div>
      <div class="field">
        <div style="display: flex; justify-content: space-between">
          <label for="password">Password</label>
          <button type="button" class="button-link" style="font-size: 0.84rem" @click="showPassword = !showPassword">
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>
        <input
          id="password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          required
        />
      </div>
      <p v-if="error" class="alert" role="alert">{{ error }}</p>
      <button type="submit" class="button button-primary button-wide" :disabled="submitting">
        <span v-if="submitting" class="spinner" aria-hidden="true" />
        Sign in
      </button>
    </form>
  </AuthLayout>
</template>
