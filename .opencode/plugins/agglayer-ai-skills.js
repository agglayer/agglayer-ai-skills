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
