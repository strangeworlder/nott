# Accessibility Testing Guide for NotT Frontend

## Overview

NotT frontend uses **axe-core** for comprehensive accessibility testing, ensuring WCAG 2.1 AA compliance and inclusive design for all users. This guide covers setup, usage, and best practices for accessibility testing.

## 🎯 **Features**

### **Comprehensive Testing**
- ✅ **WCAG 2.1 AA Compliance**: Full WCAG 2.1 AA standard testing
- ✅ **Color Contrast**: Automated color contrast validation
- ✅ **Keyboard Navigation**: Keyboard accessibility testing
- ✅ **Screen Reader Support**: Screen reader compatibility testing
- ✅ **Form Accessibility**: Form field and validation testing
- ✅ **Heading Structure**: Proper heading hierarchy validation
- ✅ **ARIA Attributes**: ARIA attribute validation
- ✅ **Image Alt Text**: Alt text validation for images

### **Testing Utilities**
- ✅ **Component Testing**: Vue component accessibility testing
- ✅ **Page Testing**: Full page accessibility validation
- ✅ **Custom Rules**: Configurable testing rules
- ✅ **Violation Reporting**: Detailed violation reporting
- ✅ **Integration**: Seamless Vitest integration

## 🚀 **Quick Start**

### **Running Accessibility Tests**

```bash
# Run all accessibility tests
npm run test:a11y

# Run accessibility tests in watch mode
npm run test:a11y:watch

# Run accessibility tests with coverage
npm run test:a11y:coverage

# Run all tests including accessibility
npm run test:all
```

### **Important: Full Page Context Required**

⚠️ **Critical**: Accessibility tests require a **full page/document context** to work properly. axe-core needs a complete DOM structure with proper landmarks, headings, and semantic elements.

### **Basic Component Test (Simplified)**

```typescript
import { describe, it } from 'vitest';
import { mountComponent } from '@/tests/utils/test-utils';
import MyComponent from '@/components/MyComponent.vue';

describe('MyComponent Accessibility', () => {
  it('should have proper ARIA attributes', () => {
    const wrapper = mountComponent(MyComponent, {
      props: { title: 'Test Component' },
    });

    // Test specific accessibility features without axe-core
    expect(wrapper.attributes('aria-label')).toBeDefined();
    expect(wrapper.element.tagName).toBe('BUTTON'); // For buttons
  });

  it('should be keyboard accessible', async () => {
    const wrapper = mountComponent(MyComponent, {
      props: { title: 'Test Component' },
    });

    // Test keyboard interactions
    await wrapper.trigger('keydown.enter');
    expect(wrapper.emitted('click')).toBeTruthy();
  });
});
```

## 📋 **Testing Patterns**

### **Component Accessibility Testing (Simplified)**

```typescript
import { describe, it } from 'vitest';
import { mountComponent } from '@/tests/utils/test-utils';
import BaseButton from '@/components/ui/BaseButton.vue';

describe('BaseButton Accessibility', () => {
  it('should have proper ARIA attributes', () => {
    const wrapper = mountComponent(BaseButton, {
      props: { 
        variant: 'primary',
        'aria-label': 'Submit form'
      },
      slots: { default: 'Click me' },
    });

    expect(wrapper.attributes('aria-label')).toBe('Submit form');
    expect(wrapper.element.tagName).toBe('BUTTON');
  });

  it('should be keyboard accessible', async () => {
    const wrapper = mountComponent(BaseButton, {
      props: { variant: 'secondary' },
      slots: { default: 'Submit' },
    });

    await wrapper.trigger('keydown.enter');
    expect(wrapper.emitted('click')).toBeTruthy();
    
    await wrapper.trigger('keydown.space');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('should be disabled when disabled', () => {
    const wrapper = mountComponent(BaseButton, {
      props: { 
        variant: 'danger',
        disabled: true 
      },
      slots: { default: 'Delete' },
    });

    expect(wrapper.attributes('disabled')).toBeDefined();
  });
});
```

### **Form Accessibility Testing (Simplified)**

