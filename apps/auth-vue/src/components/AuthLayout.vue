<script setup lang="ts">
defineProps<{
  steps: { title: string; call: string }[];
  current: number;
}>();
</script>

<template>
  <div class="auth">
    <aside class="auth-aside">
      <a class="brand" href="/">
        <span class="brand-mark" aria-hidden="true">A</span>
        Acme
      </a>
      <ol class="flow" aria-label="Sign-in steps">
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          :aria-current="index === current ? 'step' : undefined"
          :data-done="index < current ? '' : undefined"
        >
          <span class="flow-index">{{ index + 1 }}</span>
          <span>
            <span class="flow-title">{{ step.title }}</span>
            <br />
            <code class="flow-call">{{ step.call }}</code>
          </span>
        </li>
      </ol>
      <p class="muted">Replace Acme with your product. Every screen here is yours to restyle.</p>
    </aside>
    <main class="auth-main">
      <div class="auth-panel">
        <slot />
      </div>
    </main>
  </div>
</template>
