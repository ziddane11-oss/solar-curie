import path from 'path';

export const repoRoot = process.cwd();
export const dataDir = path.join(repoRoot, 'data');
export const templatesDir = path.join(repoRoot, 'templates');
export const outputDir = path.join(repoRoot, 'output');
export const scriptsDir = path.join(repoRoot, 'scripts');

export const profilePath = path.join(dataDir, 'profile.json');
export const yearPath = path.join(dataDir, 'year.json');

export const mapPathForTemplate = (templateId) =>
  path.join(templatesDir, templateId, 'map.json');

export const templateSamplePath = (templateId, extension) =>
  path.join(templatesDir, templateId, `sample.${extension}`);
