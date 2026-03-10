---
name: vercel-composition-patterns
description: >
  React composition patterns that scale. Use when refactoring components with
  boolean prop proliferation, building flexible component libraries, or
  designing reusable APIs. Triggers on tasks involving compound components,
  render props, context providers, or component architecture. Includes React 19
  API changes.
license: MIT
metadata:
  author: vercel
  version: '1.0.0'
---

# React Composition Patterns

Composition patterns for building flexible, maintainable React components. Avoid
boolean prop proliferation by using compound components, lifting state, and
composing internals. These patterns make codebases easier for both humans and AI
agents to work with as they scale.

## When to Apply

Reference these guidelines when:

- Refactoring components with many boolean props
- Building reusable component libraries
- Designing flexible component APIs
- Reviewing component architecture
- Working with compound components or context providers

## Rule Categories by Priority

| Priority | Category                | Impact | Prefix          |
| -------- | ----------------------- | ------ | --------------- |
| 1        | Component Architecture  | HIGH   | `architecture-` |
| 2        | State Management        | MEDIUM | `state-`        |
| 3        | Implementation Patterns | MEDIUM | `patterns-`     |
| 4        | React 19 APIs           | MEDIUM | `react19-`      |

## Quick Reference

### 1. Component Architecture (HIGH)

- `architecture-avoid-boolean-props` - Don't add boolean props to customize behavior; use composition
- `architecture-compound-components` - Structure complex components with shared context

### 2. State Management (MEDIUM)

- `state-decouple-implementation` - Provider is the only place that knows how state is managed
- `state-context-interface` - Define generic interface with state, actions, meta for dependency injection
- `state-lift-state` - Move state into provider components for sibling access

### 3. Implementation Patterns (MEDIUM)

- `patterns-explicit-variants` - Create explicit variant components instead of boolean modes
- `patterns-children-over-render-props` - Use children for composition instead of renderX props

### 4. React 19 APIs (MEDIUM)

> **⚠️ React 19+ only.** This project uses React 19.

- `react19-no-forwardref` - Don't use `forwardRef`; use `ref` prop directly (React 19)
- `react19-use-hook` - Use `use()` hook instead of `useContext()` for reading context

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/architecture-avoid-boolean-props.md
rules/state-context-interface.md
```

Each rule file contains:

- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references

## Full Compiled Document

For the complete guide with all rules expanded: `AGENTS.md`

## Key Patterns for This Project (Next.js + React 19 + TypeScript)

### Avoid Boolean Prop Proliferation

```tsx
// ❌ Bad: growing list of booleans
<Modal isOpen isFullScreen hasFooter showCloseButton />

// ✅ Good: compound components with composition
<Modal>
  <Modal.Header onClose={handleClose} />
  <Modal.Body>...</Modal.Body>
  <Modal.Footer>...</Modal.Footer>
</Modal>
```

### React 19 Context (No forwardRef)

```tsx
// ❌ Old React 18 pattern
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <input ref={ref} {...props} />
));

// ✅ React 19: ref is a regular prop
function Input({ ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}
```

### Form Components with React Hook Form

Given this project uses `react-hook-form` + `zod`, compose form fields explicitly:

```tsx
// ✅ Good: explicit form field composition
function ServiceForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ServiceSchema>({
    resolver: zodResolver(serviceSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} error={errors.name?.message} />
      <Input {...register('slug')} error={errors.slug?.message} />
    </form>
  );
}
```

### Server Action Pattern

```tsx
// ✅ Good: typed server action with validation
'use server';
import { z } from 'zod';

const schema = z.object({ name: z.string().min(1) });

export async function createService(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');
  
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten() };
  
  // proceed with DB operation
}
```
