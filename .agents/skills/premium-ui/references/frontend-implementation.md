# Frontend implementation

## Contents
- Inspect before implementing
- Working with React/Tailwind/shadcn
- Scope discipline
- Testing the result

## Inspect before implementing

Before writing code on an existing project:
- `package.json` — framework, UI libraries, styling approach already in use
- Routing structure
- Existing components — is there a shared component library/design system to extend?
- Tailwind/CSS config — existing tokens, theme, breakpoints
- Existing design tokens (CSS variables, theme file)
- A few existing pages — current visual language, spacing/color conventions
- Current responsive behavior

Match what's there. A visually "improved" component that ignores the project's existing conventions creates inconsistency, which undermines the goal more than a plain-but-consistent one would.

## Working with React/Tailwind/shadcn

- Use the project's existing conventions (utility patterns, component composition style, naming) rather than introducing a new style.
- Avoid introducing new dependencies unless there's a real gap the existing stack can't fill — check what's already installed first.
- Build semantic component structures (proper element types, composable props) rather than one-off divs with inline styles.
- Maintain responsive behavior and accessibility when modifying existing components — don't regress either while making a visual change.
- Prefer extending/theming existing shadcn or design-system components over duplicating similar markup elsewhere.

## Scope discipline

- Reuse existing components where they fit; don't rebuild what already exists.
- Modify only what the task requires — don't take a request to fix one component as license to restyle the whole page.
- Don't redesign the entire application unless explicitly asked.
- Separate visual/UX changes from business-logic changes so each is independently reviewable and low-risk.

## Testing the result

After implementing, verify: the change renders correctly at each relevant breakpoint, existing functionality still works (forms submit, auth flows complete, data loads), interactive states work (hover/focus/disabled/loading/error), and keyboard navigation still functions. Visually review the result — don't declare a UI task complete without looking at it.
