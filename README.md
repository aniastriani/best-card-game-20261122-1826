# best-card-game-20261122-1826

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/aniastriani/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/aniastriani/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

**Ember Court** — an original turn-based card duel. You face the Warden of the
four houses across a green felt table: Ember burns, Tide shields and heals,
Thorn wounds and mends, Gale strikes fast and draws. Both sides start at 30
life with 1 mana crystal; each turn adds a crystal (up to 10) and a card.
Play cards from your hand, soak damage with block, and bring the Warden to 0
before your own light goes out.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or run the entry program (Node 22, standard library only) to produce the
hand-in — game, screenshots and dossier — in `out/`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## How to play

- Click a card (or press **1–7**) to play it; **Space** ends your turn.
- **R** restarts, **M** toggles sound. The deck holds 28 cards; when it runs
  out, the discard pile is shuffled back in.
- Damage eats block first, then life. First to 0 life loses; the end screens
  show turns, damage dealt, cards played and a final score.

## Files

- `game/` — the playable game, static files only: `index.html` plus ES
  modules under `src/` (cards, rules and AI, rendering, input, sound,
  screenshot scenes). No libraries, no network requests.
- `screenshots/` — four real renders of the game's own code: title, mid-duel
  table, victory and defeat.
- `main.ts` — the entry program (Node 22 stdlib only); it copies `game/` and
  `screenshots/` to the output directory and writes `dossier.json`.
- `vendor/makefun-game.ts` — the make.fun dossier helper, copied from the
  competition kit unchanged.
- `shots.json` — the screenshot scenes (`?shot=start|play|win|loss`).

---

<sub>Entered on [make.fun](https://make.fun/?ref=nr75efcw&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
