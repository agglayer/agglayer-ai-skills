# agglayer-ai-skills Global Distribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-dependency ESM package that ships six shared Agglayer skills, exposes an OpenCode plugin, and documents global installation for OpenCode and Claude Code without any downstream repo installer workflow.

**Architecture:** The package consists of package metadata, a tiny OpenCode plugin entry point, the verbatim copied `skills/` tree, and a README that explains the global distribution model. Verification uses only Node built-ins, with tests that validate the plugin hook, the copied skill contents, and the README coverage. Claude Code marketplace support is treated as a documented packaging/distribution assumption, not as an in-repo integration surface.

**Tech Stack:** Node.js ESM, `node:test`, `node:assert/strict`, built-in `fs`, `path`, and `url` modules, Markdown documentation.

---

## File Structure

- Create: `package.json` — package metadata, publish surface, and the built-in test script.
- Create: `.gitignore` — minimal ignored files for local dependency installs.
- Create: `.opencode/plugins/agglayer-ai-skills.js` — OpenCode plugin config hook that appends the bundled `skills/` directory once.
- Create: `tests/plugin.test.js` — verifies the plugin exposes `AgglayerAiSkillsPlugin` and appends the expected skill path without duplication.
- Create: `tests/skills.test.js` — verifies each managed skill file exists, matches the source repo byte-for-byte, and keeps YAML frontmatter.
- Create: `tests/readme.test.js` — verifies the README covers the required installation and scope notes.
- Create: `skills/workflow-commit/SKILL.md` — copied verbatim from the `agglayer` repo.
- Create: `skills/workflow-commit/examples/samples.md` — copied verbatim from the `agglayer` repo.
- Create: `skills/workflow-verify/SKILL.md` — copied verbatim from the `agglayer` repo.
- Create: `skills/workflow-create-pr/SKILL.md` — copied verbatim from the `agglayer` repo.
- Create: `skills/style-prose/SKILL.md` — copied verbatim from the `agglayer` repo.
- Create: `skills/meta-session-retro/SKILL.md` — copied verbatim from the `agglayer` repo.
- Create: `skills/docs-knowledge-base/SKILL.md` — copied verbatim from the `agglayer` repo.
- Create: `README.md` — documents the package, bundled skills, OpenCode install, Claude Code marketplace install, and update workflow.

### Task 1: Create the package skeleton and OpenCode plugin

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.opencode/plugins/agglayer-ai-skills.js`
- Test: `tests/plugin.test.js`

- [ ] **Step 1: Write the failing plugin test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pluginModuleUrl = pathToFileURL(
  path.join(repoRoot, '.opencode/plugins/agglayer-ai-skills.js'),
).href;

test('AgglayerAiSkillsPlugin appends the bundled skills path once', async () => {
  const { AgglayerAiSkillsPlugin } = await import(pluginModuleUrl);
  const plugin = await AgglayerAiSkillsPlugin({ client: {}, directory: repoRoot });
  const config = { skills: { paths: [] } };

  await plugin.config(config);
  assert.deepEqual(config.skills.paths, [path.join(repoRoot, 'skills')]);

  await plugin.config(config);
  assert.deepEqual(config.skills.paths, [path.join(repoRoot, 'skills')]);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/plugin.test.js`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` because `.opencode/plugins/agglayer-ai-skills.js` does not exist yet.

- [ ] **Step 3: Write the minimal package metadata and plugin implementation**

`package.json`

```json
{
  "name": "agglayer-ai-skills",
  "version": "0.1.0",
  "type": "module",
  "main": ".opencode/plugins/agglayer-ai-skills.js",
  "files": [
    ".opencode/",
    "skills/",
    "README.md"
  ],
  "scripts": {
    "test": "node --test"
  }
}
```

`.gitignore`

```text
node_modules/
```

`.opencode/plugins/agglayer-ai-skills.js`

```javascript
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginDir = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(pluginDir, '../../skills');

export const AgglayerAiSkillsPlugin = async () => ({
  async config(config) {
    config.skills ??= {};
    config.skills.paths ??= [];

    if (!config.skills.paths.includes(skillsDir)) {
      config.skills.paths.push(skillsDir);
    }
  },
});
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/plugin.test.js`
Expected: PASS with one passing test.

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore .opencode/plugins/agglayer-ai-skills.js tests/plugin.test.js
git commit -m "feat: add OpenCode plugin package skeleton"
```

### Task 2: Copy the shared skills verbatim and prove they match the source repo

**Files:**
- Create: `skills/workflow-commit/SKILL.md`
- Create: `skills/workflow-commit/examples/samples.md`
- Create: `skills/workflow-verify/SKILL.md`
- Create: `skills/workflow-create-pr/SKILL.md`
- Create: `skills/style-prose/SKILL.md`
- Create: `skills/meta-session-retro/SKILL.md`
- Create: `skills/docs-knowledge-base/SKILL.md`
- Test: `tests/skills.test.js`

- [ ] **Step 1: Write the failing skills test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = '/Users/spaitrault/work/polygon/agglayer/.agents/skills';

