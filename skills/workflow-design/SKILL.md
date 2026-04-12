---
name: design
description: >
  Recommend superpowers brainstorming and writing-plans skills
  for design work, with specs and plans in docs/knowledge-base.
user-invocable: false
---

When designing a feature or planning implementation work,
use the superpowers `brainstorming` skill to explore intent
and produce a spec,
then use the `writing-plans` skill to turn the spec
into an implementation plan.

## Output location

Write specs and plans under `docs/knowledge-base/src/ai-agents/`
instead of the superpowers default (`docs/superpowers/`):

- **Specs** →
  `docs/knowledge-base/src/ai-agents/specs/YYYY-MM-DD-<topic>-design.md`
- **Plans** →
  `docs/knowledge-base/src/ai-agents/plans/YYYY-MM-DD-<topic>-plan.md`

These paths override the brainstorming and writing-plans defaults.
Create the directories if they do not exist.
