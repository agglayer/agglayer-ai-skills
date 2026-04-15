import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pluginDir = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(pluginDir, '../../skills');
const skillMdPath = path.join(
  skillsDir,
  'using-agglayer-skills',
  'SKILL.md',
);

const FRONTMATTER_RE = /^---\r?\n[\s\S]+?\r?\n---\r?\n/;
const CATALOG_DELIMITER = '<!-- CATALOG_START -->';
const SUPERPOWERS_MARKER = 'EXTREMELY_IMPORTANT';
const AGGLAYER_MARKER = 'AGGLAYER_SKILLS';

function loadBootstrapSections() {
  let raw;
  try {
    raw = readFileSync(skillMdPath, 'utf8');
  } catch {
    return null;
  }
  const stripped = raw.replace(FRONTMATTER_RE, '');
  const idx = stripped.indexOf(CATALOG_DELIMITER);
  if (idx === -1) return { full: stripped, catalog: stripped };
  const discipline = stripped.slice(0, idx).trim();
  const catalog = stripped.slice(idx + CATALOG_DELIMITER.length).trim();
  return {
    full: `${discipline}\n\n${catalog}`,
    catalog,
  };
}

const sections = loadBootstrapSections();

export const AgglayerAiSkillsPlugin = async () => ({
  async config(config) {
    config.skills ??= {};
    config.skills.paths ??= [];

    if (!config.skills.paths.includes(skillsDir)) {
      config.skills.paths.push(skillsDir);
    }
  },

  async 'experimental.chat.messages.transform'(_input, output) {
    if (!sections || !output.messages.length) return;

    const firstUser = output.messages.find((m) => m.info.role === 'user');
    if (!firstUser || !firstUser.parts.length) return;

    // Idempotency: skip if already injected
    if (firstUser.parts.some(
      (p) => p.type === 'text' && p.text.includes(AGGLAYER_MARKER),
    )) {
      return;
    }

    const ref = firstUser.parts[0];

    // Check if superpowers bootstrap is present
    const superpowersIdx = firstUser.parts.findIndex(
      (p) => p.type === 'text' && p.text.includes(SUPERPOWERS_MARKER),
    );

    if (superpowersIdx >= 0) {
      // Complement mode: inject catalog only, after superpowers block
      const block = `<${AGGLAYER_MARKER}>\n${sections.catalog}\n</${AGGLAYER_MARKER}>`;
      firstUser.parts.splice(superpowersIdx + 1, 0, {
        ...ref,
        type: 'text',
        text: block,
      });
    } else {
      // Standalone mode: inject full bootstrap
      const block =
        `<EXTREMELY_IMPORTANT ${AGGLAYER_MARKER}>\n${sections.full}\n</EXTREMELY_IMPORTANT>`;
      firstUser.parts.unshift({ ...ref, type: 'text', text: block });
    }
  },
});
