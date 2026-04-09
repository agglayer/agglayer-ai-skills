# workflow-create-pr Template Artifact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bundle a reusable PR template artifact with `workflow-create-pr` and document a fallback rule that prefers a repo-specific PR template when one exists.

**Architecture:** Keep the change local to the `workflow-create-pr` skill package surface. Add one new artifact file under `skills/workflow-create-pr/`, update the skill text to describe the repo-template fallback rule, and extend the existing repository tests so they verify the new artifact and README coverage without introducing new tooling.

**Tech Stack:** Node.js ESM, `node:test`, `node:assert/strict`, built-in `fs`, `path`, `url`, and `crypto` modules, Markdown documentation.

---

## File Structure

- Create: `skills/workflow-create-pr/pull_request_template.md` — bundled fallback PR template copied from the `agglayer` repo.
- Modify: `skills/workflow-create-pr/SKILL.md` — documents the fallback rule: prefer a repo-specific PR template, otherwise use the bundled artifact.
- Modify: `tests/skills.test.js` — verifies the bundled template artifact exists, keeps its expected digest, and confirms `workflow-create-pr/SKILL.md` documents the fallback rule.
- Modify: `README.md` — documents the bundled `workflow-create-pr` template artifact and the fallback rule.
- Modify: `tests/readme.test.js` — verifies the README mentions the bundled artifact and that the artifact exists in the package tree.

### Task 1: Add the bundled PR template artifact and skill fallback rule

**Files:**
- Create: `skills/workflow-create-pr/pull_request_template.md`
- Modify: `skills/workflow-create-pr/SKILL.md:7-41`
- Modify: `tests/skills.test.js:1-75`

- [ ] **Step 1: Write the failing skills test**

`tests/skills.test.js`

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const thisFilePath = fileURLToPath(import.meta.url);
const FRONTMATTER_PATTERN = /^---\r?\n[\s\S]+?\r?\n---\r?\n/;
const NAME_FIELD_PATTERN = /^name:\s*.+/m;
const DESCRIPTION_FIELD_PATTERN = /^description:\s*(?:.+|>)/m;

const verbatimFiles = [
  'workflow-commit/SKILL.md',
  'workflow-commit/examples/samples.md',
  'workflow-verify/SKILL.md',
  'style-prose/SKILL.md',
  'meta-session-retro/SKILL.md',
  'docs-knowledge-base/SKILL.md',
  'workflow-create-pr/pull_request_template.md',
];

const skillFiles = [
  'workflow-commit/SKILL.md',
  'workflow-verify/SKILL.md',
  'workflow-create-pr/SKILL.md',
  'style-prose/SKILL.md',
  'meta-session-retro/SKILL.md',
  'docs-knowledge-base/SKILL.md',
];

const expectedDigests = {
  'workflow-commit/SKILL.md': 'de457f3e0d9d60bc4e9ee7061d8e87150020a1e492d955a05cfafac0ef5194fb',
  'workflow-commit/examples/samples.md': 'cc42b5cbeece7ea117b562af670964a4d40aadac0f7b10ceacd2c1a76a83250c',
  'workflow-verify/SKILL.md': '1ae657351ab8d38c16611c7b9e87c5f7688f1954757303d2be2e89578d884115',
  'style-prose/SKILL.md': '6bc2a977f52e28967340505d6acd38ad85753f3201235a4d69cb2f5fa9da7019',
  'meta-session-retro/SKILL.md': '287cc834d4794305e24aee10e47c88b1f4e2af5ce5a7a94afd0e576bd60f88dc',
  'docs-knowledge-base/SKILL.md': '3ac97b891d879d9cf5640f3c6bb90685148553f3dae4e9789af250937d85d1d9',
  'workflow-create-pr/pull_request_template.md': '31cb88864b8645502dbc02fc7910b5da7485cfa638ba81c096abacf1e445c8fe',
};

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

test('bundled copied artifacts match expected source digests', () => {
  assert.deepEqual(Object.keys(expectedDigests).sort(), [...verbatimFiles].sort());

  for (const relativePath of verbatimFiles) {
    const targetPath = path.join(repoRoot, 'skills', relativePath);

    assert.equal(existsSync(targetPath), true, `missing ${relativePath}`);
    assert.equal(
      sha256(readFileSync(targetPath, 'utf8')),
      expectedDigests[relativePath],
      `unexpected content in ${relativePath}`,
    );
  }
});

