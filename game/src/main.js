// Ember Court boots here: read the URL, build a fresh duel (or a fixed
// screenshot scene), wire the buttons and keys, and repaint after every move.

import { newGame, startDuel, playCard, endPlayerTurn } from './state.js';
import { render } from './render.js';
import { bindKeyboard } from './input.js';
import { sfx, unlockAudio, setMuted, isMuted } from './audio.js';
import { readShotParams, applyShot } from './shots.js';

const { shot, seed } = readShotParams();
let state = newGame(shot ? seed : (Date.now() % 2147483647));

function repaint() {
  render(state, handlers);
}

const handlers = {
  muted: false,
  onBegin() {
    unlockAudio();
    startDuel(state);
    sfx.turn();
    repaint();
  },
  onPlay(index) {
    if (state.phase !== 'player' || state.over) return;
    const card = state.player.hand[index];
    if (!card) return;
    if (card.cost > state.player.mana) { sfx.error(); return; }
    unlockAudio();
    if (playCard(state, 'player', index)) {
      if (card.dmg) sfx.hit();
      else if (card.heal) sfx.heal();
      else if (card.block) sfx.block();
      else sfx.play();
      if (state.screen === 'win') sfx.win();
      if (state.screen === 'loss') sfx.lose();
    }
    repaint();
  },
  onEndTurn() {
    if (!endPlayerTurn(state, repaint)) return;
    sfx.turn();
    repaint();
  },
  onRestart() {
    unlockAudio();
    state = newGame(Date.now() % 2147483647);
    repaint();
  },
  onToggleSound() {
    setMuted(!isMuted());
    handlers.muted = isMuted();
    if (!isMuted()) { unlockAudio(); sfx.play(); }
    repaint();
  },
};

if (shot) applyShot(state, shot);
bindKeyboard(() => state, handlers);
repaint();

// Exposed for the headless play-test: lets a script drive the table and
// read the state back without touching the DOM.
window.__emberCourt = {
  get state() { return state; },
  play: (i) => handlers.onPlay(i),
  endTurn: () => handlers.onEndTurn(),
  begin: () => handlers.onBegin(),
  restart: () => handlers.onRestart(),
};