```typescript
import { describe, it } from 'vitest';
import { mountComponent } from '@/tests/utils/test-utils';
import LoginForm from '@/components/auth/LoginForm.vue';

describe('LoginForm Accessibility', () => {
  it('should have proper form labels', () => {
    const wrapper = mountComponent(LoginForm);

    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');
    
    expect(emailInput.attributes('id')).toBeDefined();
    expect(passwordInput.attributes('id')).toBeDefined();
    
    // Check for associated labels
    const emailLabel = wrapper.find(`label[for="${emailInput.attributes('id')}"]`);
    const passwordLabel = wrapper.find(`label[for="${passwordInput.attributes('id')}"]`);
    
    expect(emailLabel.exists()).toBe(true);
    expect(passwordLabel.exists()).toBe(true);
  });

  it('should have proper ARIA attributes', () => {
    const wrapper = mountComponent(LoginForm);

    const form = wrapper.find('form');
    expect(form.attributes('role')).toBe('form');
  });
});
```

### **Page Accessibility Testing (Full Context)**

```typescript
import { describe, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createApp } from 'vue';
import App from '@/App.vue';
import { expectAccessible } from '@/tests/utils/accessibility';

describe('App Accessibility', () => {
  it('should have proper heading structure', async () => {
    const app = createApp(App);
    const wrapper = mount(app);

    // This works because it tests the full document context
    await expectAccessible(wrapper.element);
  });
});
```

## ⚠️ **Important Limitations**

### **axe-core Requirements**

axe-core requires a **complete document context** to function properly. It needs:
- A full HTML document structure
- Proper landmarks (`<main>`, `<nav>`, `<header>`, etc.)
- Semantic heading hierarchy (`<h1>`, `<h2>`, etc.)
- Complete page structure

### **Component Testing Limitations**

Individual component testing with axe-core is **not recommended** because:
- Components lack full document context
- Missing landmarks and semantic structure
- axe-core throws "No elements found for include" errors
- Tests become unreliable and flaky

### **Recommended Approach**

1. **Component Level**: Test specific accessibility features manually
   - ARIA attributes
   - Keyboard interactions
   - Semantic HTML elements
   - Focus management

2. **Page Level**: Use axe-core for full accessibility testing
   - Test complete pages/views
   - Full document context
   - WCAG compliance
   - Color contrast
   - Screen reader compatibility

## 🛠️ **Testing Utilities**

### **Manual Component Testing**

```typescript
// Test ARIA attributes
expect(wrapper.attributes('aria-label')).toBe('Submit form');
expect(wrapper.element.tagName).toBe('BUTTON');

// Test keyboard interactions
await wrapper.trigger('keydown.enter');
expect(wrapper.emitted('click')).toBeTruthy();

// Test disabled state
expect(wrapper.attributes('disabled')).toBeDefined();

// Test focus management
await wrapper.trigger('focus');
expect(wrapper.classes()).toContain('focus:ring-2');
```

### **Full Page Testing (with axe-core)**

```typescript
import { expectAccessible } from '@/tests/utils/accessibility';

// Test complete page accessibility
await expectAccessible(document.body);

// Test specific page sections
await expectAccessible(document.querySelector('main'));
```

### **Direct Functions**

```typescript
import { 
  expectAccessible, 
  testWCAG21AA, 
  testKeyboardNavigation,
  testScreenReader,
  testFormAccessibility,
  testColorContrast,
  testHeadingStructure,
  getAccessibilityViolations
} from '@/tests/utils/accessibility';

// Test element accessibility
await expectAccessible(element);

// Test specific compliance
await testWCAG21AA(element);
await testKeyboardNavigation(element);
await testScreenReader(element);
await testFormAccessibility(element);
await testColorContrast(element);
await testHeadingStructure(element);

// Get violations for debugging
const violations = await getAccessibilityViolations(element);
```

## ⚙️ **Configuration**

### **Default Configuration**

```typescript
export const defaultA11yConfig = {
  rules: [
    'color-contrast',
    'document-title',
    'html-has-lang',
    'html-lang-valid',
    'image-alt',
    'input-image-alt',
    'label',
    'link-name',
    'list',
    'listitem',
    'page-has-heading-one',
    'region',
    'skip-link',
    'tabindex',
    'valid-lang',
  ],
  tags: ['wcag2a', 'wcag2aa', 'best-practice'],
  impact: 'moderate',
  includeNotices: false,
  includeWarnings: true,
  includePasses: false,
};
```

### **Custom Configuration**

```typescript
import { expectAccessible } from '@/tests/utils/accessibility';

// Test with custom rules
await expectAccessible(element, {
  rules: ['color-contrast', 'label'],
  impact: 'serious',
  tags: ['wcag2aa'],
});
```

## 🎨 **Horror Theme Considerations**

