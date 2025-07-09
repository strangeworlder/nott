import BaseButton from '@/components/ui/design-system/atoms/BaseButton.vue';
import { mountComponent } from '@/tests/utils/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';

describe('BaseButton', () => {
  beforeEach(() => {
    // Reset any global mocks
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      const wrapper = mountComponent(BaseButton, {
        slots: { default: 'Click me' },
      });

      expect(wrapper.text()).toContain('Click me');
      expect(wrapper.classes()).toContain('bg-horror-600');
    });

    it('renders with different variants', () => {
      const variants = ['horror', 'blood', 'ghost'] as const;

      for (const variant of variants) {
        const wrapper = mountComponent(BaseButton, {
          props: { variant },
          slots: { default: `Button ${variant}` },
        });

        expect(wrapper.text()).toContain(`Button ${variant}`);
      }
    });

    it('renders with different sizes', () => {
      const sizes = ['sm', 'md', 'lg'] as const;

      for (const size of sizes) {
        const wrapper = mountComponent(BaseButton, {
          props: { size },
          slots: { default: `Button ${size}` },
        });

        expect(wrapper.text()).toContain(`Button ${size}`);
      }
    });

    it('renders loading state', () => {
      const wrapper = mountComponent(BaseButton, {
        props: { loading: true },
        slots: { default: 'Loading' },
      });

      expect(wrapper.find('.loading-spinner').exists()).toBe(true);
    });

    it('renders disabled state', () => {
      const wrapper = mountComponent(BaseButton, {
        props: { disabled: true },
        slots: { default: 'Disabled' },
      });

      expect(wrapper.attributes('disabled')).toBeDefined();
      expect(wrapper.classes()).toContain('opacity-50');
    });
  });

  describe('Interactions', () => {
    it('emits click event when clicked', async () => {
      const wrapper = mountComponent(BaseButton, {
        slots: { default: 'Click me' },
      });

      await wrapper.trigger('click');
      expect(wrapper.emitted('click')).toBeTruthy();
    });

    it('does not emit click when disabled', async () => {
      const wrapper = mountComponent(BaseButton, {
        props: { disabled: true },
        slots: { default: 'Disabled' },
      });

      await wrapper.trigger('click');
      expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('does not emit click when loading', async () => {
      const wrapper = mountComponent(BaseButton, {
        props: { loading: true },
        slots: { default: 'Loading' },
      });

      await wrapper.trigger('click');
      expect(wrapper.emitted('click')).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', async () => {
      const wrapper = mountComponent(BaseButton, {
        slots: { default: 'Enter key' },
      });

      await wrapper.trigger('keydown.enter');
      expect(wrapper.emitted('click')).toBeTruthy();

      await wrapper.trigger('keydown.space');
      expect(wrapper.emitted('click')).toBeTruthy();
    });
  });

  describe('Props validation', () => {
    it('validates variant prop', () => {
      const wrapper = mountComponent(BaseButton, {
        props: { variant: 'invalid' as never },
        slots: { default: 'Test' },
      });

      // Should fall back to horror variant
      expect(wrapper.classes()).toContain('bg-horror-600');
    });

    it('validates size prop', () => {
      const wrapper = mountComponent(BaseButton, {
        props: { size: 'invalid' as never },
        slots: { default: 'Test' },
      });

      // Should fall back to md size
      expect(wrapper.classes()).toContain('px-4');
    });
  });
});
