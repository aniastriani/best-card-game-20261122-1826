// Ember Court hands itself in. This program runs on Node 22 with only the
// standard library: it copies the playable game and its screenshots from
// beside this file into the output directory the grader gives it, then
// writes the dossier the judge reads, built by the vendored make.fun helper.
//
// The game itself is plain static files under game/ (index.html plus ES
// modules, no library, no network request) and the screenshots are real
// renders of that code. Run it outside the grader like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// And play the game locally with `node serve.ts`, then open
// http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps below mirror the scorer's own gates, so an entry this program
// accepts is one the scorer accepts: at most 4 screenshots and none over
// 256 KiB; at most 993 files under game/ totalling 48 MiB, no path over
// 1000 bytes; the dossier's text budget is 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