test('each bundled SKILL.md keeps YAML frontmatter with name and description', () => {
  for (const relativePath of skillFiles) {
    const content = readFileSync(path.join(repoRoot, 'skills', relativePath), 'utf8');

    assert.match(content, FRONTMATTER_PATTERN, `${relativePath} is missing frontmatter`);
    assert.match(content, NAME_FIELD_PATTERN, `${relativePath} is missing a name field`);
    assert.match(content, DESCRIPTION_FIELD_PATTERN, `${relativePath} is missing a description field`);
  }
});

test('workflow-create-pr prefers a repo template and falls back to the bundled artifact', () => {
  const content = readFileSync(
    path.join(repoRoot, 'skills', 'workflow-create-pr', 'SKILL.md'),
    'utf8',
  );

  assert.match(content, /dedicated PR template/i);
  assert.match(content, /workflow-create-pr\/pull_request_template\.md/);
  assert.match(content, /fallback/i);
});

test('skills test is hermetic and does not depend on an external checkout', () => {
  const content = readFileSync(thisFilePath, 'utf8');

  assert.doesNotMatch(content, /\/Users\/[^'"\n]+\/(?:\.agents\/skills|\.github\/pull_request_template\.md)/);
});

test('frontmatter patterns tolerate CRLF line endings', () => {
  const content = '---\r\nname: sample\r\ndescription: sample\r\n---\r\nbody\r\n';

  assert.match(content, FRONTMATTER_PATTERN);
  assert.match(content, NAME_FIELD_PATTERN);
  assert.match(content, DESCRIPTION_FIELD_PATTERN);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/skills.test.js`
Expected: FAIL because `skills/workflow-create-pr/pull_request_template.md` does not exist yet and `workflow-create-pr/SKILL.md` does not mention the fallback rule.

- [ ] **Step 3: Write the minimal implementation**

`skills/workflow-create-pr/pull_request_template.md`

```markdown
CONFIG-CHANGE: Short description of the configuration changes.
  More details can be added in the description.
  Link to configuration file example if applicable.
  Link to migration guide if applicable.
  Multiple configuration changes can be listed.

BREAKING-CHANGE: Short description of the breaking changes.
  More details can be added in the description.
  Multiple lines can be used, with **markdown** formatting if desired.
  Multiple breaking changes can be listed.
```

`skills/workflow-create-pr/SKILL.md`

```markdown
---
name: create-pr
description: Create a pull request following project conventions.
disable-model-invocation: true
---

When creating a PR:

- Use `gh pr create`
- Use the target repo's dedicated PR template when one exists.
- Otherwise, use `workflow-create-pr/pull_request_template.md`
  from this package as the fallback template.
- Follow merge-queue conventions.

## Merge-queue mapping

- **PR title** = commit title (Conventional Commits format).
- **PR description** = commit body (reusable as commit message content).
- **PR title max**: 72 characters.
- **PR description line max**: 72 characters,
  except long URLs, code blocks, or stack traces.

## Description rules

- **No headings** (no `## Summary` or similar) in the PR description.
- The **first line** must be plain context text describing the change.
- Fill `CONFIG-CHANGE:` and `BREAKING-CHANGE:` sections when applicable.
- **Remove** `CONFIG-CHANGE:` and/or `BREAKING-CHANGE:` sections entirely
  if there is no config change or breaking change respectively.
- Keep the description concise and commit-friendly.

## Steps

1. **Run the `verify` skill** if it has not been run
   since the last code change.
   All matching checks must pass before proceeding.
2. Review all commits on the branch
   (`git log` and `git diff` against the base branch).
3. Draft a PR title (Conventional Commits format, 72 chars max).
4. Draft a PR description using the target repo's dedicated PR template
   when present; otherwise start from
   `workflow-create-pr/pull_request_template.md`.
5. Ask for confirmation from the user with all this information.
6. Check if the branch needs to be pushed to remote.
7. Create the PR.
8. Return the PR URL.
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/skills.test.js`
Expected: PASS with 5 passing tests and 0 failures.

- [ ] **Step 5: Commit**

```bash
git add skills/workflow-create-pr/SKILL.md skills/workflow-create-pr/pull_request_template.md tests/skills.test.js
git commit -m "feat: add workflow-create-pr template artifact"
```

### Task 2: Document the bundled PR template artifact in the README

**Files:**
- Modify: `README.md:6-49`
- Modify: `tests/readme.test.js:1-49`

- [ ] **Step 1: Write the failing README test**

`tests/readme.test.js`

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readmePath = path.join(repoRoot, 'README.md');
const opencodePluginPath = path.join(
  repoRoot,
  '.opencode',
  'plugins',
  'agglayer-ai-skills.js',
);
const workflowCreatePrTemplatePath = path.join(
  repoRoot,
  'skills',
  'workflow-create-pr',
  'pull_request_template.md',
);
const bundledSkillDirs = [
  'workflow-commit',
  'workflow-verify',
  'workflow-create-pr',
  'style-prose',
  'meta-session-retro',
  'docs-knowledge-base',
].map((skillName) => path.join(repoRoot, 'skills', skillName));

test('README documents the global installation model', () => {
  const content = readFileSync(readmePath, 'utf8');

  assert.match(content, /^# agglayer-ai-skills/m);
  assert.match(content, /workflow-commit/);
  assert.match(content, /workflow-verify/);
  assert.match(content, /workflow-create-pr/);
  assert.match(content, /style-prose/);
  assert.match(content, /meta-session-retro/);
  assert.match(content, /docs-knowledge-base/);
  assert.match(content, /pull_request_template\.md/);
  assert.match(content, /dedicated PR template/i);
  assert.match(content, /fallback/i);
  assert.match(content, /OpenCode/);
  assert.match(content, /\.opencode\/opencode\.json/);
  assert.match(content, /Claude Code/);
  assert.match(content, /marketplace/i);
  assert.match(content, /Cursor/);
  assert.match(content, /out of scope/i);
  assert.match(content, /repo-local manifests?.*out of scope/i);
  assert.match(content, /update/i);
  assert.match(content, /no CLI/i);

  assert.equal(statSync(opencodePluginPath).isFile(), true);
  assert.equal(statSync(workflowCreatePrTemplatePath).isFile(), true);

  for (const bundledSkillDir of bundledSkillDirs) {
    assert.equal(statSync(bundledSkillDir).isDirectory(), true);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/readme.test.js`
Expected: FAIL because `README.md` does not yet mention `pull_request_template.md`, the dedicated-template preference, or the fallback rule.

- [ ] **Step 3: Write the minimal README update**

`README.md`

```markdown
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

Install `agglayer-ai-skills` through the Claude Code marketplace.
This package is intended to be consumed globally in Claude Code rather than copied into each downstream repository.
This design assumes marketplace installation is available.
If that assumption proves false, revise the design instead of adding a repo-local fallback.

## Updating shared skills

1. Edit or replace the skill files in `skills/`.
2. Run `npm test`.
3. Bump the version in `package.json`.
4. Publish the updated package through the distribution channels used by OpenCode and Claude Code.

## Scope notes

- This revision does not copy skills into downstream repositories.
- Repo-local manifests are out of scope for this revision.
- This revision ships no CLI.
- Cursor integration is out of scope for this revision.
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/readme.test.js`
Expected: PASS with 1 passing test and 0 failures.

- [ ] **Step 5: Commit**

```bash
git add README.md tests/readme.test.js
git commit -m "docs: document workflow-create-pr template fallback"
```

### Task 3: Re-run package verification with the new artifact included

**Files:**
- Verify: `skills/workflow-create-pr/SKILL.md`
- Verify: `skills/workflow-create-pr/pull_request_template.md`
- Verify: `tests/skills.test.js`
- Verify: `README.md`
- Verify: `tests/readme.test.js`

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS with 7 passing tests and 0 failures.

- [ ] **Step 2: Verify the package surface includes the bundled template artifact**

Run: `npm pack --dry-run`
Expected: output lists `skills/workflow-create-pr/pull_request_template.md` in addition to the existing packaged files.

- [ ] **Step 3: Verify removed concepts stay removed**

Run: `test ! -e bin/cli.js && test ! -e .cursor`
Expected: exit code 0 because the revised design still ships no CLI and no Cursor assets.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: verify workflow-create-pr template packaging"
```
