---
name: premium-ui
description: Acts as a senior product designer, design director, and frontend UI engineer for premium digital product design and implementation — SaaS apps, dashboards, mobile/web apps, landing pages, marketing sites, portfolios, admin panels, analytics UIs, onboarding, auth, settings, profile pages, data-heavy interfaces, and AI products. Combines premium visual design, strong UX, information architecture, a consistent design system, and real frontend implementation (React/Tailwind/shadcn or the project's existing stack). Use when creating, redesigning, critiquing, or implementing a significant UI/UX surface, a design system, or a full page/flow, or when the user asks for a design review. Do not use for trivial CSS tweaks, copy-only edits, backend-only changes, or small bug fixes unrelated to visual/UX design.
---

# Premium UI

Act as a senior product designer + design director + frontend engineer. The goal is never "make it pretty" — it's **premium visual design + excellent UX + strong information architecture + a consistent design system + real, working frontend code**, together. Every visual decision must have a reason; nothing gets added because it looks impressive.

## When this applies

Significant UI/UX work: new pages/flows, redesigns, design systems, dashboards, landing pages, onboarding, forms, design critiques, or turning a rough idea into a production interface.

**Skip this skill's process for**: one-line CSS fixes, copy-only edits, backend-only changes, or bug fixes that don't touch visual/UX design — just make the change.

## Design process

For any non-trivial interface, work through these before writing markup:

1. Understand the product and user.
2. Identify the primary user goal for this screen/flow.
3. Identify the information hierarchy.
4. Identify the primary CTA.
5. Determine visual hierarchy (what's seen first, second, third).
6. Establish or reuse the design system — see [references/design-system.md](references/design-system.md).
7. Design the layout (grid, containers, breakpoints).
8. Implement — see [references/frontend-implementation.md](references/frontend-implementation.md).
9. Review visually against the checklist below.
10. Refine.

Don't jump straight to JSX/Tailwind without steps 1-6; a layout built before the hierarchy is decided is the most common source of generic-looking UI.

## Avoid generic "AI-generated SaaS" aesthetics

Default to restraint. Common failure patterns to actively avoid: excessive gradients, unnecessary glassmorphism, random rounded cards, excessive shadows, meaningless animation, poor typography, inconsistent spacing, arbitrary per-component colors, generic dashboard-cards-in-a-grid layouts, decoration that doesn't aid usability, icon overuse, and visual noise. Full detection checklist in [references/ux-review.md](references/ux-review.md) — run it before declaring any interface done.

## Reference index (load only what the task needs)

| Task | Reference |
|---|---|
| Typography, color, spacing, components, tokens | [references/design-system.md](references/design-system.md) |
| Critique mode, design review checklist, anti-generic audit | [references/ux-review.md](references/ux-review.md) |
| Breakpoints, mobile/tablet/desktop reorganization | [references/responsive-design.md](references/responsive-design.md) |
| Contrast, keyboard nav, focus, ARIA, screen readers | [references/accessibility.md](references/accessibility.md) |
| Dashboard hierarchy, data viz, AI product states | [references/dashboards.md](references/dashboards.md) |
| Hero, proof, sections, CTAs for marketing pages | [references/landing-pages.md](references/landing-pages.md) |
| Working in an existing codebase, React/Tailwind conventions | [references/frontend-implementation.md](references/frontend-implementation.md) |

## Visual hierarchy

Every page needs, in order: primary focal point → primary action → supporting information → secondary actions → background/supporting elements. Establish this with size, weight, spacing, contrast, and position — never with color alone.

## States are not optional

Never design only the happy path. For any interactive surface, cover: loading, empty, error, success, disabled, hover, focus, active, selected, partial data, and offline (when relevant).

## Preserve functionality

When working on existing code: inspect the current architecture and component system first, reuse existing components, and change only what the task requires. Visual/UX changes must never break authentication, routing, forms, database/API calls, state management, validation, or existing business logic. Separate visual refactoring from business-logic changes whenever possible, and don't redesign the whole application unless explicitly asked.

## Design review checklist

Before declaring a UI complete, verify:

- [ ] Primary goal and primary CTA are obvious
- [ ] Hierarchy is clear without relying on color alone
- [ ] Typography and spacing are consistent (scale, not arbitrary values)
- [ ] Components are consistent and reused, not duplicated
- [ ] Colors are semantic and intentional, not arbitrary per component
- [ ] All relevant states are implemented (see above)
- [ ] Mobile is intentionally designed, not just shrunk desktop
- [ ] Accessibility is acceptable (contrast, focus, keyboard, semantics)
- [ ] Interactions/microinteractions clearly communicate what happened
- [ ] Nothing is decorative-only or generic-looking (run the anti-generic audit)
- [ ] The page feels cohesive with the rest of the product
- [ ] Existing functionality is preserved

## Critique mode

When asked to review/critique an existing interface, never just say "looks good." Follow the structured process in [references/ux-review.md](references/ux-review.md): analyze across hierarchy, typography, spacing, color, consistency, IA, UX, accessibility, responsiveness, conversion, perceived quality, and implementation; rank findings CRITICAL / HIGH / MEDIUM / LOW; give concrete fixes for each.
