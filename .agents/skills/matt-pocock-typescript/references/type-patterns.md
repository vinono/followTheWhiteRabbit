# Advanced Total TypeScript Patterns Reference

Matt Pocock's signature type utilities and patterns for everyday TypeScript architecture.

---

## 1. Loose Autocomplete (宽松自动补全)

当你希望 IDE 在输入时提供已知字面量列表补全，同时依然允许用户输入任意字符串：

```typescript
export type LooseAutocomplete<T extends string> = T | (string & {});
```

**用法**：
```typescript
type Color = LooseAutocomplete<"primary" | "secondary" | "accent">;
// 悬停依然会有 "primary" | "secondary" | "accent" 提示，但传入 "custom-red" 也合法且不报错！
```

---

## 2. Type Testing Helpers (类型测试工具)

无需运行任何 JS 测试套件，纯静态在编译期验证类型是否一致：

```typescript
export type Expect<T extends true> = T;
export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;
```

**用法**：
```typescript
type Res = StringToNumber<"42">;
type Test = Expect<Equal<Res, 42>>; // 若类型推导错误，直接在此行红线报错
```

---

## 3. Deep Partial (深度可选)

将对象各层级的所有属性递归变为可选：

```typescript
export type DeepPartial<T> = T extends Function
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;
```

---

## 4. Keyof / ValuesOf 提取器

```typescript
export type ValuesOf<T> = T[keyof T];
```
