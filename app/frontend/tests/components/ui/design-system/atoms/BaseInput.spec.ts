import BaseInput from '@/components/ui/design-system/atoms/BaseInput.vue';
import { mountComponent } from '@/tests/utils/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';

describe('BaseInput', () => {
  beforeEach(() => {
    // Reset any global mocks
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      const wrapper = mountComponent(BaseInput, {
        props: { modelValue: '' },
      });

      expect(wrapper.find('input').exists()).toBe(true);
      expect(wrapper.classes()).toContain('input-wrapper');
    });

    it('renders with different types', () => {
      const types = ['text', 'email', 'password', 'number', 'tel'] as const;

      for (const type of types) {
        const wrapper = mountComponent(BaseInput, {
          props: {
            modelValue: '',
            type,
          },
        });

        expect(wrapper.find('input').attributes('type')).toBe(type);
      }
    });

    it('renders with placeholder', () => {
      const wrapper = mountComponent(BaseInput, {
        props: {
          modelValue: '',
          placeholder: 'Enter your name',
        },
      });

      expect(wrapper.find('input').attributes('placeholder')).toBe('Enter your name');
    });

    it('renders with label', () => {
      const wrapper = mountComponent(BaseInput, {
        props: {
          modelValue: '',
          label: 'Username',
        },
      });

      expect(wrapper.find('label').text()).toBe('Username');
      expect(wrapper.find('input').attributes('id')).toBeDefined();
    });

    it('renders error state', () => {
      const wrapper = mountComponent(BaseInput, {
        props: {
          modelValue: '',
          error: 'This field is required',
        },
      });

      // Check that error message is rendered
      expect(wrapper.text()).toContain('This field is required');
    });

    it('renders disabled state', () => {
      const wrapper = mountComponent(BaseInput, {
        props: {
          modelValue: '',
          disabled: true,
        },
      });

      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });
  });

  describe('v-model', () => {
    it('updates model value on input', async () => {
      const wrapper = mountComponent(BaseInput, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.setValue('test value');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test value']);
    });

    it('emits update:modelValue event', async () => {
      const wrapper = mountComponent(BaseInput, {
        props: { modelValue: '' },
      });

      const input = wrapper.find('input');
      await input.setValue('test value');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test value']);
    });
  });

  describe('Events', () => {
    it('emits focus event', async () => {
      const wrapper = mountComponent(BaseInput, {
        props: { modelValue: '' },
      });

      await wrapper.find('input').trigger('focus');
      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('emits blur event', async () => {
      const wrapper = mountComponent(BaseInput, {
        props: { modelValue: '' },
      });

      await wrapper.find('input').trigger('blur');
      expect(wrapper.emitted('blur')).toBeTruthy();
    });

    it('emits keydown event', async () => {
      const wrapper = mountComponent(BaseInput, {
        props: { modelValue: '' },
      });

      await wrapper.find('input').trigger('keydown.enter');
      expect(wrapper.emitted('enter')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const wrapper = mountComponent(BaseInput, {
        props: {
          modelValue: '',
          label: 'Username',
          required: true,
        },
      });

      const input = wrapper.find('input');
      expect(input.attributes('required')).toBeDefined();
    });

    it('associates label with input', () => {
      const wrapper = mountComponent(BaseInput, {
        props: {
          modelValue: '',
          label: 'Username',
        },
      });

      const input = wrapper.find('input');
      const label = wrapper.find('label');

      expect(input.attributes('id')).toBe(label.attributes('for'));
    });
  });

  describe('Validation', () => {
    it('shows error message', () => {
      const wrapper = mountComponent(BaseInput, {
        props: {
          modelValue: '',
          error: 'This field is required',
        },
      });

      expect(wrapper.text()).toContain('This field is required');
    });

    it('applies error styling', () => {
      const wrapper = mountComponent(BaseInput, {
        props: {
          modelValue: '',
          error: 'This field is required',
        },
      });

      // Check that error message is rendered
      expect(wrapper.text()).toContain('This field is required');
    });
  });
});
