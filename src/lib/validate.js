import path from 'path';

export const allowedExtensions = ['.hwp', '.hwpx'];

export const isAllowedTemplateFile = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
};

export const sanitizeTemplateId = (templateId) =>
  templateId.replace(/[^a-zA-Z0-9_-]/g, '');
