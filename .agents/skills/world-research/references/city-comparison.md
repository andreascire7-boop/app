# City comparison methodology

## Contents
- Comparison table
- Default weights and scoring
- Verdict categories
- Sensitivity check

## Comparison table

Build a table with one row per dimension actually relevant to the user's question (don't include dimensions they didn't ask about and that don't affect the verdict), one column per city, and a source+date footnote per data point. Keep units consistent across columns (see [geographic-analysis.md](geographic-analysis.md) for city vs. metro area pitfalls).

## Default weights and scoring

If the user gave priorities, use their weights. Otherwise use these defaults and say so explicitly:

| Dimension | Default weight |
|---|---|
| Cost | 25% |
| Attractions/experience | 20% |
| Transport | 15% |
| Convenience | 10% |
| Climate | 10% |
| Food/nightlife | 10% |
| Safety | 10% |

Scoring process:
1. Score each city 0-10 on each dimension, based on the researched evidence (not vibes) — write one sentence justifying each score.
2. Multiply each score by its weight and sum for a weighted total per city.
3. State explicitly: **"This weighted score is a decision aid based on the stated priorities, not an objective ranking."**

## Verdict categories

Don't stop at a single winner — identify, when the data supports it:
- **Best overall** — highest weighted score
- **Best budget** — lowest total cost among viable options
- **Best experience** — highest score on attractions/culture regardless of cost
- **Best alternative** — closest runner-up, useful if the top pick has a hard blocker (e.g. visa issue)

## Sensitivity check

Before finalizing, check: **would a different weighting flip the result?** If cost weight were 40% instead of 25%, would the winner change? If so, say so — "City A wins under the stated priorities, but City B wins if cost matters more than experience." This is often the most useful sentence in the whole comparison.
