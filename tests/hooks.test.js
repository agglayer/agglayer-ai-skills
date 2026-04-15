import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

test('hooks.json is valid JSON with correct structure', () => {
  const content = readFileSync(
    path.join(repoRoot, 'hooks/hooks.json'),
    'utf8',
  );
  const parsed = JSON.parse(content);
  assert.ok(parsed.hooks, 'should have a hooks key');
  assert.ok(
    Array.isArray(parsed.hooks.SessionStart),
    'should have a SessionStart array',
  );
  assert.ok(
    parsed.hooks.SessionStart.length > 0,
    'SessionStart should have at least one entry',
  );
});

test('session-start script exists and is executable', () => {
  const scriptPath = path.join(repoRoot, 'hooks/session-start');
  assert.ok(existsSync(scriptPath), 'hooks/session-start should exist');
  const stat = statSync(scriptPath);
  const isExecutable = (stat.mode & 0o111) !== 0;
  assert.ok(isExecutable, 'hooks/session-start should be executable');
});

test('session-start produces valid JSON for Claude Code', () => {
  const output = execSync('bash hooks/session-start', {
    cwd: repoRoot,
    env: {
      ...process.env,
      CLAUDE_PLUGIN_ROOT: repoRoot,
    },
    encoding: 'utf8',
    timeout: 5000,
  });

  const parsed = JSON.parse(output);
  assert.ok(
    parsed.hookSpecificOutput,
    'should have hookSpecificOutput',
  );
  assert.ok(
    typeof parsed.hookSpecificOutput.additionalContext === 'string',
    'additionalContext should be a string',
  );
  assert.ok(
    parsed.hookSpecificOutput.additionalContext.includes(
      'EXTREMELY_IMPORTANT',
    ),
    'should include EXTREMELY_IMPORTANT wrapper',
  );
});

test('session-start output includes discipline and catalog', () => {
  const output = execSync('bash hooks/session-start', {
    cwd: repoRoot,
    env: {
      ...process.env,
      CLAUDE_PLUGIN_ROOT: repoRoot,
    },
    encoding: 'utf8',
    timeout: 5000,
  });

  const parsed = JSON.parse(output);
  const context = parsed.hookSpecificOutput.additionalContext;
  assert.ok(
    context.includes('Invoke relevant skills BEFORE'),
    'should include discipline section',
  );
  assert.ok(
    context.includes('available_skills'),
    'should include catalog section',
  );
});

test('run-hook.cmd exists', () => {
  assert.ok(
    existsSync(path.join(repoRoot, 'hooks/run-hook.cmd')),
    'hooks/run-hook.cmd should exist',
  );
});
