// @ts-ignore - axe-core types are available at runtime
import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Accessibility testing utilities for NotT frontend
 * Uses axe-core for comprehensive a11y validation
 */

// Axe-core result types
interface AxeNode {
  html: string;
  target: string[];
  failureSummary: string;
}

interface AxeViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNode[];
}

interface AxeResults {
  violations: AxeViolation[];
  passes: AxeViolation[];
  incomplete: AxeViolation[];
  inapplicable: AxeViolation[];
}

// Vue wrapper type for testing - using a simple interface
interface VueTestWrapper {
  element: Element;
  vm: any;
  html(): string;
  find(selector: string): VueTestWrapper;
  findAll(selector: string): VueTestWrapper[];
  getCurrentComponent(): any;
}

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
}

export interface AccessibilityTestOptions {
  rules?: string[];
  tags?: string[];
  impact?: 'minor' | 'moderate' | 'serious' | 'critical';
  includeNotices?: boolean;
  includeWarnings?: boolean;
  includePasses?: boolean;
}

/**
 * Default accessibility test configuration for NotT
 */
export const defaultA11yConfig: AccessibilityTestOptions = {
  rules: [
    'color-contrast',
    'image-alt',
    'input-image-alt',
    'label',
    'link-name',
    'list',
    'listitem',
    'region',
    'skip-link',
    'tabindex',
  ],
  tags: ['wcag2a', 'wcag2aa', 'best-practice'],
  impact: 'moderate',
  includeNotices: false,
  includeWarnings: true,
  includePasses: false,
};

/**
 * Run accessibility test on an element
 */
