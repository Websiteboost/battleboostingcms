---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Fetch the latest guidelines from the source URL below
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all the
rules and output format instructions.

## Usage

When a user provides a file or pattern argument:
1. Fetch guidelines from the source URL above
2. Read the specified files
3. Apply all rules from the fetched guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.

## Project-Specific UI Review Checklist (Next.js + Tailwind CSS v4 + TypeScript)

When reviewing UI files in this project, also check:

### Accessibility
- All interactive elements have appropriate ARIA labels when text alone is insufficient
- Form inputs are associated with labels (use `htmlFor` + `id`, or `aria-label`)
- Color contrast meets WCAG AA (4.5:1 for text, 3:1 for UI components)
- Focus states are visible and not removed with `outline-none` without a replacement
- Images have meaningful `alt` text; decorative images use `alt=""`
- Keyboard navigation works for all interactive elements

### Tailwind CSS v4 Conventions
- Use Tailwind v4 CSS variable tokens (`--color-*`, `--spacing-*`) for custom values
- Avoid arbitrary values (`[...]`) when a token exists
- Prefer responsive prefixes (`sm:`, `md:`, `lg:`) over custom breakpoints
- Use `@layer` in globals.css for custom utilities, not inline styles

### Component Patterns
- Interactive components use `'use client'` directive when needed
- Server Components don't import client-only APIs (localStorage, window, etc.)
- Loading states use `loading.tsx` files or `<Suspense>` boundaries
- Error states use `error.tsx` files or proper error boundaries

### Forms (React Hook Form + Zod)
- All forms have validation schema defined with Zod
- Error messages are displayed accessibly near their fields
- Form submission shows loading/disabled state during pending
- Server-side validation matches client-side Zod schema

### Responsive Design
- Mobile-first approach: base styles for mobile, extend with `sm:`/`md:`/`lg:`
- Touch targets are at least 44px × 44px on mobile
- Text is readable without horizontal scrolling on 320px width screens
- Images and media don't overflow their containers

### Performance
- Images use `next/image` for optimization
- Heavy components are code-split with `next/dynamic`
- Icons from `lucide-react` are imported individually, not as barrel imports
- Fonts are loaded with `next/font` for optimization
