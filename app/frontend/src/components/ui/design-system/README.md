# NotT Design System

A comprehensive design system for the NotT horror-themed game, built with Vue 3, TypeScript, and Tailwind CSS.

## 🎨 Design Philosophy

The NotT design system follows a horror theme with three main color palettes:
- **Horror**: Red tones for primary actions and emphasis
- **Night**: Gray tones for backgrounds and neutral elements
- **Blood**: Deep reds for danger and critical actions

## 📁 Structure

```
src/components/ui/design-system/
├── atoms/           # Basic building blocks
│   ├── BaseButton.vue
│   ├── BaseInput.vue
│   ├── BaseText.vue
│   └── BaseIcon.vue
├── molecules/       # Simple combinations
│   ├── FormField.vue
│   ├── Card.vue
│   └── Modal.vue
├── organisms/       # Complex components
│   ├── Header.vue
│   ├── Footer.vue
│   └── Navigation.vue
├── templates/       # Page layouts
│   └── PageLayout.vue
├── tokens/          # Design tokens
│   └── index.ts
└── utils/           # Design system utilities
    └── index.ts
```

## 🎯 Design Tokens

### Colors

```typescript
import { colors } from '@/components/ui/design-system/tokens';

// Horror theme (reds)
colors.horror[500] // Primary horror color
colors.horror[600] // Darker variant
colors.horror[400] // Lighter variant

// Night theme (grays)
colors.night[950] // Background
colors.night[800] // Card backgrounds
colors.night[600] // Borders

// Blood theme (reds)
colors.blood[600] // Danger actions
colors.blood[500] // Error states
```

### Typography

```typescript
import { typography } from '@/components/ui/design-system/tokens';

// Font families
typography.fontFamily.horror // Creepster for horror text
typography.fontFamily.sans   // Inter for body text
typography.fontFamily.mono   // JetBrains Mono for code

// Font sizes
typography.fontSize.base     // 1rem
typography.fontSize.lg       // 1.125rem
typography.fontSize.xl       // 1.25rem
```

### Spacing

```typescript
import { spacing } from '@/components/ui/design-system/tokens';

spacing[4]  // 1rem
spacing[8]  // 2rem
spacing[16] // 4rem
spacing[24] // 6rem
```

## 🧩 Components

### Atoms

#### BaseButton

```vue
<BaseButton 
  variant="horror" 
  size="md" 
  :loading="false"
  @click="handleClick"
>
  Click me
</BaseButton>
```

**Props:**
- `variant`: `'horror' | 'blood' | 'ghost'`
- `size`: `'sm' | 'md' | 'lg'`
- `loading`: `boolean`
- `disabled`: `boolean`

#### BaseInput

```vue
<BaseInput
  v-model="value"
  type="text"
  placeholder="Enter text..."
  variant="horror"
  :error="errorMessage"
/>
```

**Props:**
- `variant`: `'horror' | 'blood'`
- `type`: HTML input types
- `placeholder`: `string`
- `error`: `string | null`

#### BaseText

```vue
<BaseText 
  variant="h1" 
  family="horror"
  class="text-glow"
>
  Horror Title
</BaseText>
```

**Props:**
- `variant`: `'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'`
- `family`: `'horror' | 'sans' | 'mono'`

### Molecules

#### FormField

```vue
<FormField
  label="Email"
  :error="emailError"
  :hint="emailHint"
>
  <BaseInput
    v-model="email"
    type="email"
    placeholder="Enter your email"
  />
</FormField>
```

#### Card

```vue
<Card variant="horror" class="p-6">
  <h3 class="text-xl font-semibold mb-4">Card Title</h3>
  <p>Card content goes here...</p>
</Card>
```

**Props:**
- `variant`: `'default' | 'horror' | 'blood'`

### Organisms

#### Navigation

```vue
<Navigation 
  :items="navItems"
  :active-route="$route.path"
  @navigate="handleNavigate"
/>
```

