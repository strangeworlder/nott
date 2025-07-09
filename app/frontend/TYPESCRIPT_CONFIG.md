# NotT TypeScript Configuration Documentation

## Overview

The NotT frontend uses a comprehensive TypeScript configuration optimized for Vue 3, Three.js, and horror game development. This setup provides strict type checking, advanced features, and excellent developer experience.

## 🎯 Configuration Features

### **Strict Type Checking**
- **`strict: true`**: Enables all strict type checking options
- **`noImplicitAny`**: Prevents implicit `any` types
- **`noImplicitReturns`**: Ensures all code paths return a value
- **`noImplicitOverride`**: Requires explicit override keyword
- **`noUncheckedIndexedAccess`**: Safer array and object access
- **`exactOptionalPropertyTypes`**: Strict optional property handling

### **Advanced Type Safety**
- **`noUnusedLocals`**: Catches unused local variables
- **`noUnusedParameters`**: Catches unused function parameters
- **`noFallthroughCasesInSwitch`**: Prevents switch fallthrough bugs
- **`noPropertyAccessFromIndexSignature`**: Safer property access
- **`allowUnusedLabels: false`**: Prevents unused labels
- **`allowUnreachableCode: false`**: Prevents unreachable code

### **Performance Optimizations**
- **`incremental: true`**: Faster incremental compilation
- **`skipLibCheck: true`**: Skips type checking of declaration files
- **`tsBuildInfoFile`**: Caches build information for faster rebuilds

### **Module Resolution**
- **`moduleResolution: "bundler"`**: Modern bundler-aware resolution
- **`allowImportingTsExtensions`**: Allows importing TypeScript files directly
- **`resolveJsonModule`**: Enables importing JSON files as modules

## 📁 Project Structure

### **Main Configuration (`tsconfig.json`)**
- **Target**: Application source code
- **Includes**: `src/**/*`, `tests/**/*`, config files
- **Features**: Vue 3, Three.js, DOM types

### **Node Configuration (`tsconfig.node.json`)**
- **Target**: Build tools and configuration files
- **Includes**: Vite config, Vitest config, Storybook config
- **Features**: Node.js, build tool types

## 🎮 Game-Specific Types

### **Core Game Types**
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}

interface Game {
  id: string;
  name: string;
  director_id: string;
  status: GameStatus;
  max_players: number;
  current_players: number;
  settings: GameSettings;
  created_at: Date;
  updated_at: Date;
}

type GameStatus = "lobby" | "active" | "completed" | "cancelled";
```

### **Game Mechanics**
```typescript
interface DiceRoll {
  id: string;
  game_id: string;
  player_id: string;
  dice_type: DiceType;
  results: number[];
  total: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

type DiceType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100";

interface Test {
  id: string;
  game_id: string;
  player_id: string;
  test_type: TestType;
  difficulty: number;
  roll_result: number;
  success: boolean;
  critical_success: boolean;
  critical_failure: boolean;
  timestamp: Date;
}
```

### **Three.js Integration**
```typescript
interface ThreeJSConfig {
  scene: {
    fog_color: number;
    fog_near: number;
    fog_far: number;
    background_color: number;
  };
  camera: {
    fov: number;
    near: number;
    far: number;
    position: [number, number, number];
  };
  renderer: {
    antialias: boolean;
    alpha: boolean;
    shadow_map_enabled: boolean;
    shadow_map_type: number;
  };
}
```

## 🛠️ Path Mapping

### **Alias Configuration**
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/types/*": ["./src/types/*"],
    "@/components/*": ["./src/components/*"],
    "@/services/*": ["./src/services/*"],
    "@/stores/*": ["./src/stores/*"],
    "@/utils/*": ["./src/utils/*"],
    "@/assets/*": ["./src/assets/*"],
    "@/config/*": ["./src/config/*"],
    "@/tests/*": ["./src/tests/*"]
  }
}
```

### **Usage Examples**
```typescript
// Import types
import { User, Game, DiceRoll } from "@/types";

// Import components
import BaseButton from "@/components/ui/BaseButton.vue";

// Import services
import { authService } from "@/services/auth";

// Import utilities
import { measureFunction } from "@/utils/performance";
```

## 🔧 Type Definitions

### **Built-in Types**
- **`vite/client`**: Vite-specific types
- **`node`**: Node.js types
- **`three`**: Three.js types
- **`socket.io-client`**: Socket.io types
- **`vitest/globals`**: Vitest testing types

### **Custom Type Definitions**
- **Game Types**: User, Game, Player, Character
- **Mechanics**: Dice, Tests, Strikes, Cards
- **Communication**: Chat, Voice, Socket events
- **UI Components**: Props, Emits, Slots
- **Utilities**: Performance, Validation, Errors

## 🎯 Strict Type Checking Benefits

### **Error Prevention**
- **Implicit Any**: Prevents accidental `any` types
- **Unused Variables**: Catches dead code
- **Switch Fallthrough**: Prevents missing break statements
- **Property Access**: Safer object property access

### **Code Quality**
- **Explicit Overrides**: Clear inheritance relationships
- **Unreachable Code**: Removes dead code paths
- **Index Access**: Safer array and object access
- **Optional Properties**: Strict optional handling

### **Developer Experience**
- **IntelliSense**: Better autocomplete and suggestions
- **Refactoring**: Safe refactoring with type checking
- **Documentation**: Types serve as documentation
- **Debugging**: Type errors catch bugs early

## 🚀 Performance Features

### **Incremental Compilation**
```json
{
  "incremental": true,
  "tsBuildInfoFile": "./node_modules/.cache/.tsbuildinfo"
}
```

### **Optimizations**
- **Skip Lib Check**: Faster compilation
- **Isolated Modules**: Better tree shaking
- **No Emit**: Type checking only
- **Module Resolution**: Bundler-aware resolution

## 🧪 Testing Support

### **Vitest Integration**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts']
  }
})
```

### **Test Types**
```typescript
// Global test types
declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends CustomMatchers<T> {}
  }
}
```

## 🎨 Vue 3 Integration

### **Component Types**
```typescript
// Component props
interface ComponentProps {
  [key: string]: unknown;
}

