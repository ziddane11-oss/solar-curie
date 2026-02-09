/**
 * TemplateMapper interface implementation for teacher application forms.
 * Follows the TemplateMapper interface from types/template.ts.
 */

import { getValue, applyTransform, buildDataContext } from './mapping';

/**
 * Create a TemplateMapper from a map.json definition.
 * @param {import('@/types/template').TemplateMap} mapDef
 * @returns {import('@/types/template').TemplateMapper}
 */
export function createMapper(mapDef) {
  return {
    id: mapDef.template_id,
    name: mapDef.template_name,
    supportedPacks: mapDef.supported_packs || ['teacher'],

    /**
     * Build a flat key→value map for template filling.
     */
    map(profile, coverLetter) {
      const context = buildDataContext(profile, coverLetter);
      const result = {};

      for (const rule of mapDef.rules) {
        const raw = getValue(context, rule.value_path);
        const value = raw != null && raw !== ''
          ? (rule.transform ? applyTransform(String(raw), rule.transform) : String(raw))
          : (rule.fallback || '');

        if (rule.find) result[rule.find] = value;
        if (rule.field) result[rule.field] = value;
      }

      return result;
    },

    /**
     * Return list of missing required fields.
     */
    validate(profile, coverLetter) {
      const context = buildDataContext(profile, coverLetter);
      const missing = [];

      for (const req of mapDef.required_fields) {
        if (!req.required) continue;
        const val = getValue(context, req.value_path);
        if (val == null || val === '') {
          missing.push({ field: req.value_path, label: req.label });
        }
      }

      return missing;
    },
  };
}

