# premium-ui

A Claude Code / Agent Skill that makes Claude act as a senior product designer, design director, and frontend UI engineer — for premium visual design, strong UX, information architecture, a consistent design system, and real frontend implementation, together.

## Why

Left to default behavior, an LLM asked to "design a dashboard" tends toward generic AI-SaaS patterns: card grids, default gradients, decorative glassmorphism, inconsistent spacing, happy-path-only states. This skill enforces a design process (goal → hierarchy → design system → layout → implementation → review) and an explicit anti-generic-design audit before any UI is considered done, while staying token-efficient via progressive disclosure.

## Structure

```
premium-ui/
├── SKILL.md                          # Process, philosophy, review checklist (loaded when triggered)
├── references/                       # Loaded only when that dimension is relevant
│   ├── design-system.md              # Typography, color, spacing, components, motion, forms
│   ├── ux-review.md                  # Critique process, severity ranking, anti-generic audit
│   ├── responsive-design.md          # Breakpoints, per-surface mobile reorganization
│   ├── accessibility.md              # Contrast, keyboard/focus, semantics/ARIA, states
│   ├── dashboards.md                 # Dashboard hierarchy, data viz, AI product states
│   ├── landing-pages.md              # Marketing page structure, copy/CTA guidance
│   └── frontend-implementation.md    # Working in existing codebases, React/Tailwind/shadcn
└── tests/
    └── test-prompts.md               # 30 manual evaluation prompts (25 positive, 5 negative)
```

## Install

**Project-local:** already present at `.claude/skills/premium-ui` (symlink to `.agents/skills/premium-ui`) — Claude Code picks it up automatically.

**Personal (any project):** copy the `premium-ui/` directory into `~/.claude/skills/premium-ui`.

**claude.ai custom Skills:** upload `premium-ui.skill` via Settings → Features → Skills.

## Test

Run prompts from `tests/test-prompts.md`. Confirm the skill triggers its full design process on significant UI/UX work and stays out of the way for trivial CSS/copy/backend/bug-fix requests.
