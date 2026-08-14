# football-concept-manipulation

A Claude Design Skill that turns a short football/soccer creative concept into a complete, original editorial graphic — acting as art director, visual researcher, and photo-manipulation artist in one, in the style of professional football design studios (the kind of work seen on Behance's football-design community).

## Why

Given a one-line concept, default LLM behavior either produces a generic AI image or asks the user to supply every reference image manually. This skill instead drives the full production pipeline itself — concept analysis, targeted visual research, art direction, composition, generation, and quality control — while holding two things fixed no matter how creative the rest of the piece gets: the real player's identity and the real kit details.

## Core rules

- **Competition/context comes only from the user.** Nothing is assumed or invented.
- **Player identity is absolute**: face, proportions, and anatomy are preserved, never redesigned.
- **Kit is absolute**: crest, sponsor, number, name, and patches are preserved exactly.
- **No watermark reproduction or removal** — clean/official/licensed sources are found instead.
- **No copying existing artworks** — reference projects are studied for technique/language only; output is original.
- Everything else — environment, scale, architecture, atmosphere, lighting, metaphor — is full creative freedom.

## Structure

```
football-concept-manipulation/
├── SKILL.md                          # Rules, workflow, checklists (loaded when triggered)
├── references/
│   ├── visual-research.md            # What to research, source quality, watermark/licensing handling
│   ├── composition.md                # Hero subject, camera, framing, scale, format fit
│   ├── football-kit-fidelity.md      # Player identity + kit fidelity — the non-negotiable rules
│   ├── photo-manipulation.md         # Realistic compositing craft, anti-generic-AI checklist
│   ├── cinematic-lighting.md         # Shared lighting systems, color palette
│   ├── visual-metaphor.md            # Turning an abstract idea into a physical image
│   ├── editorial-typography.md       # Type treatment when text is requested
│   └── social-formats.md             # Instagram/TikTok/X/Behance format specs
└── tests/
    └── test-prompts.md               # 24 test prompts, including fidelity/guardrail edge cases
```

## Install

**Project-local:** already present at `.claude/skills/football-concept-manipulation` (symlink to `.agents/skills/football-concept-manipulation`) — Claude Code picks it up automatically.

**Personal (any project):** copy the directory into `~/.claude/skills/football-concept-manipulation`.

**claude.ai custom Skills:** upload `football-concept-manipulation.skill` via Settings → Features → Skills.

## Test

Run prompts from `tests/test-prompts.md`. Confirm the skill researches its own references, respects the user's stated (or absent) competition, preserves player/kit fidelity even under pressure (see the guardrail prompts 21-24), and produces an original composition rather than recreating a specific reference artwork.
