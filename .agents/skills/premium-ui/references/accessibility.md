# Accessibility

## Contents
- Non-negotiables
- Contrast
- Keyboard and focus
- Semantics and ARIA
- States and feedback

## Non-negotiables

Never sacrifice accessibility for aesthetics. Accessibility issues are typically CRITICAL or HIGH severity in a review, not LOW — they block real users, not just look imperfect.

## Contrast

Meet WCAG AA at minimum: 4.5:1 for normal body text, 3:1 for large text (~18px+/bold ~14px+) and for meaningful UI component boundaries/icons. Check contrast for every text-on-background and icon-on-background pairing introduced, not just the primary palette — muted/secondary text is the most common failure point.

## Keyboard and focus

- Every interactive element must be reachable and operable via keyboard alone (Tab/Shift+Tab, Enter/Space, Escape to close overlays, arrow keys where a native pattern expects them — e.g. tabs, menus).
- Visible focus states are required on every focusable element — never remove the focus outline without providing an equally visible replacement.
- Modals/drawers must trap focus while open and return focus to the trigger element on close.
- Logical tab order should match visual reading order.

## Semantics and ARIA

- Use semantic HTML first (`button`, `nav`, `main`, `label`, `table`, headings in order) — reach for ARIA only when semantic HTML can't express the pattern.
- Every form input needs an associated, visible label (not placeholder-only).
- Icon-only buttons need an accessible name (`aria-label` or visually-hidden text).
- Images need meaningful `alt` text (or `alt=""` if purely decorative).
- Use correct heading hierarchy (one `h1` per page, no skipped levels) so screen-reader users can navigate by structure.
- Dynamic content updates (toasts, live validation, streaming AI output) should use appropriate `aria-live` regions so they're announced.

## States and feedback

- Error messages must be specific, programmatically associated with their field (`aria-describedby`), and not conveyed by color alone.
- Loading and empty states need a text equivalent, not just a spinner icon.
- Ensure readable font sizes (generally ≥14px for body text, ideally 16px) and adequate touch targets (see [responsive-design.md](responsive-design.md)).
