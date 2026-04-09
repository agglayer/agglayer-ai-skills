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

  for (const bundledSkillDir of bundledSkillDirs) {
    assert.equal(statSync(bundledSkillDir).isDirectory(), true);
  }
});
