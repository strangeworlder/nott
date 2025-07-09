# Biome Configuration for NotT Frontend

## Overview

Biome is configured as the single tool for formatting, linting, and organizing imports in the NotT frontend project. This configuration ensures consistent code quality, performance, and accessibility across the Vue 3 + TypeScript codebase.

## Configuration Features

### **Formatter Settings**
- **Indent Style**: 2 spaces (consistent with Vue 3 conventions)
- **Line Width**: 100 characters (optimal for modern displays)
- **Quote Style**: Single quotes (consistent with JavaScript/TypeScript)
- **Semicolons**: Always required
- **Line Ending**: LF (Unix-style, consistent across platforms)

### **Linter Rules**

#### **Correctness Rules**
- `noUnusedVariables`: Prevents unused variables and imports
- `useExhaustiveDependencies`: Ensures proper dependency arrays in hooks

#### **Suspicious Code Detection**
- `noConsoleLog`: Warns about console.log (use proper logging instead)
- `noExplicitAny`: Prevents use of `any` type (use proper types)
- `noArrayIndexKey`: Prevents React key issues (Vue-specific)

#### **Style Enforcement**
- `useConst`: Prefer `const` over `let` when possible
- `useBlockStatements`: Require braces for all control structures
- `useShorthandArrayType`: Prefer `T[]` over `Array<T>`
- `useTemplate`: Prefer template literals over string concatenation
- `noNonNullAssertion`: Prevent `!` assertions (use proper null checks)
- `useLiteralKeys`: Prefer dot notation over bracket notation

#### **Complexity Management**
- `noForEach`: Prefer `for...of` loops for better performance
- `noUselessElse`: Remove unnecessary else blocks
- `noUselessFragments`: Remove unnecessary Vue fragments

#### **Performance Rules**
- `noDelete`: Prevent object property deletion (use proper state management)

#### **Security Rules**
- `noDangerouslySetInnerHtml`: Prevent XSS vulnerabilities (Vue-specific)

#### **Accessibility (a11y) Rules**
- `useKeyWithClickEvents`: Require keyboard event handlers
- `useKeyWithMouseEvents`: Ensure mouse events have keyboard alternatives
- `useMediaCaption`: Require captions for media content
- `useValidAriaProps`: Validate ARIA attributes
- `useValidAriaValues`: Ensure proper ARIA values
- `useValidAnchor`: Validate anchor tag usage
- `useValidAltText`: Require meaningful alt text for images
- `useValidHeading`: Ensure proper heading hierarchy
- `useValidIframe`: Validate iframe usage
- `useValidImg`: Ensure proper image attributes
- `useValidLang`: Require language attributes
- `useValidSvg`: Validate SVG accessibility

## File Organization

### **Ignored Files**
- `node_modules/**`: Dependencies
- `dist/**`, `build/**`: Build outputs
- `coverage/**`: Test coverage reports
- `.vite/**`: Vite cache
- `storybook-static/**`: Storybook build
- `public/**`: Static assets
- `*.config.js`, `*.config.ts`: Configuration files
- Lock files: `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`

### **VCS Integration**
- **Git Integration**: Automatically respects `.gitignore`
- **Ignore File**: Uses project ignore files for exclusions

## Usage

### **Available Scripts**

```bash
# Format code
npm run format

# Lint code
npm run lint

# Lint and auto-fix
npm run lint:fix

# Check formatting and linting
npm run check

# Validate (type-check + lint)
npm run validate

# Prepare (runs validation)
npm run prepare
```

### **IDE Integration**

#### **VS Code**
1. Install Biome extension
2. Enable format on save
3. Configure as default formatter

#### **Cursor**
- Biome is automatically detected and used
- Format on save is enabled by default

### **Pre-commit Hooks**

The `prepare` script runs validation before commits:
```json
{
  "scripts": {
    "prepare": "npm run validate"
  }
}
```

## Horror Theme Considerations

