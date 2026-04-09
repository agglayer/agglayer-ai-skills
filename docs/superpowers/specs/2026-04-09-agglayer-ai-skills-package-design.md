# agglayer-ai-skills Package Design

## Goal

Create a shared `agglayer-ai-skills` npm package that publishes six
team-wide skills for global consumption in OpenCode and Claude Code.
The package is a source-of-truth distribution artifact, not a
downstream-repository installer.

## Scope

This revised design covers:

- `package.json`
- `.gitignore`
- `.opencode/plugins/agglayer-ai-skills.js`
- `skills/**`
- `README.md`

This design explicitly supersedes the current `TASK.md` and the external
plan at
`/Users/spaitrault/work/polygon/2026-04-09-agglayer-ai-skills-plugin.md`
for this work.
The previous CLI-based downstream-copy workflow is intentionally removed
from scope.

## Architecture

The package stays intentionally small.
`package.json` defines an ESM package with one OpenCode plugin entry and
no runtime dependencies.
There is no CLI in this revised design.

The OpenCode integration remains a tiny plugin file.
`.opencode/plugins/agglayer-ai-skills.js` appends this package's
`skills/` directory to OpenCode's configured skill search paths.

The `skills/` directory is the source of truth for shared skill content
within this repository.
Those skills are copied verbatim from
`/Users/spaitrault/work/polygon/agglayer/.agents/skills/`, including
nested files such as `workflow-commit/examples/samples.md`.
No content changes are introduced during this task.

`README.md` documents global installation and update workflows rather
than repo-local setup.

## Distribution Model

OpenCode support is package-native through the plugin entry and depends
on global plugin installation.
Once installed, OpenCode discovers the package's `skills/` directory
through the config hook without copying files into downstream
repositories.

Claude Code support is also treated as global distribution.
This revised design assumes Claude Code consumes the package through its
marketplace-style installation path instead of repo-local copied skill
files.
If that assumption proves false during implementation, the design will
need to be revisited rather than silently falling back to repo-local
copying.

Cursor is explicitly out of scope for this package revision.
Because the package is no longer responsible for downstream repo assets,
it does not generate `.cursor/rules/*.mdc` files.

## Removed Concepts

The following concepts from the prior plan are intentionally removed:

- `bin/cli.js`
- `setup`, `update`, and `check` commands
- `.agents/.ai-skills-manifest.json`
- copying skills into downstream `.agents/skills/`
- `.claude/skills` symlink management
- any expectation that downstream repos commit installed skill files

These are incompatible with the approved global-only distribution model.

## Content Rules

The six managed skills are:

- `workflow-commit`
- `workflow-verify`
- `workflow-create-pr`
- `style-prose`
- `meta-session-retro`
- `docs-knowledge-base`

Each copied `SKILL.md` must preserve its original frontmatter exactly.
Verification for copied skill content is structural rather than
transformative: the files must exist, frontmatter delimiters must remain
present, and the expected metadata must still be readable.

## Documentation Requirements

`README.md` should cover:

- what the package provides
- the six bundled skills
- OpenCode global plugin installation
- Claude Code marketplace installation
- how the package is updated when shared skills change
- the fact that Cursor and downstream repo copying are out of scope in
  this revision

## Verification Strategy

Verification should focus on package structure and integration readiness:

- required files exist
- the OpenCode plugin exports the config hook
- the six copied skills are present under `skills/`
- copied `SKILL.md` files preserve their frontmatter
- documentation matches the revised global-only distribution model

The old acceptance check `node bin/cli.js` is obsolete in this revised
design because the CLI has been removed from scope.

## Out Of Scope

- Any CLI implementation
- Any downstream repository installer behavior
- Cursor integration
- Repo-local manifests or copied managed assets
- Commit creation and pushing changes
- Generalizing agglayer-specific skill content
