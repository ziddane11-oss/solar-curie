/**
 * Field Mapping Engine
 *
 * Resolves template mapping rules against profile + cover letter data.
 * Each template defines rules with value_path references into the data.
 *
 * value_path examples:
 *   "personal.name"              → profile.personal.name
 *   "career[0].institution"      → profile.career[0].institution
 *   "cover_letter.self_intro"    → cover letter section by id
 *   "computed.career_summary"    → computed/derived field
 */

/**
 * Resolve a dot-notation path with optional array indexing.
 * e.g. "career[0].institution"
 */
export function getValue(data, valuePath) {
  if (!valuePath || !data) return '';

  const parts = valuePath.replace(/]/g, '').split('.');
  let current = data;

  for (const part of parts) {
    if (current == null) return '';

    if (part.includes('[')) {
      const [key, indexStr] = part.split('[');
      const arr = current[key];
      if (!Array.isArray(arr)) return '';
      const idx = parseInt(indexStr, 10);
      current = idx < arr.length ? arr[idx] : undefined;
    } else {
      if (typeof current === 'object') {
        current = current[part];
      } else {
        return '';
      }
    }
  }

  return current ?? '';
}

/**
 * Apply a transform to a resolved value.
 */
export function applyTransform(value, transform) {
  if (!transform || transform === 'none') return String(value);

  const str = String(value);

  switch (transform) {
    case 'date_kr': {
      const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) return `${match[1]}년 ${match[2]}월 ${match[3]}일`;
      return str;
    }
    case 'phone_format': {
      const digits = str.replace(/\D/g, '');
      if (digits.length === 11) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
      }
      return str;
    }
    case 'period_calc': {
      if (typeof value === 'object' && value.start_date && value.end_date) {
        const start = new Date(value.start_date);
        const end = new Date(value.end_date);
        const months = (end.getFullYear() - start.getFullYear()) * 12
          + (end.getMonth() - start.getMonth());
        return `${Math.max(0, months)}개월`;
      }
      return str;
    }
    default:
      return str;
  }
}

/**
 * Build a merged data context from profile + cover letter.
 */
export function buildDataContext(profile, coverLetter) {
  const ctx = { ...profile };

  if (coverLetter?.sections) {
    ctx.cover_letter = {};
    for (const section of coverLetter.sections) {
      ctx.cover_letter[section.id] = section.body;
    }
  }

  return ctx;
}

/**
 * Execute all mapping rules and return a report.
 */
export function executeMapping(templateMap, profile, coverLetter) {
  const ctx = buildDataContext(profile, coverLetter);
  const results = [];

  for (const rule of templateMap.rules || []) {
    const raw = getValue(ctx, rule.value_path);
    let resolved;
    let status;

    if (raw === '' || raw === undefined || raw === null) {
      resolved = rule.fallback ?? '';
      status = rule.fallback ? 'fallback' : 'missing';
    } else {
      resolved = applyTransform(raw, rule.transform);
      status = 'ok';
    }

    results.push({ rule, resolved_value: resolved, status });
  }

  return {
    template_id: templateMap.template_id,
    total: results.length,
    resolved: results.filter((r) => r.status === 'ok').length,
    missing: results.filter((r) => r.status === 'missing').length,
    results,
  };
}

/**
 * Check which required fields are missing.
 */
export function checkRequiredFields(templateMap, profile, coverLetter) {
  const ctx = buildDataContext(profile, coverLetter);
  const missing = [];

  for (const req of templateMap.required_fields || []) {
    const val = getValue(ctx, req.value_path);
    if (!val || (typeof val === 'string' && !val.trim())) {
      missing.push({ value_path: req.value_path, label: req.label });
    }
  }

  return missing;
}