const managedFiles = [
  'workflow-commit/SKILL.md',
  'workflow-commit/examples/samples.md',
  'workflow-verify/SKILL.md',
  'workflow-create-pr/SKILL.md',
  'style-prose/SKILL.md',
  'meta-session-retro/SKILL.md',
  'docs-knowledge-base/SKILL.md',
];

test('bundled skills are copied verbatim from agglayer', () => {
  for (const relativePath of managedFiles) {
    const targetPath = path.join(repoRoot, 'skills', relativePath);
    const sourcePath = path.join(sourceRoot, relativePath);

    assert.equal(existsSync(targetPath), true, `missing ${relativePath}`);
    assert.equal(
      readFileSync(targetPath, 'utf8'),
      readFileSync(sourcePath, 'utf8'),
      `unexpected content in ${relativePath}`,
    );
  }
});

test('each bundled SKILL.md keeps YAML frontmatter with name and description', () => {
  for (const relativePath of managedFiles.filter((file) => file.endsWith('SKILL.md'))) {
    const content = readFileSync(path.join(repoRoot, 'skills', relativePath), 'utf8');

    assert.match(content, /^---\n[\s\S]+?\n---\n/, `${relativePath} is missing frontmatter`);
    assert.match(content, /\nname:\s*.+/m, `${relativePath} is missing a name field`);
    assert.match(content, /\ndescription:\s*(?:.+|>)/m, `${relativePath} is missing a description field`);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/skills.test.js`
Expected: FAIL with `missing workflow-commit/SKILL.md` because the `skills/` tree has not been copied yet.

- [ ] **Step 3: Copy the managed skills verbatim from the source repo**

Run:

```bash
mkdir -p skills
cp -R "/Users/spaitrault/work/polygon/agglayer/.agents/skills/workflow-commit" "skills/workflow-commit"
cp -R "/Users/spaitrault/work/polygon/agglayer/.agents/skills/workflow-verify" "skills/workflow-verify"
cp -R "/Users/spaitrault/work/polygon/agglayer/.agents/skills/workflow-create-pr" "skills/workflow-create-pr"
cp -R "/Users/spaitrault/work/polygon/agglayer/.agents/skills/style-prose" "skills/style-prose"
cp -R "/Users/spaitrault/work/polygon/agglayer/.agents/skills/meta-session-retro" "skills/meta-session-retro"
cp -R "/Users/spaitrault/work/polygon/agglayer/.agents/skills/docs-knowledge-base" "skills/docs-knowledge-base"
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/skills.test.js`
Expected: PASS with two passing tests.

- [ ] **Step 5: Commit**

```bash
git add skills tests/skills.test.js
git commit -m "feat: bundle shared agglayer skills"
```

### Task 3: Document the global installation and update workflow

**Files:**
- Create: `README.md`
- Test: `tests/readme.test.js`

- [ ] **Step 1: Write the failing README test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readmePath = path.join(repoRoot, 'README.md');

test('README documents the global installation model', () => {
  const content = readFileSync(readmePath, 'utf8');

  assert.match(content, /^# agglayer-ai-skills/m);
  assert.match(content, /workflow-commit/);
  assert.match(content, /workflow-verify/);
  assert.match(content, /workflow-create-pr/);
  assert.match(content, /style-prose/);
  assert.match(content, /meta-session-retro/);
  assert.match(content, /docs-knowledge-base/);
  assert.match(content, /OpenCode/);
  assert.match(content, /\.opencode\/opencode\.json/);
  assert.match(content, /Claude Code/);
  assert.match(content, /marketplace/i);
  assert.match(content, /Cursor/);
  assert.match(content, /out of scope/i);
  assert.match(content, /update/i);
  assert.match(content, /no CLI/i);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/readme.test.js`
Expected: FAIL with `ENOENT` because `README.md` does not exist yet.

- [ ] **Step 3: Write the minimal README**

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
- This revision ships no CLI.
- Cursor integration is out of scope for this revision.
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/readme.test.js`
Expected: PASS with one passing test.

- [ ] **Step 5: Commit**

```bash
git add README.md tests/readme.test.js
git commit -m "docs: add global installation guide"
```

### Task 4: Run the full verification suite and confirm the publish surface

**Files:**
- Verify: `package.json`
- Verify: `.opencode/plugins/agglayer-ai-skills.js`
- Verify: `skills/**`
- Verify: `README.md`
- Verify: `tests/plugin.test.js`
- Verify: `tests/skills.test.js`
- Verify: `tests/readme.test.js`

- [ ] **Step 1: Run the full automated test suite**

Run: `npm test`
Expected: PASS with four passing tests across `tests/plugin.test.js`, `tests/skills.test.js`, and `tests/readme.test.js`.

- [ ] **Step 2: Verify the package publish surface**

Run: `npm pack --dry-run`
Expected: output lists `package.json`, `README.md`, `.opencode/plugins/agglayer-ai-skills.js`, and the bundled `skills/` files.

- [ ] **Step 3: Verify removed concepts stay removed**

Run:

```bash
test ! -e bin/cli.js
test ! -e .cursor
```

Expected: both commands exit successfully because the revised design does not ship a CLI or Cursor assets.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: publish global shared skills package"
```
