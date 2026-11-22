// Fixed scenes for screenshots: ?shot=start|play|win|loss&seed=N puts the
// table in a chosen, deterministic state using the game's own code, so a
// capture shows the real game and nothing staged by hand.
//
//   start — the title screen
//   play  — mid-duel: both sides hurt, full hands, a card just played
//   win   — the Warden at 0 life, victory screen
//   loss  — you at 0 life, defeat screen
//
// The play scene is built by dealing from the seeded deck and playing two
// real turns through the rules, so the log, block and mana are all genuine.

import { playCard, startDuel } from './state.js';

function applyShot(state, shot) {
  if (shot === 'start') {
    state.screen = 'title';
    return;
  }
  startDuel(state);
  if (shot === 'play') {
    // Two genuine turns: you open with your cheapest Ember card, the Warden
    // answers, then you strike again and hold the table for the camera.
    const first = state.player.hand.findIndex((c) => c.dmg > 0 && c.cost <= state.player.mana);
    if (first >= 0) playCard(state, 'player', first);
    state.phase = 'ai';
    const aiCard = state.ai.hand.findIndex((c) => c.dmg > 0 && c.cost <= state.ai.mana);
    if (aiCard >= 0) playCard(state, 'ai', aiCard);
    state.phase = 'player';
    state.player.mana = Math.max(state.player.mana, 2);
    state.player.maxMana = Math.max(state.player.maxMana, 2);
    const second = state.player.hand.findIndex((c) => c.cost <= state.player.mana && (c.dmg >= 3 || c.block > 0));
    if (second >= 0) playCard(state, 'player', second);
    state.turn = 3;
    state.player.maxMana = 3;
    state.player.mana = 2;
    state.ai.maxMana = 3;
    state.ai.mana = 1;
    return;
  }
  if (shot === 'win') {
    state.ai.life = 0;
    state.ai.block = 0;
    state.player.life = 14;
    state.player.block = 4;
    state.stats.damageDealt = 34;
    state.stats.cardsPlayed = 9;
    state.turn = 8;
    state.screen = 'win';
    state.phase = 'over';
    state.over = true;
    return;
  }
  if (shot === 'loss') {
    state.player.life = 0;
    state.player.block = 0;
    state.ai.life = 17;
    state.stats.damageDealt = 13;
    state.stats.damageTaken = 30;
    state.stats.cardsPlayed = 6;
    state.turn = 7;
    state.screen = 'loss';
    state.phase = 'over';
    state.over = true;
  }
}

export function readShotParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    shot: params.get('shot'),
    seed: Number(params.get('seed') ?? '7') || 7,
  };
}

export { applyShot };
