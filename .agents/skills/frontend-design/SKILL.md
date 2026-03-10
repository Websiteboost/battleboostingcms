---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces
that avoid generic "AI slop" aesthetics. Implement real working code with
exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or
interface to build. They may include context about the purpose, audience, or
technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic,
  organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw,
  art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many
  flavors to choose from. Use these for inspiration but design one that is true to
  the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold
maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts
  like Arial and Inter; opt instead for distinctive choices that elevate the
  frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive
  display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant
  colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only
  solutions for HTML. Use Motion library for React when available. Focus on high-impact
  moments: one well-orchestrated page load with staggered reveals (animation-delay)
  creates more delight than scattered micro-interactions. Use scroll-triggering
  and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements.
  Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add
  contextual effects and textures that match the overall aesthetic. Apply creative forms
  like gradient meshes, noise textures, geometric patterns, layered transparencies,
  dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter,
Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients
on white backgrounds), predictable layouts and component patterns, and
cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed
for the context. No design should be the same. Vary between light and dark themes,
different fonts, different aesthetics. NEVER converge on common choices (Space
Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs
need elaborate code with extensive animations and effects. Minimalist or refined
designs need restraint, precision, and careful attention to spacing, typography,
and subtle details. Elegance comes from executing the vision well.

Remember: Extraordinary creative work is possible. Don't hold back — show what can
truly be created when thinking outside the box and committing fully to a distinctive vision.

## Implementation Guide for This Project (Next.js + Tailwind CSS v4 + TypeScript)

### Tailwind CSS v4 Design Tokens
Use CSS variables for your design system — Tailwind v4 uses `@theme` in CSS:

```css
/* globals.css */
@theme {
  --color-brand: #0f172a;
  --color-accent: #f59e0b;
  --font-display: 'Playfair Display', serif;
  --font-body: 'Inter Variable', sans-serif;
}
```

### Motion & Micro-interactions
For this React 19 project, use CSS animations via Tailwind or the Motion library:

```tsx
// Staggered reveal on page load (CSS approach with Tailwind)
<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
  Content that reveals gracefully
</div>

// Or with inline CSS animation delays for staggered lists
{items.map((item, i) => (
  <div
    key={item.id}
    style={{ animationDelay: `${i * 100}ms` }}
    className="animate-in fade-in slide-in-from-left-4 fill-mode-both duration-300"
  >
    {item.name}
  </div>
))}
```

### Dashboard/CMS UI Patterns
This is a CMS dashboard. For admin interfaces, consider:
- **Precision & clarity** over decoration — data at a glance
- **Micro-interactions** on form saves, row selections, status changes
- **Dark sidebar** with crisp typography for navigation
- **Card-based layouts** with subtle shadows and hover states
- **Status indicators** with meaningful colors (not traffic-light clichés)
- **Empty states** as design opportunities — not just text but illustrated concepts

### Component Design Principles
```tsx
// ✅ Distinctive: custom design vs generic Bootstrap-style
function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-brand/20">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      {/* content */}
    </article>
  );
}
```

### Lucide Icons as Design Elements
Use Lucide React icons as part of the visual language, not just functional icons:
```tsx
import { Zap, Shield, Star } from 'lucide-react';

// Pair icons with typography for visual hierarchy
<div className="flex items-center gap-2">
  <Zap className="h-5 w-5 text-amber-400" strokeWidth={2.5} />
  <span className="font-semibold tracking-tight">Fast Delivery</span>
</div>
```
