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
