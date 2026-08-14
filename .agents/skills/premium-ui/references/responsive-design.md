# Responsive design

## Contents
- Principle
- Breakpoints
- Reorganization by surface type
- Touch targets

## Principle

Don't simply shrink the desktop layout. Decide, per breakpoint, how information should *reorganize* — what becomes hidden, collapsed, stacked, or restructured — based on what the user needs at that size. Mobile must feel intentionally designed, not like an afterthought.

## Breakpoints

Use a standard set unless the project defines its own (check existing Tailwind/CSS config first): mobile (~0-639px), tablet (~640-1023px), desktop (~1024-1279px), large desktop (~1280px+). Keep column counts, gutters, and container max-widths consistent and intentional at each tier — don't just let content reflow uncontrolled.

## Reorganization by surface type

- **Navigation**: full nav bar on desktop → collapsed/hamburger or bottom nav on mobile; keep the primary action reachable at every size.
- **Tables**: on mobile, convert to stacked cards or a horizontally-scrollable table with sticky first column — never shrink a wide table to illegible text.
- **Cards/grids**: reduce column count per breakpoint (e.g. 4 → 2 → 1), don't just let cards shrink to unreadable sizes.
- **Sidebars**: collapse to an off-canvas drawer or bottom sheet on mobile; decide whether it's needed at all on small screens.
- **Filters**: move inline filters into a drawer/modal on mobile rather than consuming vertical space above content.
- **Forms**: single column on mobile always; multi-column only above tablet width, and only when fields are logically related.
- **Charts**: simplify on mobile (fewer series/labels, larger touch targets for interaction, consider a simplified summary view over a dense chart).
- **CTAs**: keep the primary CTA reachable without excessive scrolling; consider a sticky CTA on mobile for key conversion flows.

## Touch targets

Minimum ~44x44px touch targets on mobile/tablet. Increase spacing between adjacent interactive elements to prevent mis-taps. Don't rely on hover-only affordances (tooltips, hover menus) for functionality that must work on touch devices.
