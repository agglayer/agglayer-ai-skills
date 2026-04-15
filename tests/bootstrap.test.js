import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const skillMdPath = path.join(
  repoRoot,
  'skills/using-agglayer-skills/SKILL.md',
);
const skillsDir = path.join(repoRoot, 'skills');

const FRONTMATTER_PATTERN = /^---\r?\n[\s\S]+?\r?\n---\r?\n/;
const CATALOG_DELIMITER = '<!-- CATALOG_START -->';

function getSkillMdContent() {
  return readFileSync(skillMdPath, 'utf8');
}

function splitSections(content) {
  const stripped = content.replace(FRONTMATTER_PATTERN, '');
  const idx = stripped.indexOf(CATALOG_DELIMITER);
  if (idx === -1) return { discipline: stripped, catalog: '' };
  return {
    discipline: stripped.slice(0, idx),
    catalog: stripped.slice(idx + CATALOG_DELIMITER.length),
  };
}

test('SKILL.md has valid YAML frontmatter', () => {
  const content = getSkillMdContent();
  assert.match(content, FRONTMATTER_PATTERN);
  assert.match(content, /^name:\s*using-agglayer-skills/m);
  assert.match(content, /^description:/m);
});

test('SKILL.md contains the CATALOG_START delimiter', () => {
  const content = getSkillMdContent();
  assert.ok(
    content.includes(CATALOG_DELIMITER),
    'missing <!-- CATALOG_START --> delimiter',
  );
});

test('discipline section contains key elements', () => {
  const { discipline } = splitSections(getSkillMdContent());
  assert.match(discipline, /Invoke relevant skills BEFORE/i);
  assert.match(discipline, /Red Flags/i);
  assert.match(discipline, /Instruction Priority/i);
  assert.match(discipline, /Skill Priority/i);
  assert.match(discipline, /SUBAGENT-STOP/i);
});

test('catalog lists all user-facing bundled skills', () => {
  const { catalog } = splitSections(getSkillMdContent());

  const skipDirs = new Set(['using-agglayer-skills']);
  const expectedSkills = readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !skipDirs.has(d.name))
    .map((d) => {
      const fm = readFileSync(
        path.join(skillsDir, d.name, 'SKILL.md'),
        'utf8',
      );
      const nameMatch = fm.match(/^name:\s*(.+)/m);
      return nameMatch ? nameMatch[1].trim() : d.name;
    })
    .sort();

  for (const skillName of expectedSkills) {
    assert.ok(
      catalog.includes(`<name>${skillName}</name>`),
      `catalog is missing skill: ${skillName}`,
    );
  }
});
