# Design system

## Contents
- Inspect before creating
- Typography
- Color
- Spacing, radius, elevation
- Grid and containers
- Component states
- Motion and microinteractions
- Core component set
- Forms

## Inspect before creating

If the project already has a design system (Tailwind config, CSS variables, a component library, shadcn theme, etc.), **use and extend it — don't replace it without justification.** Read the existing tokens before inventing new ones. Only propose changes when there's a concrete reason (inconsistency, accessibility failure, missing state).

If none exists, define one before building more than a couple of components — ad hoc styling per component is the fastest path to an incoherent product.

## Typography

Typography is a primary design tool — use it instead of decoration to create hierarchy.

- Limit to 1-2 font families (a display/heading face and a body face, or one face across weights).
- Define a type scale (e.g. 12/14/16/18/20/24/30/36/48px or a similar ratio-based scale) — don't pick sizes ad hoc per element.
- Set line-height per size tier: tighter for large headings (~1.1-1.2), roomier for body text (~1.5-1.6).
- Control line length for body text (~50-75 characters) for readability.
- Use font-weight (not just size) to create hierarchy — e.g. 600/700 for emphasis, 400 for body.
- Adjust letter-spacing slightly negative on large headings, neutral-to-slightly-positive on small uppercase labels.
- Ensure sufficient contrast between text and background (see [accessibility.md](accessibility.md)).

## Color

Define semantic tokens, not raw values used ad hoc:

`background`, `foreground`, `muted` (+ `muted-foreground`), `primary` (+ `primary-foreground`), `secondary`, `accent`, `success`, `warning`, `error`, `border`.

Rules:
- If a brand palette exists, respect it — derive semantic tokens from it rather than introducing new hues.
- If none exists, create a restrained, professional palette: typically one primary hue, a neutral gray scale for most of the UI, and dedicated status colors (success/warning/error) that are distinct from the primary hue.
- Every component should pull colors from the semantic tokens, never a one-off hex value.
- Reserve saturated color for what needs attention (primary actions, status); keep the majority of the UI (surfaces, borders, secondary text) neutral.

## Spacing, radius, elevation

- Use a consistent spacing scale (e.g. 4px base: 4/8/12/16/24/32/48/64) for padding, margin, and gaps — never arbitrary pixel values.
- Pick one or two border-radius values and use them consistently across similar component types (e.g. inputs/buttons share one radius, cards use another) — avoid "random rounded corners" where radius varies without a system.
- Use shadows sparingly, tied to an elevation system (e.g. flat / raised / overlay), not decoratively on every card. Prefer a subtle border or background-shift over a heavy shadow when a component just needs separation from its surface.
- Define borders as part of the same system (color from `border` token, consistent width).

## Grid and containers

- Use a consistent max-width container per page type (e.g. marketing page vs. dashboard) rather than ad hoc widths per section.
- Use CSS grid/flex with the spacing scale for layout, not manual positioning.
- Keep column counts and gutters consistent across breakpoints (see [responsive-design.md](responsive-design.md) for how they change).

## Component states

Every interactive component needs defined states, not just a default look: default, hover, focus-visible, active/pressed, disabled, loading (where relevant), selected (where relevant), and error (for inputs). Missing states are one of the most common gaps between "looks done" and "production-ready."

## Motion and microinteractions

Use animation only when it communicates something: state changes, feedback on an action, loading/progress, page/modal transitions, list appearance. Keep durations short (typically 100-300ms for micro-interactions, up to ~400ms for larger transitions) and easing purposeful (ease-out for entrances, ease-in for exits). Avoid decorative looping animation and anything that delays the user from completing a task. Respect `prefers-reduced-motion`.

Give explicit feedback for: button presses, toggles, form submission, save actions, drag/drop, success, and error — the user should always know what just happened.

## Core component set

Build (or reuse) a consistent set rather than one-off markup per screen: Button, Input, Select, Card, Modal, Drawer, Tabs, Navigation, Sidebar, Table, Badge, Toast, Tooltip, Dropdown, EmptyState, Skeleton, ErrorState, Chart, StatCard. Don't over-abstract early — create a shared component once a pattern repeats 2-3 times, not preemptively.

## Forms

Minimize friction: clear labels (not placeholder-only — placeholders disappear on input and hurt accessibility), helpful placeholders as supplementary hints, inline validation, specific and actionable error messages, sensible defaults, correct input types (email, tel, number, date), a clear primary CTA, and progress indication for multi-step flows. Never hide information the user needs to complete the form behind a placeholder that vanishes on focus.
