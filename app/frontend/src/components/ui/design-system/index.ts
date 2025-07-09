/**
 * NotT Design System
 *
 * A comprehensive design system for the NotT horror-themed game,
 * built with Vue 3, TypeScript, and Tailwind CSS.
 */

// Atoms
export { default as BaseButton } from './atoms/BaseButton.vue';
export { default as BaseInput } from './atoms/BaseInput.vue';
export { default as BaseText } from './atoms/BaseText.vue';
export { default as BaseIcon } from './atoms/BaseIcon.vue';

// Molecules
export { default as FormField } from './molecules/FormField.vue';
export { default as Card } from './molecules/Card.vue';
export { default as Modal } from './molecules/Modal.vue';

// Organisms
export { default as Navigation } from './organisms/Navigation.vue';
export { default as Header } from './organisms/Header.vue';
export { default as Footer } from './organisms/Footer.vue';

// Templates
export { default as PageLayout } from './templates/PageLayout.vue';

// Design Tokens
export * from './tokens';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
}

export interface ButtonProps {
  variant?: 'horror' | 'blood' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export interface InputProps {
  modelValue: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  variant?: 'horror' | 'blood';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
  error?: string | null;
  id?: string;
}

export interface TextProps {
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'p'
    | 'span'
    | 'div'
    | 'section'
    | 'article'
    | 'aside'
    | 'header'
    | 'footer'
    | 'nav'
    | 'main';
  family?: 'horror' | 'sans' | 'mono';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'white' | 'night-300' | 'night-400' | 'night-500' | 'horror-500' | 'blood-500';
  glow?: boolean;
  glowIntensity?: 'soft' | 'normal' | 'strong';
}

export interface IconProps {
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  color?:
    | 'white'
    | 'night-300'
    | 'night-400'
    | 'night-500'
    | 'horror-500'
    | 'blood-500'
    | 'current';
  variant?: 'solid' | 'outline' | 'glow';
  viewBox?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string | number;
  ariaLabel?: string;
  ariaHidden?: boolean;
}

export interface FormFieldProps {
  label?: string;
  error?: string | null;
  hint?: string | null;
  required?: boolean;
  id?: string;
}

export interface CardProps {
  variant?: 'default' | 'horror' | 'blood';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: boolean;
  hover?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
  closeOnBackdrop?: boolean;
  variant?: 'default' | 'horror' | 'blood';
}

export interface NavigationProps {
  items: NavigationItem[];
  activeRoute?: string;
  variant?: 'default' | 'horror' | 'blood';
  sticky?: boolean;
}

export interface HeaderProps {
  navItems: NavigationItem[];
  activeRoute?: string;
  user?: User | null;
  variant?: 'default' | 'horror' | 'blood';
  sticky?: boolean;
}

export interface FooterProps {
  variant?: 'default' | 'horror' | 'blood';
}

export interface PageLayoutProps {
  showHeader?: boolean;
  showFooter?: boolean;
  navItems?: NavigationItem[];
  activeRoute?: string;
  user?: User | null;
  headerVariant?: 'default' | 'horror' | 'blood';
  headerSticky?: boolean;
  footerVariant?: 'default' | 'horror' | 'blood';
  fullHeight?: boolean;
  containerMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}