// Component emits
interface ComponentEmits {
  [key: string]: (...args: unknown[]) => void;
}

// Component slots
interface ComponentSlots {
  [key: string]: () => unknown;
}
```

### **Composition API**
```typescript
// Ref types
const user = ref<User | null>(null);
const isLoading = ref<boolean>(false);

// Computed types
const userName = computed<string>(() => user.value?.username || '');

// Watch types
watch(user, (newUser: User | null, oldUser: User | null) => {
  // Type-safe watcher
});
```

## 🔍 Type Utilities

### **Utility Types**
```typescript
// Deep partial for optional updates
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Optional fields
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Required fields
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Nullable types
type Nullable<T> = T | null;
type Undefinable<T> = T | undefined;
```

### **Event Types**
```typescript
// Event handlers
type EventHandler<T = Event> = (event: T) => void;

// Async functions
type AsyncFunction<T = unknown, R = unknown> = (arg: T) => Promise<R>;
```

## 🎯 Best Practices

### **Type Safety**
1. **Use strict mode**: Enable all strict options
2. **Avoid any**: Use proper types instead of `any`
3. **Explicit returns**: Ensure all code paths return values
4. **Unused code**: Remove unused variables and parameters
5. **Property access**: Use safe property access patterns

### **Performance**
1. **Incremental builds**: Use incremental compilation
2. **Skip lib check**: Skip declaration file checking
3. **Module resolution**: Use bundler-aware resolution
4. **Build info**: Cache build information

### **Developer Experience**
1. **Path mapping**: Use consistent import paths
2. **Type definitions**: Provide comprehensive types
3. **Documentation**: Use types as documentation
4. **IDE support**: Enable IntelliSense features

## 🔧 Troubleshooting

### **Common Issues**

#### **Type Errors**
```bash
# Check types
npm run type-check

# Fix specific file
npx vue-tsc --noEmit src/components/MyComponent.vue
```

#### **Import Errors**
```typescript
// Use proper path mapping
import { User } from "@/types"; // ✅
import { User } from "../../types"; // ❌
```

#### **Vue Component Types**
```typescript
// Define props with proper types
interface Props {
  title: string;
  count?: number;
  items: string[];
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => []
});
```

### **Performance Issues**
```bash
# Clean build cache
rm -rf node_modules/.cache

# Rebuild types
npm run type-check
```

## 📚 Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vue 3 TypeScript Guide](https://vuejs.org/guide/typescript/)
- [Three.js TypeScript](https://threejs.org/docs/#manual/en/introduction/Installation)
- [Vite TypeScript](https://vitejs.dev/guide/features.html#typescript)

## 🎯 Next Steps

### **Planned Enhancements**
- [ ] **Advanced Type Guards**: Runtime type checking
- [ ] **Generic Components**: Reusable typed components
- [ ] **API Type Generation**: Auto-generated API types
- [ ] **Strict Mode Enhancements**: Additional safety checks
- [ ] **Performance Monitoring**: Type checking performance

The TypeScript configuration is now **production-ready** with comprehensive type safety, excellent developer experience, and optimized performance for the NotT horror game project. 