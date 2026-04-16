---
name: using-agglayer-skills
description: >
  Bootstrap meta-skill that teaches agents about agglayer skills.
  Injected automatically at session start by the plugin.
  Do not invoke manually.
disable-model-invocation: true
user-invocable: false
---

# Using Agglayer Skills

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task,
skip this skill.
</SUBAGENT-STOP>

## Instruction Priority

Agglayer skills override default system prompt behavior,
but **user instructions always take precedence**:

1. **User's explicit instructions**
   (CLAUDE.md, AGENTS.md, direct requests) -- highest priority
2. **Agglayer skills** -- override default system behavior
   where they conflict
3. **Default system prompt** -- lowest priority

## The Rule

**Invoke relevant skills BEFORE any response or action.**
Even a 1% chance a skill applies means you should invoke it.
If an invoked skill turns out to be wrong, you don't need to use it.

## Red Flags

These thoughts mean STOP -- you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** (brainstorming, debugging)
   -- these determine HOW to approach the task
2. **Implementation skills second** (design, docs)
   -- these guide execution

## Platform Adaptation

Skills use Claude Code tool names as canonical vocabulary.
For OpenCode, substitute equivalents:

- `TodoWrite` -> `todowrite`
- `Task` tool with subagents -> Use OpenCode's subagent system
- `Skill` tool -> OpenCode's native `skill` tool
- `Read`, `Write`, `Edit`, `Bash` -> Your native tools

Use OpenCode's native `skill` tool to list and load skills.

<!-- CATALOG_START -->

## Available Skills

<available_skills>
  <skill>
    <name>commit</name>
    <description>Create a git commit following project conventions.</description>
  </skill>
  <skill>
    <name>create-pr</name>
    <description>Create a pull request following project conventions.</description>
  </skill>
  <skill>
    <name>design</name>
    <description>Required alongside brainstorming for all design work
in this repository. Overrides spec and plan output paths to
docs/knowledge-base/src/ai-agents/ instead of the superpowers defaults.
Load this skill whenever you load brainstorming.</description>
  </skill>
  <skill>
    <name>docs-knowledge-base</name>
    <description>Create or update docs/knowledge-base/ chapters
in mdbook format for human-first technical documentation.</description>
  </skill>
  <skill>
    <name>session-retro</name>
    <description>Review the current conversation and propose structured
improvements to skills, documentation, and agent rules.</description>
  </skill>
  <skill>
    <name>style-prose</name>
    <description>Text formatting conventions for markdown and prose files.
Use when writing or editing any .md, .txt, .adoc, or .rst file,
including AGENTS.md, SKILL.md files, and documentation
in docs/.</description>
  </skill>
  <skill>
    <name>verify</name>
    <description>**Mandatory** before any commit or push. Run
Definition-of-Done checks from change scope and report exact
pass/fail per command.</description>
  </skill>
</available_skills>
