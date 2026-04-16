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

// --- Message transform tests ---

function makeOutput(parts) {
  return {
    messages: [
      {
        info: { role: 'user' },
        parts: parts.map((text) => ({ type: 'text', text })),
      },
    ],
  };
}

test('transform injects full bootstrap in standalone mode', async () => {
  const { AgglayerAiSkillsPlugin } = await import(pluginModuleUrl);
  const plugin = await AgglayerAiSkillsPlugin({
    client: {},
    directory: repoRoot,
  });
  const transform = plugin['experimental.chat.messages.transform'];
  assert.ok(transform, 'transform hook should be defined');

  const output = makeOutput(['Hello, help me with something']);
  await transform({}, output);

  const texts = output.messages[0].parts.map((p) => p.text);
  const injected = texts.find((t) => t.includes('AGGLAYER_SKILLS_BOOTSTRAP'));
  assert.ok(injected, 'should inject AGGLAYER_SKILLS_BOOTSTRAP in standalone mode');
  assert.ok(
    !injected.includes('<EXTREMELY_IMPORTANT'),
    'standalone mode should NOT use EXTREMELY_IMPORTANT tag (avoids collision with superpowers)',
  );
  assert.ok(
    injected.includes('available_skills'),
    'should include the skill catalog',
  );
  assert.ok(
    injected.includes('Invoke relevant skills BEFORE'),
    'should include discipline section in standalone mode',
  );
});

test('transform injects catalog only in complement mode', async () => {
  const { AgglayerAiSkillsPlugin } = await import(pluginModuleUrl);
  const plugin = await AgglayerAiSkillsPlugin({
    client: {},
    directory: repoRoot,
  });
  const transform = plugin['experimental.chat.messages.transform'];

  const superpowersBootstrap =
    '<EXTREMELY_IMPORTANT>superpowers bootstrap</EXTREMELY_IMPORTANT>';
  const output = makeOutput([
    superpowersBootstrap,
    'Hello, help me with something',
  ]);
  await transform({}, output);

  const texts = output.messages[0].parts.map((p) => p.text);
  const agglayerPart = texts.find((t) => t.includes('AGGLAYER_SKILLS_BOOTSTRAP'));
  assert.ok(agglayerPart, 'should inject AGGLAYER_SKILLS_BOOTSTRAP in complement mode');
  assert.ok(
    agglayerPart.includes('available_skills'),
    'should include skill catalog',
  );
  assert.ok(
    !agglayerPart.includes('Invoke relevant skills BEFORE'),
    'should NOT include discipline section in complement mode',
  );

  // Verify ordering: agglayer block appears after superpowers block
  const superpowersIdx = texts.findIndex((t) =>
    t.includes('EXTREMELY_IMPORTANT'),
  );
  const agglayerIdx = texts.findIndex((t) => t.includes('AGGLAYER_SKILLS_BOOTSTRAP'));
  assert.ok(
    agglayerIdx > superpowersIdx,
    'agglayer catalog should appear after superpowers bootstrap',
  );
});

test('transform is idempotent', async () => {
  const { AgglayerAiSkillsPlugin } = await import(pluginModuleUrl);
  const plugin = await AgglayerAiSkillsPlugin({
    client: {},
    directory: repoRoot,
  });
  const transform = plugin['experimental.chat.messages.transform'];

  const output = makeOutput(['Hello']);
  await transform({}, output);
  const countAfterFirst = output.messages[0].parts.length;
  await transform({}, output);
  const countAfterSecond = output.messages[0].parts.length;

  assert.equal(
    countAfterFirst,
    countAfterSecond,
    'running transform twice should not add more parts',
  );
});

test('transform handles empty messages gracefully', async () => {
  const { AgglayerAiSkillsPlugin } = await import(pluginModuleUrl);
  const plugin = await AgglayerAiSkillsPlugin({
    client: {},
    directory: repoRoot,
  });
  const transform = plugin['experimental.chat.messages.transform'];

  const empty = { messages: [] };
  await transform({}, empty);
  assert.deepEqual(empty.messages, []);

  const noUser = {
    messages: [{ info: { role: 'assistant' }, parts: [{ type: 'text', text: 'hi' }] }],
  };
  await transform({}, noUser);
  assert.equal(noUser.messages.length, 1);
});
