# Desktop Widget Architecture (MVP)

## Audit Summary
- Existing repository is primarily a Next.js web app (`src/app`, API routes, React client forms).
- The schedule widget work had drifted into Next.js client components and browser-only data loading.
- Desktop target needs Electron process boundaries and local file persistence.

## Clean separation
- `desktop/core/taskLogic.js`: reusable task logic (today filter, current/upcoming/completed split, urgency, time formatting).
- `desktop/core/taskStore.js`: local JSON file read/write under Electron `userData`.
- `desktop/main.js`: docked always-on-top Electron window + IPC handlers.
- `desktop/preload.js`: safe bridge (`window.scheduleApi`).
- `desktop/renderer/*`: minimal widget UI.

## Legacy web leftovers
- The previous Next.js dock component/files were removed.
- Next.js app remains in repo as legacy product surface but is no longer the target for this widget prototype.
