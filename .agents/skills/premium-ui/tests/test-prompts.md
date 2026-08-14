# Test prompts

Manual evaluation prompts for the `premium-ui` skill. For "should trigger" prompts, verify: Claude works through the design process (goal → hierarchy → design system → layout → implementation) rather than jumping straight to markup, checks the anti-generic-design audit before finishing, covers relevant states, and (for implementation tasks) inspects the existing codebase before changing it. For "should NOT trigger" prompts, verify Claude just makes the requested change directly, without invoking the full design process.

## Should trigger

**Dashboard / SaaS**
1. "Design an analytics dashboard for a SaaS product showing revenue, active users, and churn."
2. "Build an admin panel for managing users, roles, and permissions."
3. "Our dashboard just shows a grid of cards with numbers — make it feel more purposeful."

**Mobile UI**
4. "Design a mobile onboarding flow for a fitness app."
5. "Redesign our mobile settings screen — it feels cluttered."

**Landing pages**
6. "Create a landing page for an AI writing assistant startup."
7. "Our landing page looks generic and AI-generated — help me fix that."

**Onboarding / auth**
8. "Design a signup and email verification flow for a B2B SaaS product."
9. "Build a multi-step onboarding wizard that collects company info and preferences."

**Forms**
10. "Design a checkout form with shipping, billing, and payment steps."
11. "Improve our contact form — right now it's just stacked inputs with no hierarchy."

**Data visualization**
12. "Add a revenue-over-time chart to the dashboard with a comparison to last period."
13. "Design a way to show portfolio performance with multiple asset classes."

**Responsive design**
14. "Make sure this dashboard works well on mobile, not just shrunk desktop."
15. "Design a data table that needs to work on both desktop and phone."

**Accessibility**
16. "Review this settings page for accessibility issues."
17. "Make sure our modal is fully keyboard-accessible."

**Design critique**
18. "Critique this landing page screenshot and tell me what's wrong with it."
19. "Review our app's UI and rank the issues by severity."

**Redesign**
20. "Redesign our profile page — it feels dated."

**React/Tailwind implementation**
21. "Implement a StatCard component using our existing shadcn/Tailwind setup."
22. "Build a responsive sidebar navigation in React using our current design tokens."

**Existing application improvement**
23. "Our app's UI is inconsistent across pages — help clean it up without breaking anything."

**AI interface**
24. "Design the UI for an AI chat product, including loading/streaming and error states."

**Premium visual design**
25. "Make our pricing page feel more premium and less generic."

## Should NOT trigger the full design process (just make the change)

26. "Change this button's color from blue-500 to blue-600."
27. "Fix the typo in the hero headline — it says 'recieve' instead of 'receive'."
28. "The API is returning a 500 error on the /users endpoint, can you fix it?"
29. "Add a database index to speed up this query."
30. "This onClick handler isn't firing — debug why."
