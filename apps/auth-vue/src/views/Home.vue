<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUser } from '@/composables/useUser';
import { nulvless } from '@/lib/nulvless';

const router = useRouter();
const { user, refreshUser } = useUser();

onMounted(refreshUser);

const name = computed(() => user.value?.profile?.name ?? user.value?.username ?? user.value?.email ?? 'there');
const initials = computed(() =>
  name.value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join(''),
);

async function signOut() {
  await nulvless.auth.signOut();
  router.push({ name: 'sign-in' });
}
</script>

<template>
  <div class="app">
    <header class="topbar">
      <RouterLink class="brand" to="/">
        <span class="brand-mark" aria-hidden="true">A</span>
        Acme
      </RouterLink>
      <nav aria-label="Main">
        <RouterLink to="/" aria-current="page">Home</RouterLink>
      </nav>
      <button type="button" class="button button-quiet" @click="signOut">Sign out</button>
      <span v-if="user" class="avatar" aria-hidden="true">{{ initials }}</span>
    </header>

    <main class="page">
      <div class="page-heading">
        <h1>Good to see you, {{ name }}</h1>
        <p class="muted">The route guard let you in because the SDK found a session.</p>
      </div>

      <dl v-if="user" class="details">
        <dt>Email</dt>
        <dd>{{ user.email ?? 'Not set' }}</dd>
        <dt>Username</dt>
        <dd>{{ user.username ?? 'Not set' }}</dd>
        <dt>User ID</dt>
        <dd>{{ user.id }}</dd>
      </dl>
      <p v-else class="muted" role="status">Loading your profile…</p>

      <section class="placeholder" aria-label="Your product">
        <h2>Put your product here</h2>
        <p class="muted">
          This page is <code>src/views/Home.vue</code>. Add more guarded routes in <code>src/router.ts</code>, and send
          <code>auth.getAccessToken()</code> to your API to act as this user.
        </p>
      </section>
    </main>
  </div>
</template>
