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
  'workflow-design/SKILL.md',
  'style-prose/SKILL.md',
  'meta-session-retro/SKILL.md',
  'docs-knowledge-base/SKILL.md',
];

const expectedDigests = {
  'workflow-commit/SKILL.md': 'de457f3e0d9d60bc4e9ee7061d8e87150020a1e492d955a05cfafac0ef5194fb',
  'workflow-commit/examples/samples.md': 'cc42b5cbeece7ea117b562af670964a4d40aadac0f7b10ceacd2c1a76a83250c',
  'workflow-verify/SKILL.md': '3b50eb730f1f5cb9001dc7cb0d34a6b1b8cae16271b812c666a60e00b578a74a',
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

test('workflow-create-pr defines the context-line-first template fallback workflow', () => {
  const content = readFileSync(
    path.join(repoRoot, 'skills', 'workflow-create-pr', 'SKILL.md'),
    'utf8',
  );

  assert.match(content, /first line.*plain context text/i);
  assert.match(content, /dedicated PR template[\s\S]*after the context line/i);
  assert.match(
    content,
    /workflow-create-pr\/pull_request_template\.md[\s\S]*after the context line/i,
  );
  assert.match(content, /Do not add extra headings beyond those required by the selected template\./);
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
