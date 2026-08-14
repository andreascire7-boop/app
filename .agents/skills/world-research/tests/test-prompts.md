# Test prompts

Manual evaluation prompts for the `world-research` skill. For each "should trigger" prompt, verify: the skill activates, Claude searches rather than answering from memory, figures are labeled VERIFIED/ESTIMATE/UNVERIFIED with sources+dates, and units (currency, geographic, cost-per-X) are consistent. For "should NOT trigger" prompts, verify Claude answers directly without invoking the skill.

## Should trigger

**City comparison**
1. "Which is cheaper, Budapest or Warsaw?"
2. "Compare Lisbon and Porto for a remote worker on a budget."
3. "Is Bangkok or Chiang Mai better for a 3-month stay?"

**Country comparison**
4. "Portugal vs. Spain — where would I get better value for retirement?"
5. "Compare cost of living between Vietnam and Thailand."

**Travel planning**
6. "Plan a 5-day trip to Tokyo for 2 people on a $2000 total budget."
7. "What would a week in Iceland cost for a family of 4 in July?"
8. "Find me the cheapest way to get from Berlin to Prague next weekend."

**Relocation**
9. "I'm a software engineer thinking of relocating from the US to Berlin — what should I know?"
10. "What visa would I need to work remotely from Bali as an Australian citizen?"

**Cost of living**
11. "How much does a 1-bedroom apartment cost in central Amsterdam right now?"
12. "Is Zurich really the most expensive city in Europe?"

**Airport / transport**
13. "My flight lands in Manila at 2am — how do I get to Makati at that hour?"
14. "What's the best way from Charles de Gaulle to central Paris?"
15. "How far is Beauvais airport actually from Paris, and how long does the transfer take?"

**Climate**
16. "What's the best time of year to visit Kyoto?"
17. "How hot does Seville get in August?"

**Safety**
18. "Is it safe to walk around Naples at night?"
19. "What are common tourist scams in Barcelona right now?"

**Demographics / current events / prices**
20. "What's the current population of Ho Chi Minh City?"
21. "Are there any current travel advisories for Ecuador?"
22. "What's a fair current price for a taxi from JFK to Manhattan?"

## Should NOT trigger (answer directly, no search needed)

23. "What is the capital of France?"
24. "What is latitude?"
25. "What is a peninsula?"
26. "What's the difference between weather and climate, conceptually?"
27. "How many continents are there?"
