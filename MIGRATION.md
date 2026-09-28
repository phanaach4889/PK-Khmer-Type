# React + Vite migration

## Architecture preserved

The original browser-global application contains the validated keyboard, typing, lessons, adaptive, race, statistics, settings, tracker, and progress engines. Curriculum remains JSON in `data/curriculum/**`, with `data/curriculum-data.js` retained as its offline cache.

Phase 9 behavior is preserved at `public/legacy.html` with its original script order and copied `public/js`, `public/data`, and `public/css` assets.

## React boundary

Vite is the supported entry point (`index.html`, `src/main.jsx`) and React owns the application root. `src/components/app/LegacyApplication.jsx` is a same-origin compatibility host for the proven interface while feature UIs are moved in slices. This protects physical keyboard event handling, Khmer composition, race, lessons, settings, and statistics.

Existing storage schemas are unchanged: `khmerProgress_v2`, tracker data, and `pk_adaptive_state_v1` stay on the same origin; the `standard`, `nida`, and `english` courses remain isolated. `src/storage/` supplies React-side helpers with the same schema names.

## First React extraction foundations

- `src/logic/keyboard/keyState.js` holds framework-independent modifier/layer helpers.
- `src/storage/` isolates direct localStorage access for future React panels.
- `src/index.css` initializes Tailwind and contains only the compatibility-host styles.

## Next slices

Move the layout selector and data-driven keyboard, then lesson controls/list, followed by adaptive, race, statistics, and settings. Remove a legacy DOM slice only after its interaction tests pass.

## Verify

Run `npm install`, `npm run dev`, exercise all layouts and feature flows, then run `npm run validate`.

### Toolchain compatibility

Vite configuration lives in `vite.config.mjs`, while the repository keeps a
CommonJS default for its existing curriculum and browser-diagnostic scripts.
This prevents the Vite migration from breaking `scripts/validate_curriculum.js`
or the legacy syntax verifier. `npm run validate` runs both preserved checks and
the production build.

### Opening the project directly

`index.html` detects `file://` and opens the preserved offline application at
`public/legacy.html`. Use `npm run dev` for the React/Vite application; both
entry points use the same local curriculum and storage keys.
