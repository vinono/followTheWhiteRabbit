---
name: matt-pocock-typescript
description: >-
  Apply Matt Pocock's (Total TypeScript) advanced TypeScript patterns, type ergonomics, 
  and best practices. Use when designing types, refactoring complex generics, creating 
  discriminated unions, using satisfies / const type parameters, or writing type-safe TypeScript code.
---

# Matt Pocock (Total TypeScript) Style Guide & Best Practices

This skill provides direct heuristics, rules, and code patterns derived from Matt Pocock's Total TypeScript material and official guidance.

---

## 1. 核心铁律 (Core Axioms)

1. **推导优先于标注 (Inference over Annotation)**:
   让 TypeScript 自己通过控制流推断类型。不要给每个变量显式声明冗余类型。
2. **拥抱 `satisfies` (Prefer `satisfies` over `as` or `:`)**:
   需要校验对象符合结构同时保留最精确的字面量推导时，使用 `satisfies`。
3. **禁止类型欺骗 (Zero Blind Assertions)**:
   严禁滥用 `any` 或 `as unknown as T`。若必须断言，必须使用 Type Guard (`is`) 或 Zod/Valibot 运行时解析。
4. **可辨识联合为先 (Discriminated Unions over Boolean Flags)**:
   永远不要用多个布尔标志位表达互斥状态，统一使用可辨识联合。

---

## 2. 经典类型模式与速查 (Key Patterns)

### A. Prettify 辅助类型
将深层嵌套的相交类型展开为易读的平面对象，极大改善 IDE 悬停体验：
```typescript
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
```

### B. Const Type Parameters (TS 5.0+)
在泛型函数中捕获最深层次的字面量类型，无需调用者显式写 `as const`：
```typescript
function defineRoutes<const T extends readonly string[]>(routes: T): T {
  return routes;
}
```

### C. 可辨识联合与 Exhaustiveness Check
在处理状态分支时，确保 `switch` 分支穷尽所有可能：
```typescript
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; error: Error };

function handleState(state: State) {
  switch (state.status) {
    case "idle": return "Idle";
    case "loading": return "Loading...";
    case "success": return state.data.join(", ");
    case "error": return state.error.message;
    default: {
      const _exhaustive: never = state;
      throw new Error(`Unhandled state: ${_exhaustive}`);
    }
  }
}
```

### D. 对象键与值的类型提取
```typescript
// 从对象值提取联合类型
export const ROLES = {
  admin: "ADMIN",
  user: "USER",
  guest: "GUEST",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES]; // "ADMIN" | "USER" | "GUEST"
```

### E. 安全替代 `object` 与 `{}`
- 表示未知键值对对象：使用 `Record<string, unknown>`，不要使用 `{}` 或 `object`。
- 表示任何函数：使用 `(...args: any[]) => any`，而不是 `Function`。

### F. 函数重载 vs 条件类型泛型
- 如果返回类型简单依赖入参类型（例如传入 string 返回 number，传入 array 返回 object），优先使用**函数重载**（Function Overloads），更直观、报错提示更友善。
- 只有当需要复杂的动态类型映射或管道组合时，才使用条件类型泛型（Conditional Generics）。

---

## 3. 类型调试与排错指导 (Debugging Heuristics)

当遇到类型推断报错时：
1. **悬停检查展开**：利用 `Prettify<T>` 查看类型真实推断形态。
2. **拆解复杂泛型**：将长链式条件类型拆分成命名的中间辅助类型（Type Helpers）。
3. **定位断点**：使用 `type Test = Expect<Equal<Actual, Expected>>` 编写类型级测试。
