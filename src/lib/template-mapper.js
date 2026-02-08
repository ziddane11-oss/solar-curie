/**
 * TemplateMapper interface implementation for teacher application forms.
 * Follows the TemplateMapper interface from types/template.ts.
 */

import { getValue, applyTransform } from './mapping';

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
      const context = buildContext(profile, coverLetter);
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
      const context = buildContext(profile, coverLetter);
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

/**
 * Merge profile + coverLetter into a single context object for getValue.
 */
function buildContext(profile, coverLetter) {
  const ctx = { ...profile };

  // Flatten teacher_pack fields to top level for backward compat
  if (profile.teacher_pack) {
    ctx.teacher_cert = profile.teacher_pack.teacher_cert;
    ctx.nice_pool = profile.teacher_pack.nice_pool;
    ctx.school_target = profile.teacher_pack.school_target;
    if (!ctx.other_certs?.length) {
      ctx.other_certs = profile.teacher_pack.other_certs;
    }
  }

  // Map cover letter sections to cover_letter.<id>
  if (coverLetter?.sections) {
    ctx.cover_letter = {};
    for (const section of coverLetter.sections) {
      ctx.cover_letter[section.id] = section.body;
    }
  }

  // Sort career by start_date descending and compute total_months
  if (ctx.career?.length) {
    ctx.career = ctx.career
      .map((c) => ({
        ...c,
        total_months: c.total_months || computeMonths(c.start_date, c.end_date),
      }))
      .sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''));
  }

  return ctx;
}

/**
 * Compute months between two date strings.
 */
function computeMonths(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s) || isNaN(e)) return 0;
  return Math.max(0, (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()));
}
