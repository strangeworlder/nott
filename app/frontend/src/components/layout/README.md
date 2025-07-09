# Layout Components

This folder contains responsive layout components for NotT, built using the design system (atoms/molecules/tokens).

## Components

- `AppLayout.vue`: Main app shell (header, nav, content, footer)
- `AuthLayout.vue`: Centered form layout for authentication pages
- `GameLayout.vue`: Game session layout (main area, sidebar, chat)

## Usage

Import and use in your pages:

```vue
<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <router-view />
  </AppLayout>
</template>
```

## Props & Slots

Each layout exposes slots for content injection. See individual component docs for details.

## Dependencies
- Atoms: `BaseButton`, `BaseText`, `BaseIcon`
- Molecules: `Card`, `Modal`
- Tailwind CSS for responsive design

## Patterns
- Use only design system atoms/molecules for UI
- Responsive with Tailwind breakpoints
- Accessible, semantic HTML
- TypeScript for props/slots

---

See each component for more details. 