### **Color Contrast**
- **Dark Backgrounds**: Ensure sufficient contrast with text
- **Red Accents**: Test contrast of horror theme red colors
- **Gray Text**: Validate contrast on dark backgrounds

### **Keyboard Navigation**
- **Game Controls**: Ensure all game actions are keyboard accessible
- **Menu Navigation**: Test menu navigation with keyboard
- **Modal Dialogs**: Validate modal accessibility

### **Screen Reader Support**
- **Game State**: Provide screen reader updates for game state
- **Character Actions**: Announce character actions to screen readers
- **Error Messages**: Ensure error messages are announced

## 📊 **Test Coverage**

### **Required Tests**

#### **All Components**
- [ ] Basic accessibility test
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Color contrast validation

#### **Form Components**
- [ ] Form accessibility test
- [ ] Label association
- [ ] Error message accessibility
- [ ] Required field indication

#### **Interactive Components**
- [ ] Button accessibility
- [ ] Link accessibility
- [ ] Modal accessibility
- [ ] Menu accessibility

#### **Layout Components**
- [ ] Heading structure
- [ ] Landmark regions
- [ ] Skip links
- [ ] Navigation structure

### **Optional Tests**

#### **Advanced Accessibility**
- [ ] ARIA attribute validation
- [ ] Custom widget accessibility
- [ ] Dynamic content updates
- [ ] Focus management

#### **Performance Testing**
- [ ] Large component accessibility
- [ ] Complex form accessibility
- [ ] Real-time updates accessibility

## 🚨 **Common Issues & Solutions**

### **Color Contrast Issues**

```typescript
// Problem: Insufficient color contrast
// Solution: Use design system colors with proper contrast ratios

// Test specific contrast
await testColorContrast(element);
```

### **Missing Labels**

```typescript
// Problem: Form inputs without labels
// Solution: Add proper label associations

// Test form accessibility
await testFormAccessibility(element);
```

### **Keyboard Navigation**

```typescript
// Problem: Elements not keyboard accessible
// Solution: Add proper tabindex and focus management

// Test keyboard navigation
await testKeyboardNavigation(element);
```

### **Screen Reader Issues**

```typescript
// Problem: Missing ARIA attributes
// Solution: Add appropriate ARIA attributes

// Test screen reader compatibility
await testScreenReader(element);
```

## 📈 **Best Practices**

### **Testing Strategy**

1. **Component Level**: Test each component individually
2. **Integration Level**: Test component combinations
3. **Page Level**: Test complete pages
4. **User Journey**: Test complete user flows

### **Test Organization**

```typescript
// Organize tests by component type
describe('Button Components', () => {
  describe('BaseButton', () => {
    // Button-specific tests
  });
  
  describe('IconButton', () => {
    // Icon button tests
  });
});

describe('Form Components', () => {
  describe('BaseInput', () => {
    // Input-specific tests
  });
  
  describe('BaseSelect', () => {
    // Select-specific tests
  });
});
```

### **Continuous Integration**

```yaml
# GitHub Actions example
- name: Run Accessibility Tests
  run: npm run test:a11y

- name: Run All Tests
  run: npm run test:all
```

## 🔧 **Troubleshooting**

### **Common Errors**

#### **axe-core not found**
```bash
# Install axe-core
npm install --save-dev axe-core
```

#### **Test environment issues**
```typescript
// Ensure jsdom is configured
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

#### **Component mounting issues**
```typescript
// Use proper test utilities
import { mountComponent } from '@/tests/utils/test-utils';
```

### **Debugging Violations**

```typescript
import { getAccessibilityViolations } from '@/tests/utils/accessibility';

// Get detailed violation information
const violations = await getAccessibilityViolations(element);
console.log('Violations:', violations);
```

## 📚 **Resources**

### **Documentation**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Vue Accessibility Guide](https://vuejs.org/guide/best-practices/accessibility.html)

### **Tools**
- [axe DevTools](https://www.deque.com/axe/browser-extensions/)
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)
- [Lighthouse Accessibility](https://developers.google.com/web/tools/lighthouse)

### **Standards**
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/AA/)
- [Section 508](https://www.section508.gov/)
- [ADA Compliance](https://www.ada.gov/)

---

**Status**: ✅ **ACTIVE**  
**Last Updated**: December 2024  
**Version**: 1.0.0  
**Compatibility**: Vue 3, Vitest, axe-core 