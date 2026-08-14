# UX review & critique mode

## Contents
- Critique process
- Severity ranking
- Anti-generic-design audit
- Output format

## Critique process

When reviewing an existing interface (screenshot, live app, or code), analyze across all of these dimensions — don't stop at the first issue found:

1. Visual hierarchy — is it obvious what matters most?
2. Typography — scale, weight, line-height, line length, consistency
3. Spacing — consistent scale vs. arbitrary values
4. Color — semantic and intentional vs. arbitrary
5. Consistency — components, patterns, terminology across the surface
6. Information architecture — is content organized around user goals?
7. UX — clarity, discoverability, cognitive load, predictability
8. Accessibility — contrast, focus, keyboard, semantics (see [accessibility.md](accessibility.md))
9. Responsive behavior — is mobile intentionally designed?
10. Conversion — for marketing/product surfaces, does the flow lead to the intended action?
11. Perceived quality — the details users actually notice (alignment, consistency, polish)
12. Technical implementation — does the code match the visual intent, is it maintainable?

## Severity ranking

Rank every finding:

- **CRITICAL** — blocks the user's primary goal, breaks accessibility badly, or breaks functionality
- **HIGH** — significantly hurts usability, clarity, or perceived quality
- **MEDIUM** — noticeable inconsistency or polish issue, not blocking
- **LOW** — minor detail, nice-to-have

## Anti-generic-design audit

Before finalizing any design or critique, actively check for generic "AI-generated SaaS" signals — and redesign the affected area if found rather than leaving it:

- [ ] Identical card grids with no visual hierarchy between items
- [ ] Excessive rounded rectangles used decoratively rather than systematically
- [ ] Default/unjustified gradients
- [ ] Generic purple/blue "AI product" aesthetic with no connection to the brand
- [ ] Glass/blur effects with no functional purpose
- [ ] Dashboard metrics that don't map to a real decision the user needs to make
- [ ] Excessive shadow use instead of a real elevation system
- [ ] Repetitive section patterns on landing pages (icon + heading + paragraph, repeated many times, with no variation or hierarchy)
- [ ] Oversized headings paired with weak/generic supporting content
- [ ] Icons added decoratively without adding information
- [ ] Whitespace so excessive it weakens hierarchy rather than clarifying it
- [ ] Generic CTA language ("Get Started", "Learn More", "Unlock Potential") with no specific value stated

## Output format

For a critique, structure the response as: brief overall assessment → findings grouped by severity (CRITICAL first) → for each finding, name the issue, why it matters, and a concrete fix (not just "improve spacing" — say what spacing/value to use). Close with what's already working well, so the response isn't purely negative.
