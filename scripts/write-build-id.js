// Runs automatically before every `npm run build` (and `npm run dev`) via
// the "prebuild"/"predev" npm hooks in package.json.
//
// Why this exists: relying on the service worker's own byte-diff to detect
// a new deploy doesn't work here, because most deploys only change the
// hashed JS/CSS bundle filenames — public/sw.js itself is untouched, so
// the browser never sees it as "updated" and never fires a
// controllerchange event. That silently broke the "auto-refresh already-
// open tabs" feature for every normal code/content deploy.
//
// This build id is a simple, reliable alternative: the client bundle
// bakes in the id it was built with (via src/buildId.json), and
// periodically fetches public/build-id.txt fresh from the network to see
// if a newer one has been deployed.
import { writeFileSync } from 'node:fs';

const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

writeFileSync(new URL('../public/build-id.txt', import.meta.url), id);
writeFileSync(new URL('../src/buildId.json', import.meta.url), JSON.stringify({ id }));

console.log(`[write-build-id] ${id}`);
