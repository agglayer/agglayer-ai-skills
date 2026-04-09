# agglayer-ai-skills

Shared AI skills for Agglayer repositories.
This package is the source of truth for the team's globally distributed skill set.

## Bundled skills

- `workflow-commit`
- `workflow-verify`
- `workflow-create-pr`
- `style-prose`
- `meta-session-retro`
- `docs-knowledge-base`

`workflow-create-pr` also bundles
`skills/workflow-create-pr/pull_request_template.md`.
Use a target repo's dedicated PR template when one exists.
Otherwise, fall back to the bundled template artifact.

## OpenCode installation

Install the package globally through OpenCode's plugin configuration.
Add it to `~/.opencode/opencode.json` alongside any existing plugins:

```json
{
  "plugin": [
    "agglayer-ai-skills@git+https://github.com/agglayer/agglayer-ai-skills.git"
  ]
}
```

OpenCode loads `.opencode/plugins/agglayer-ai-skills.js`, which appends this package's bundled `skills/` directory to the global skill search paths.

## Claude Code installation

`agglayer-ai-skills` includes the Claude plugin manifest at `.claude-plugin/plugin.json` and is structured for Claude Code marketplace distribution.
This package is intended to be consumed globally in Claude Code rather than copied into each downstream repository.
If marketplace distribution is not available in the needed environment, revise the design instead of adding a repo-local fallback.

## Updating shared skills

1. Edit or replace the skill files in `skills/`.
2. Run `npm test`.
3. Bump the version in `package.json`.
4. Publish the updated package for OpenCode and keep the Claude plugin manifest ready for marketplace distribution.

## Scope notes

- This revision does not copy skills into downstream repositories.
- Repo-local manifests are out of scope for this revision.
- This revision ships no CLI.
- Cursor integration is out of scope for this revision.
