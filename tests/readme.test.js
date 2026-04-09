import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readmePath = path.join(repoRoot, 'README.md');
const packageJsonPath = path.join(repoRoot, 'package.json');
const opencodePluginPath = path.join(
  repoRoot,
  '.opencode',
  'plugins',
  'agglayer-ai-skills.js',
);
const claudePluginManifestPath = path.join(
  repoRoot,
  '.claude-plugin',
  'plugin.json',
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
  const normalizedContent = content.replace(/\s+/g, ' ').trim();
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const claudePluginManifest = JSON.parse(
    readFileSync(claudePluginManifestPath, 'utf8'),
  );

  assert.match(content, /^# agglayer-ai-skills/m);
  assert.match(content, /workflow-commit/);
  assert.match(content, /workflow-verify/);
  assert.match(content, /workflow-create-pr/);
  assert.match(content, /style-prose/);
  assert.match(content, /meta-session-retro/);
  assert.match(content, /docs-knowledge-base/);
  assert.match(
    normalizedContent,
    /`workflow-create-pr` also bundles `skills\/workflow-create-pr\/pull_request_template\.md`\. Use a target repo's dedicated PR template when one exists\. Otherwise, fall back to the bundled template artifact\./i,
  );
  assert.match(content, /OpenCode/);
  assert.match(content, /\.opencode\/opencode\.json/);
  assert.match(content, /Claude Code/);
  assert.match(content, /\.claude-plugin\/plugin\.json/);
  assert.match(content, /plugin manifest/i);
  assert.match(content, /structured for Claude Code marketplace distribution/i);
  assert.match(
    normalizedContent,
    /Publish the updated package for OpenCode and keep the Claude plugin manifest ready for marketplace distribution\./i,
  );
  assert.doesNotMatch(
    normalizedContent,
    /(?:install|get|available|published|ship(?:ped|s)?)(?:[^.]{0,80})Claude Code marketplace/i,
  );
  assert.doesNotMatch(
    normalizedContent,
    /Claude Code marketplace(?:[^.]{0,80})(?:install|available now|live|today|currently)/i,
  );
  assert.match(content, /Cursor/);
  assert.match(content, /out of scope/i);
  assert.match(content, /repo-local manifests?.*out of scope/i);
  assert.match(content, /update/i);
  assert.match(content, /no CLI/i);
  assert.ok(Array.isArray(packageJson.files));
  assert.ok(packageJson.files.includes('.claude-plugin/'));
  assert.ok(packageJson.files.includes('.opencode/plugins/'));
  assert.ok(packageJson.files.includes('skills/'));
  assert.ok(packageJson.files.includes('README.md'));
  assert.equal(claudePluginManifest.name, packageJson.name);
  assert.equal(claudePluginManifest.version, packageJson.version);
  assert.match(claudePluginManifest.description, /Shared Agglayer skills/i);
  assert.equal(claudePluginManifest.author?.name, 'Agglayer');

  assert.equal(statSync(opencodePluginPath).isFile(), true);
  assert.equal(statSync(claudePluginManifestPath).isFile(), true);
  assert.equal(statSync(workflowCreatePrTemplatePath).isFile(), true);

  for (const bundledSkillDir of bundledSkillDirs) {
    assert.equal(statSync(bundledSkillDir).isDirectory(), true);
  }
});
