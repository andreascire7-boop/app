# world-research

A Claude Code / Agent Skill that turns Claude into a current-evidence research agent for places: countries, cities, regions, travel, relocation, cost of living, climate, transport/airports, safety, and place-to-place comparisons.

## Why

General-purpose Claude answers place questions from training data, which goes stale (prices, visa rules, schedules, safety conditions). This skill enforces: search first, cite sources with dates, label confidence (VERIFIED/ESTIMATE/UNVERIFIED), and never fabricate figures.

## Structure

```
world-research/
├── SKILL.md                          # Entry point: workflow, rules, output templates (loaded when triggered)
├── references/                       # Loaded only when that dimension is relevant
│   ├── travel-research.md
│   ├── city-comparison.md
│   ├── country-comparison.md
│   ├── cost-of-living.md
│   ├── relocation.md
│   ├── climate.md
│   ├── transport-and-airports.md
│   ├── safety.md
│   └── geographic-analysis.md
└── tests/
    └── test-prompts.md               # Manual evaluation prompts
```

No bundled scripts: this skill is pure methodology + source guidance, since fabricating "sample data" about real places would violate its own anti-hallucination rules. All factual claims come from Claude's live web search at run time.

## Install

**Project-local (this repo):** already present at `.claude/skills/world-research` (symlink to `.agents/skills/world-research`) — Claude Code picks it up automatically.

**Personal (any project):** copy the `world-research/` directory into `~/.claude/skills/world-research`.

**claude.ai custom Skills:** zip the `world-research/` directory (or use the provided `world-research.skill` package) and upload via Settings → Features → Skills.

## Test

Run prompts from `tests/test-prompts.md` and check: skill triggers on place/time-sensitive questions, does *not* trigger on stable general-knowledge questions, and every output labels its figures and sources.
