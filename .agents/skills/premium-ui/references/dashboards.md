# Dashboards, data visualization & AI interfaces

## Contents
- Dashboard hierarchy
- Data visualization
- AI product states

## Dashboard hierarchy

Never build a dashboard by placing cards in a grid. Start with: **what decision should the user make from this dashboard?** Organize everything around that decision, in this typical hierarchy:

```
Primary KPI → key insight → trend → supporting metrics → detailed data → actions
```

The primary KPI/insight should be immediately visible without scrolling and visually dominant (size/position/weight — see visual hierarchy in SKILL.md). Supporting metrics and detailed data (tables, breakdowns) come after, for users who want to drill in. Every metric shown should map to a real question the user has — cut anything decorative that doesn't inform a decision.

## Data visualization

- Choose the chart type that matches the data relationship (trend → line, comparison → bar, composition → stacked bar, rarely pie/donut for >4-5 categories).
- Avoid chart junk: minimal gridlines, no unnecessary 3D/decoration, label directly where possible instead of relying only on a legend.
- Always show units and the time period/comparison basis (e.g. "vs. previous 30 days") — a number without context isn't actionable.
- Emphasize the metric that matters most visually (color, size, position) rather than giving every series equal weight.
- Handle empty/insufficient data explicitly (see states in SKILL.md) — don't render a broken or misleading empty chart.
- Make charts responsive: simplify series/labels on mobile rather than shrinking illegibly (see [responsive-design.md](responsive-design.md)).

## AI product states

For AI-powered interfaces, design the full lifecycle, not just the result:

- **Input** — clear affordance for what can be asked/provided, examples if the input format isn't obvious
- **Processing** — visible feedback that something is happening; use streaming output when the underlying model supports it, so the user isn't staring at a blank loading state
- **Result** — clearly distinguished generated content from static UI
- **Confidence/uncertainty** — surface it when the product's accuracy varies meaningfully and the user's decision depends on it
- **Retry / edit / regenerate** — recovery path when the result isn't right
- **Copy / export / use result** — make the output actually usable, not a dead end
- **Feedback** — a lightweight way to signal good/bad output, if the product benefits from it
- **History** — access to prior results when users are likely to want to return to them

Make the AI's behavior legible: the user should always understand what it's doing and why, especially during processing and on failure.
