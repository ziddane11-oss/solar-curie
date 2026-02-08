'use client';

import { UniversalProfileSchema } from '@/types/profile';
import { CoverLetterSchema } from '@/types/cover-letter';

/**
 * Import/Export utilities with Zod validation.
 */

// ─── Export ─────────────────────────────────────────────────────

export function exportProfileJSON(profile, coverLetter) {
  const payload = {
    _format: 'solar-curie-profile',
    _version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    coverLetter,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `profile_${profile.personal?.name || 'unnamed'}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Import ─────────────────────────────────────────────────────

/**
 * Reads a File object, validates with Zod, returns { profile, coverLetter } or throws.
 * @param {File} file
 * @returns {Promise<{ profile: any, coverLetter: any | null }>}
 */
export async function importProfileJSON(file) {
  const text = await file.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('유효한 JSON 파일이 아닙니다.');
  }

  // Accept both wrapped format and raw profile
  let rawProfile = data.profile || data;
  let rawCoverLetter = data.coverLetter || null;

  // Validate profile
  const profileResult = UniversalProfileSchema.safeParse(rawProfile);
  if (!profileResult.success) {
    const issues = profileResult.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`프로필 데이터가 유효하지 않습니다:\n${issues}`);
  }

  // Validate cover letter if present
  let coverLetter = null;
  if (rawCoverLetter) {
    const clResult = CoverLetterSchema.safeParse(rawCoverLetter);
    if (clResult.success) {
      coverLetter = clResult.data;
    }
    // Silently skip invalid cover letter – profile is more important
  }

  return { profile: profileResult.data, coverLetter };
}

// ─── File picker helper ─────────────────────────────────────────

export function openFilePicker() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      resolve(file || null);
    };
    input.click();
  });
}
