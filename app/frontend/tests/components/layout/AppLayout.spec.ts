import AppLayout from '@/components/layout/AppLayout.vue';
import { mountComponent } from '@/tests/utils/test-utils';
import { describe, expect, it } from 'vitest';

describe('AppLayout', () => {
  it('renders main slot content', () => {
    const wrapper = mountComponent(AppLayout, {
      slots: { default: '<div class="test-content">Hello</div>' },
    });
    expect(wrapper.find('.test-content').exists()).toBe(true);
  });

  it('renders navigation component', () => {
    const wrapper = mountComponent(AppLayout);
    // Check that AppNavigation is rendered (it's stubbed in tests)
    expect(wrapper.find('app-navigation-stub').exists()).toBe(true);
  });

  it('renders footer content', () => {
    const wrapper = mountComponent(AppLayout);
    expect(wrapper.text()).toContain('NotT');
    expect(wrapper.text()).toContain('All rights reserved');
  });
});
