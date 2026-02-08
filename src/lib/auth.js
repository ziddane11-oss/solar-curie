'use client';

/**
 * Auth provider stub + feature flag scaffolding.
 * ENABLE_CLOUD_SYNC is false for MVP – all data stays in LocalStorage.
 */

export const ENABLE_CLOUD_SYNC = false;

// Stub auth context values
const defaultAuthState = {
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
};

/**
 * Returns the current auth state (always logged-out for MVP).
 */
export function useAuth() {
  return defaultAuthState;
}

/**
 * Check if a feature is enabled.
 * @param {'cloud_sync' | 'ai_assist'} feature
 */
export function isFeatureEnabled(feature) {
  const flags = {
    cloud_sync: ENABLE_CLOUD_SYNC,
    ai_assist: false,
  };
  return flags[feature] ?? false;
}
