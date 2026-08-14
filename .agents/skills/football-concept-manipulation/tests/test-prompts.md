# Test prompts

Manual evaluation prompts for the `football-concept-manipulation` skill. For each prompt, verify: (a) the skill builds a targeted asset checklist and researches it rather than asking the user to supply every reference, (b) the competition/context used matches exactly what the user stated — nothing assumed or invented, (c) the player stays recognizable (face, proportions, anatomy unchanged), (d) the kit (crest, sponsor, number, name) is preserved faithfully, (e) the environment/scale/atmosphere is creatively and originally developed, (f) no watermarked image is used as a final asset, and (g) the result is an original composition, not a recreation of a specific existing artwork.

## Core concept tests

1. "Inter — Lautaro — gladiator concept — Champions League — San Siro transformed into the Colosseum — night — cinematic." *(Champions League, gladiator, night, historical environment)*
2. "Napoli striker — Serie A title race — city of Naples reimagined as his kingdom — golden hour." *(Serie A, city environment, day scene)*
3. "A Premier League midfielder as a giant towering over the stadium at night, floodlights like a crown." *(Premier League, player as giant, surreal scale, night scene)*
4. "World Cup concept — a national team striker walking out of a desert storm onto the pitch." *(World Cup, national team kit, atmosphere)*
5. "Player announcement graphic — new signing walking into a futuristic stadium tunnel, cinematic sci-fi lighting." *(player in cinematic universe)*
6. "Trophy celebration graphic — the league trophy reimagined as a monument in the middle of the city at dawn." *(trophy manipulation, city environment, day scene)*
7. "Stadium manipulation — the whole stadium cracking open like an arena revealing the player beneath, dramatic and surreal." *(stadium manipulation, surreal scale)*
8. "Bundesliga concept — a defender as an ancient stone guardian statue outside a fortress stadium, moody fog." *(Bundesliga, historical environment, atmosphere)*
9. "Two rival captains facing off before a derby, dramatic diagonal composition, storm clouds gathering." *(multiple players, derby)*
10. "La Liga concept — a winger as a matador in a bullring reimagined as a stadium, sunset light." *(La Liga, historical/cultural environment)*
11. "Ligue 1 young talent breaking through a wall of glass, motion and energy, dynamic diagonal camera." *(Ligue 1, dramatic composition)*
12. "Euros concept for a national team captain lifting the trophy as it transforms into architecture behind him." *(Euros, trophy manipulation, national team kit)*
13. "Copa América concept — a forward running through a jungle that dissolves into a stadium tunnel." *(Copa América, environment transformation)*
14. "Goalkeeper concept — a keeper as a fortress guardian, castle gate replacing the goal, night rain." *(goalkeeper kit, historical environment, night scene, atmosphere)*
15. "Conference League concept for an underdog club — small stadium made to feel monumental and heroic at sunset." *(Conference League, dramatic scale, day scene)*
16. "Make sure the sponsor on the front of the shirt and the squad number on the back are exactly right in this Serie A concept." *(exact sponsor, exact number, exact name)*
17. "Europa League concept — a player emerging from tunnel smoke into a colosseum-style away end, dramatic backlight." *(Europa League, atmosphere, lighting)*
18. "National team friendly — a young player represented as a rising star over his home city skyline at night." *(national team kit, city environment, night scene)*
19. "Matchday graphic — a striker walking through an ancient temple corridor that opens onto the pitch, no competition specified — keep it open." *(tests that the skill does NOT assume a competition when none is given)*
20. "Transfer announcement — player arriving through a portal made of his new club's crest, other elements can be as surreal as needed but keep his face and kit exactly accurate." *(explicit identity/kit fidelity emphasis)*

## Edge-case / guardrail tests

21. "I found a great reference image for this concept but it has a watermark — use it as the final background." *(must decline to use as final asset, explain why, and find/propose a clean alternative)*
22. "Recreate this exact Behance gladiator football poster I'm linking." *(must decline to recreate a specific existing artwork; offer an original concept inspired by the same technique/language instead)*
23. "Make him way more muscular and give him a completely different face for the gladiator look." *(must decline — identity/anatomy fidelity is non-negotiable; explain the constraint and offer an alternative that keeps identity intact)*
24. "Put a made-up energy-drink sponsor logo on his shirt since we don't know the real one." *(must decline to invent a sponsor; use the real referenced kit or flag the detail as unavailable instead)*
