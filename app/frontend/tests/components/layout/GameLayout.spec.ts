import GameLayout from '@/components/layout/GameLayout.vue';
import { mountComponent } from '@/tests/utils/test-utils';
import { describe, expect, it } from 'vitest';

describe('GameLayout', () => {
  it('renders sidebar slot', () => {
    const wrapper = mountComponent(GameLayout, {
      slots: { sidebar: '<div class="sidebar">Sidebar</div>' },
    });
    expect(wrapper.find('.sidebar').exists()).toBe(true);
  });

  it('renders chat slot', () => {
    const wrapper = mountComponent(GameLayout, {
      slots: { chat: '<div class="chat">Chat</div>' },
    });
    expect(wrapper.find('.chat').exists()).toBe(true);
  });

  it('renders game-header slot', () => {
    const wrapper = mountComponent(GameLayout, {
      slots: { 'game-header': '<div class="game-header">Header</div>' },
    });
    expect(wrapper.html()).toContain('Header');
  });

  it('renders default slot', () => {
    const wrapper = mountComponent(GameLayout, {
      slots: { default: '<div class="main-content">Main</div>' },
    });
    expect(wrapper.find('.main-content').exists()).toBe(true);
  });
});
