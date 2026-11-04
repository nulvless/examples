<template>
  <main>
    <RouterView />
  </main>
</template>

<style>
:root {
  color-scheme: light dark;
  font-family: system-ui, sans-serif;
}

main {
  max-width: 28rem;
  margin: 4rem auto;
  padding: 0 1rem;
  line-height: 1.5;
}

form {
  display: grid;
  gap: 0.75rem;
}

input,
button {
  font: inherit;
  padding: 0.5rem 0.75rem;
}

[role='alert'] {
  color: crimson;
}
</style>