### **Code Style**
- **Dark Theme**: Code formatting optimized for dark IDEs
- **Readability**: 100-character line width for better readability
- **Consistency**: Single quotes and 2-space indentation

### **Performance**
- **For...of Loops**: Better performance than forEach
- **No Delete**: Prevents performance issues with object manipulation
- **Proper Types**: Prevents runtime errors in game logic

### **Accessibility**
- **Keyboard Navigation**: Essential for horror game controls
- **Screen Reader Support**: Proper ARIA attributes for all components
- **Media Accessibility**: Captions and alt text for horror content

## Error Handling

### **Common Issues**

#### **TypeScript Conflicts**
```typescript
// ❌ Biome wants dot notation, TypeScript requires bracket notation
const value = obj["key"];

// ✅ Solution: Disable noPropertyAccessFromIndexSignature in tsconfig
const value = obj.key;
```

#### **Vue Template Issues**
```vue
<!-- ❌ Biome flags template literals in Vue templates -->
<template>
  <div>{{ `Hello ${name}` }}</div>
</template>

<!-- ✅ Solution: Use computed properties -->
<template>
  <div>{{ greeting }}</div>
</template>
```

#### **Performance Warnings**
```typescript
// ❌ forEach performance issue
array.forEach(item => process(item));

// ✅ for...of loop
for (const item of array) {
  process(item);
}
```

### **Suppression Comments**

Use sparingly and document reasons:
```typescript
// biome-ignore lint/style/useDotNotation: Required for TypeScript index signature
const value = env["VITE_VAR"];
```

## Integration with Development Workflow

### **Development**
1. **Auto-format**: Code is formatted on save
2. **Real-time linting**: Errors shown in IDE
3. **Type checking**: Integrated with TypeScript

### **CI/CD**
1. **Pre-commit**: Validation runs before commits
2. **Build pipeline**: Linting included in build process
3. **Quality gates**: Zero linting errors required

### **Team Collaboration**
1. **Consistent formatting**: All developers use same rules
2. **Code quality**: Automated enforcement of standards
3. **Accessibility**: Built-in a11y validation

## Benefits

### **Code Quality**
- **Consistency**: Uniform code style across team
- **Performance**: Optimized patterns enforced
- **Security**: Security vulnerabilities prevented
- **Accessibility**: Built-in a11y compliance

### **Developer Experience**
- **Fast**: Biome is significantly faster than ESLint + Prettier
- **Integrated**: Single tool for all code quality needs
- **Reliable**: Consistent results across environments
- **Modern**: Built for modern JavaScript/TypeScript

### **Project Health**
- **Maintainability**: Clean, consistent codebase
- **Performance**: Optimized patterns throughout
- **Accessibility**: Inclusive design from the start
- **Security**: Vulnerabilities caught early

## Troubleshooting

### **Common Issues**

#### **Format Conflicts**
```bash
# Reset formatting
npm run format

# Check for conflicts
npm run check:format
```

#### **Lint Errors**
```bash
# Auto-fix what's possible
npm run lint:fix

# Check specific files
npx biome lint src/components/MyComponent.vue
```

#### **TypeScript Conflicts**
- Ensure `noPropertyAccessFromIndexSignature` is disabled in `tsconfig.json`
- Use proper type assertions when needed
- Consider using interface extensions for complex types

### **Performance Issues**
- **Large files**: Consider splitting components
- **Complex rules**: Disable specific rules if needed
- **Memory usage**: Restart IDE if needed

## Future Enhancements

### **Planned Features**
- **Custom Rules**: Project-specific linting rules
- **Performance Monitoring**: Integration with performance tools
- **Security Scanning**: Enhanced security rule set
- **Documentation**: Auto-generated rule documentation

### **Integration Goals**
- **Storybook**: Component documentation integration
- **Testing**: Test file linting rules
- **Build Pipeline**: Advanced optimization rules
- **Monitoring**: Runtime error prevention rules

---

**Last Updated**: December 2024  
**Version**: 1.5.3  
**Compatibility**: Vue 3, TypeScript 5.3+, Node.js 18+ 