## 🎭 CSS Classes

### Horror Theme Classes

```css
/* Text effects */
.horror-text          /* Creepster font with glow */
.glow-text            /* Strong red glow effect */
.text-glow-soft       /* Soft red glow */

/* Border effects */
.blood-border         /* Red border with glow */
.border-glow          /* Horror theme border glow */
.border-glow-blood    /* Blood theme border glow */

/* Background effects */
.bg-horror-gradient   /* Horror gradient background */
.bg-blood-gradient    /* Blood gradient background */
.backdrop-blur-horror /* Horror backdrop blur */
```

### Animation Classes

```css
/* Animation utilities */
.animate-fade-in      /* Fade in animation */
.animate-slide-up     /* Slide up animation */
.animate-slide-down   /* Slide down animation */
.animate-scale-in     /* Scale in animation */
.animate-bounce-gentle /* Gentle bounce */

/* Horror animations */
.flicker              /* Flicker effect */
.pulse-slow           /* Slow pulse */
.float                /* Float animation */
.glow                 /* Glow animation */
```

### Component Classes

```css
/* Button styles */
.btn-horror           /* Horror theme button */
.btn-blood            /* Blood theme button */
.btn-ghost            /* Ghost button */

/* Input styles */
.input-horror         /* Horror theme input */
.input-blood          /* Blood theme input */

/* Card styles */
.card                 /* Default card */
.card-horror          /* Horror theme card */
.card-blood           /* Blood theme card */

/* Form styles */
.form-group           /* Form group spacing */
.form-label           /* Form label styling */
.form-error           /* Error message styling */
.form-hint            /* Hint text styling */
```

## 🎨 Usage Examples

### Horror-themed Login Form

```vue
<template>
  <div class="min-h-screen bg-horror-gradient flex items-center justify-center">
    <Card variant="horror" class="w-full max-w-md p-8">
      <h1 class="horror-text text-3xl text-center mb-8">
        Welcome to NotT
      </h1>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <FormField label="Email" :error="emailError">
          <BaseInput
            v-model="email"
            type="email"
            placeholder="Enter your email"
            variant="horror"
          />
        </FormField>
        
        <FormField label="Password" :error="passwordError">
          <BaseInput
            v-model="password"
            type="password"
            placeholder="Enter your password"
            variant="horror"
          />
        </FormField>
        
        <BaseButton
          type="submit"
          variant="horror"
          size="lg"
          class="w-full"
          :loading="isLoading"
        >
          Sign In
        </BaseButton>
      </form>
    </Card>
  </div>
</template>
```

### Animated Horror Text

```vue
<template>
  <div class="text-center">
    <h1 class="horror-text text-6xl mb-4 animate-glow">
      NotT
    </h1>
    <p class="text-xl text-night-300 animate-fade-in">
      The horror awaits...
    </p>
  </div>
</template>
```

## 🛠️ Development

### Adding New Components

1. Create the component in the appropriate directory (`atoms/`, `molecules/`, `organisms/`)
2. Follow the naming convention: `BaseComponentName.vue`
3. Use TypeScript interfaces for props and emits
4. Include proper accessibility attributes
5. Add JSDoc comments for complex logic
6. Create unit tests for the component

### Adding New Design Tokens

1. Add tokens to `tokens/index.ts`
2. Update Tailwind config if needed
3. Add corresponding CSS classes in `style.css`
4. Update this README with examples

### Best Practices

- Use semantic HTML elements
- Implement proper focus management
- Ensure keyboard navigation works
- Test with screen readers
- Maintain consistent spacing using design tokens
- Use horror theme colors appropriately
- Implement proper loading and error states

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run component tests
npm run test:components

# Run accessibility tests
npm run test:a11y
```

## 📚 Resources

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contributing

1. Follow the existing code patterns
2. Use TypeScript for all new code
3. Add proper error handling
4. Include unit tests for new components
5. Update documentation as needed
6. Ensure accessibility compliance 