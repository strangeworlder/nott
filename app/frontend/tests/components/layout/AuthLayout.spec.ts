import AuthLayout from '@/components/layout/AuthLayout.vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

describe('AuthLayout', () => {
  it('renders title slot', () => {
    const wrapper = mount(AuthLayout, {
      slots: { title: '<span>Register</span>' },
    });
    expect(wrapper.html()).toContain('Register');
  });
  it('renders default slot', () => {
    const wrapper = mount(AuthLayout, {
      slots: { default: '<form><input /></form>' },
    });
    expect(wrapper.find('form').exists()).toBe(true);
  });
});