export async function testAccessibility(
  element: Element | Document,
  options: AccessibilityTestOptions = {}
): Promise<AxeResults> {
  // Convert our options to axe-core compatible format
  const axeConfig: Record<string, unknown> = {};

  if (options.rules) {
    axeConfig.rules = options.rules.reduce(
      (acc, rule) => {
        acc[rule] = { enabled: true };
        return acc;
      },
      {} as Record<string, { enabled: boolean }>
    );
  }

  if (options.tags) {
    axeConfig.tags = options.tags;
  }

  // Ensure we have a valid element to test
  if (!element || !element.querySelector) {
    throw new Error('Invalid element provided for accessibility testing');
  }

  return new Promise((resolve, reject) => {
    (axe as typeof axe).run(element, axeConfig, (error: Error | null, results: AxeResults) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

/**
 * Assert that an element passes accessibility tests
 */
export async function expectAccessible(
  element: Element | Document,
  options: AccessibilityTestOptions = {}
): Promise<void> {
  // Use default config if no specific options provided
  const testOptions = Object.keys(options).length > 0 ? options : defaultA11yConfig;
  const results = await testAccessibility(element, testOptions);

  const violations = results.violations.filter((violation: AxeViolation) => {
    if (testOptions.impact) {
      const impactLevels = ['minor', 'moderate', 'serious', 'critical'];
      const violationLevel = impactLevels.indexOf(violation.impact);
      const requiredLevel = impactLevels.indexOf(testOptions.impact);
      return violationLevel >= requiredLevel;
    }
    return true;
  });

  if (violations.length > 0) {
    const violationMessages = violations
      .map((violation: AxeViolation) => {
        const nodes = violation.nodes
          .map((node: AxeNode) => `  - ${node.failureSummary} (${node.target.join(', ')})`)
          .join('\n');

        return `${violation.help} (${violation.impact} impact)\n${nodes}`;
      })
      .join('\n\n');

    throw new Error(`Accessibility violations found:\n\n${violationMessages}`);
  }
}

/**
 * Get accessibility violations for debugging
 */
export async function getAccessibilityViolations(
  element: Element | Document,
  options: AccessibilityTestOptions = {}
): Promise<AccessibilityViolation[]> {
  // Use default config if no specific options provided
  const testOptions = Object.keys(options).length > 0 ? options : defaultA11yConfig;
  const results = await testAccessibility(element, testOptions);

  return results.violations.map((violation: AxeViolation) => ({
    id: violation.id,
    impact: violation.impact as AccessibilityViolation['impact'],
    description: violation.description,
    help: violation.help,
    helpUrl: violation.helpUrl,
    tags: violation.tags,
    nodes: violation.nodes.map((node: AxeNode) => ({
      html: node.html,
      target: node.target,
      failureSummary: node.failureSummary,
    })),
  }));
}

/**
 * Test specific accessibility rules
 */
export async function testSpecificRules(
  element: Element | Document,
  rules: string[]
): Promise<void> {
  await expectAccessible(element, { rules });
}

/**
 * Test WCAG 2.1 AA compliance
 */
export async function testWCAG21AA(element: Element | Document): Promise<void> {
  await expectAccessible(element, {
    tags: ['wcag2a', 'wcag2aa'],
    impact: 'moderate',
  });
}

/**
 * Test keyboard navigation
 */
export async function testKeyboardNavigation(element: Element | Document): Promise<void> {
  await testSpecificRules(element, [
    'tabindex',
    'skip-link',
    'focus-order-semantics',
  ]);
}

/**
 * Test screen reader compatibility
 */
export async function testScreenReader(element: Element | Document): Promise<void> {
  await testSpecificRules(element, [
    'aria-allowed-attr',
    'aria-allowed-role',
    'aria-required-attr',
    'aria-required-children',
    'aria-required-parent',
    'aria-roles',
    'aria-valid-attr-value',
    'aria-valid-attr',
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
    'valid-lang',
  ]);
}

/**
 * Test form accessibility
 */
export async function testFormAccessibility(element: Element | Document): Promise<void> {
  await testSpecificRules(element, [
    'label',
    'fieldset',
    'legend',
    'aria-required-attr',
    'aria-invalid-attr',
    'color-contrast',
  ]);
}

/**
 * Test color contrast
 */
export async function testColorContrast(element: Element | Document): Promise<void> {
  await testSpecificRules(element, ['color-contrast']);
}

/**
 * Test heading structure
 */
export async function testHeadingStructure(element: Element | Document): Promise<void> {
  await testSpecificRules(element, ['page-has-heading-one', 'heading-order', 'region']);
}

/**
 * Custom matcher for Vitest
 */
export const accessibilityMatchers = {
  toBeAccessible: async (element: Element | Document) => {
    try {
      await expectAccessible(element);
      return {
        message: () => 'Expected element to be accessible',
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `Expected element to be accessible, but found violations: ${error}`,
        pass: false,
      };
    }
  },
};

/**
 * Setup accessibility testing for Vitest
 */
export function setupAccessibilityTesting(): void {
  // Extend expect with accessibility matchers
  expect.extend(accessibilityMatchers);

  // Configure axe-core for testing environment
  (axe as typeof axe).configure({
    reporter: 'v2',
    rules: [
      { id: 'color-contrast', enabled: true },
      { id: 'document-title', enabled: true },
      { id: 'html-has-lang', enabled: true },
      { id: 'html-lang-valid', enabled: true },
      { id: 'image-alt', enabled: true },
      { id: 'input-image-alt', enabled: true },
      { id: 'label', enabled: true },
      { id: 'link-name', enabled: true },
      { id: 'list', enabled: true },
      { id: 'listitem', enabled: true },
      { id: 'page-has-heading-one', enabled: true },
      { id: 'region', enabled: true },
      { id: 'skip-link', enabled: true },
      { id: 'tabindex', enabled: true },
      { id: 'valid-lang', enabled: true },
    ],
  });
}

/**
 * Accessibility test helpers for Vue components
 */
export const a11yHelpers = {
  /**
   * Test component accessibility
   */
  async testComponent(wrapper: VueTestWrapper, options?: AccessibilityTestOptions): Promise<void> {
    // Get the root element from the Vue wrapper
    const element = (wrapper as any).element || document.body;
    await expectAccessible(element, options);
  },

  /**
   * Test component with specific rules
   */
  async testComponentRules(wrapper: VueTestWrapper, rules: string[]): Promise<void> {
    const element = (wrapper as any).element || document.body;
    await testSpecificRules(element, rules);
  },

  /**
   * Test component WCAG compliance
   */
  async testComponentWCAG(wrapper: VueTestWrapper): Promise<void> {
    const element = (wrapper as any).element || document.body;
    await testWCAG21AA(element);
  },

  /**
   * Test component keyboard navigation
   */
  async testComponentKeyboard(wrapper: VueTestWrapper): Promise<void> {
    const element = (wrapper as any).element || document.body;
    await testKeyboardNavigation(element);
  },

  /**
   * Test component screen reader compatibility
   */
  async testComponentScreenReader(wrapper: VueTestWrapper): Promise<void> {
    const element = (wrapper as any).element || document.body;
    await testScreenReader(element);
  },

  /**
   * Test component form accessibility
   */
  async testComponentForm(wrapper: VueTestWrapper): Promise<void> {
    const element = (wrapper as any).element || document.body;
    await testFormAccessibility(element);
  },

  /**
   * Test component color contrast
   */
  async testComponentContrast(wrapper: VueTestWrapper): Promise<void> {
    const element = (wrapper as any).element || document.body;
    await testColorContrast(element);
  },

  /**
   * Test component heading structure
   */
  async testComponentHeadings(wrapper: VueTestWrapper): Promise<void> {
    const element = (wrapper as any).element || document.body;
    await testHeadingStructure(element);
  },
};
