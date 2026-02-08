'use client';

/**
 * LocalStorage persistence layer with multi-profile support.
 * Keys are versioned: app:v1:profiles, app:v1:coverLetter, app:v1:activeProfileId
 */

const STORAGE_PREFIX = 'app:v1';
const PROFILES_KEY = `${STORAGE_PREFIX}:profiles`;
const COVER_LETTER_KEY = `${STORAGE_PREFIX}:coverLetter`;
const ACTIVE_PROFILE_KEY = `${STORAGE_PREFIX}:activeProfileId`;

// ─── Helpers ────────────────────────────────────────────────────
function readJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Profiles CRUD ──────────────────────────────────────────────

/** Get all saved profile entries */
export function getAllProfiles() {
  return readJSON(PROFILES_KEY, []);
}

/** Get active profile ID */
export function getActiveProfileId() {
  return readJSON(ACTIVE_PROFILE_KEY, null);
}

/** Set active profile ID */
export function setActiveProfileId(id) {
  writeJSON(ACTIVE_PROFILE_KEY, id);
}

/** Load the active profile, or the first one, or null */
export function loadActiveProfile(emptyProfile) {
  const profiles = getAllProfiles();
  const activeId = getActiveProfileId();

  if (profiles.length === 0) {
    // Create default profile
    const entry = {
      id: generateId(),
      name: '기본 프로필',
      updatedAt: new Date().toISOString(),
      profile: emptyProfile,
    };
    writeJSON(PROFILES_KEY, [entry]);
    setActiveProfileId(entry.id);
    return entry;
  }

  const active = profiles.find((p) => p.id === activeId);
  if (active) return active;

  // Fallback to first
  setActiveProfileId(profiles[0].id);
  return profiles[0];
}

/** Save (update) a profile entry by id */
export function saveProfile(id, profile, name) {
  const profiles = getAllProfiles();
  const idx = profiles.findIndex((p) => p.id === id);
  const entry = {
    id,
    name: name || (idx >= 0 ? profiles[idx].name : '프로필'),
    updatedAt: new Date().toISOString(),
    profile,
  };

  if (idx >= 0) {
    profiles[idx] = entry;
  } else {
    profiles.push(entry);
  }

  writeJSON(PROFILES_KEY, profiles);
  return entry;
}

/** Create a new profile (Save As) */
export function createProfile(name, profile) {
  const id = generateId();
  const entry = {
    id,
    name,
    updatedAt: new Date().toISOString(),
    profile,
  };
  const profiles = getAllProfiles();
  profiles.push(entry);
  writeJSON(PROFILES_KEY, profiles);
  setActiveProfileId(id);
  return entry;
}

/** Rename a profile */
export function renameProfile(id, newName) {
  const profiles = getAllProfiles();
  const entry = profiles.find((p) => p.id === id);
  if (entry) {
    entry.name = newName;
    entry.updatedAt = new Date().toISOString();
    writeJSON(PROFILES_KEY, profiles);
  }
  return entry;
}

/** Duplicate a profile */
export function duplicateProfile(id) {
  const profiles = getAllProfiles();
  const source = profiles.find((p) => p.id === id);
  if (!source) return null;

  const newEntry = {
    id: generateId(),
    name: `${source.name} (복사)`,
    updatedAt: new Date().toISOString(),
    profile: JSON.parse(JSON.stringify(source.profile)),
  };
  profiles.push(newEntry);
  writeJSON(PROFILES_KEY, profiles);
  return newEntry;
}

/** Delete a profile */
export function deleteProfile(id) {
  let profiles = getAllProfiles();
  profiles = profiles.filter((p) => p.id !== id);
  writeJSON(PROFILES_KEY, profiles);

  // If we deleted the active one, switch to first
  if (getActiveProfileId() === id) {
    setActiveProfileId(profiles.length > 0 ? profiles[0].id : null);
  }
  return profiles;
}

// ─── Cover Letter ───────────────────────────────────────────────

export function loadCoverLetter(emptyCoverLetter) {
  return readJSON(COVER_LETTER_KEY, emptyCoverLetter);
}

export function saveCoverLetter(coverLetter) {
  writeJSON(COVER_LETTER_KEY, coverLetter);
}

// ─── Reset All ──────────────────────────────────────────────────

export function resetAllData() {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith(STORAGE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}

// ─── Debounced Auto-save ────────────────────────────────────────

let _saveTimer = null;

export function debouncedSave(fn, delay = 500) {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(fn, delay);
}
