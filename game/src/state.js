// The rules of Ember Court: a turn-based duel against the Warden.
// Both sides start at 30 life with 1 mana crystal; each new turn adds one
// crystal (up to 10) and draws one card. A card costs mana and does what its
// face says: damage first eats the target's block, then life. Block stays
// until it is spent. The first side at 0 life loses.
//
// This module owns the state and the rules only; rendering lives in render.js
// and the AI's choices live here too, as one small scoring function.

import { buildDeck, describe } from './cards.js';
import { makeRng, shuffle } from './random.js';

export const MAX_LIFE = 30;
export const MAX_MANA = 10;
export const MAX_HAND = 7;
export const START_HAND = 4;

export function newSide(rng) {
  return {
    life: MAX_LIFE,
    maxLife: MAX_LIFE,
    mana: 0,
    maxMana: 0,
    block: 0,
    deck: shuffle(buildDeck(), rng),
    hand: [],
    discard: [],
  };
}

export function newGame(seed) {
  const rng = makeRng(seed);
  const state = {
    seed,
    rng,
    screen: 'title', // title | play | win | loss
    turn: 0,
    phase: 'player', // player | ai | over
    player: newSide(rng),
    ai: newSide(rng),
    log: [],
    stats: { damageDealt: 0, damageTaken: 0, cardsPlayed: 0, healed: 0, blocked: 0 },
    lastPlay: null, // {by, card, text} shown in the middle of the table
    busy: false, // true while the AI is taking its turn
    over: false,
  };
  return state;
}

export function log(state, text) {
  state.log.push(text);
  if (state.log.length > 40) state.log.shift();
}

export function drawCards(side, n) {
  for (let i = 0; i < n; i++) {
    if (side.deck.length === 0) {
      if (side.discard.length === 0) return;
      side.deck = shuffle(side.discard.splice(0), Math.random);
    }
    if (side.hand.length >= MAX_HAND) return;
    side.hand.push(side.deck.pop());
  }
}

export function startDuel(state) {
  state.screen = 'play';
  state.turn = 1;
  state.phase = 'player';
  drawCards(state.player, START_HAND);
  drawCards(state.ai, START_HAND);
  state.player.maxMana = 1;
  state.player.mana = 1;
  state.ai.maxMana = 1;
  state.ai.mana = 1;
  log(state, 'The duel begins. You hold the first turn — 1 mana crystal.');
  log(state, 'Play a card, then End Turn. First to 0 life loses.');
}

function dealDamage(state, target, amount, source) {
  let remaining = amount;
  if (target.block > 0) {
    const absorbed = Math.min(target.block, remaining);
    target.block -= absorbed;
    remaining -= absorbed;
    state.stats.blocked += absorbed;
  }
  if (remaining > 0) {
    target.life = Math.max(0, target.life - remaining);
    if (source === 'player') state.stats.damageDealt += remaining;
    else state.stats.damageTaken += remaining;
  }
  return remaining;
}

// Play one card from a side's hand. Returns true when it was played.
export function playCard(state, sideName, handIndex) {
  const side = state[sideName];
  const foe = state[sideName === 'player' ? 'ai' : 'player'];
  const card = side.hand[handIndex];
  if (!card || side.mana < card.cost || state.over || state.phase !== (sideName === 'player' ? 'player' : 'ai')) {
    return false;
  }
  side.hand.splice(handIndex, 1);
  side.mana -= card.cost;
  side.discard.push(card);
  state.stats.cardsPlayed += 1;
  const who = sideName === 'player' ? 'You' : 'The Warden';
  if (card.dmg) {
    const through = dealDamage(state, foe, card.dmg, sideName);
    state.lastPlay = { by: who, card, text: `${who} played ${card.name} — ${card.dmg} damage${through < card.dmg ? ` (${card.dmg - through} blocked)` : ''}.` };
  } else {
    state.lastPlay = { by: who, card, text: `${who} played ${card.name} — ${describe(card)}.` };
  }
  if (card.block) side.block += card.block;
  if (card.heal) {
    side.life = Math.min(side.maxLife, side.life + card.heal);
    state.stats.healed += card.heal;
  }
  if (card.draw) drawCards(side, card.draw);
  log(state, state.lastPlay.text);
  checkEnd(state);
  return true;
}

export function checkEnd(state) {
  if (state.over) return;
  if (state.ai.life <= 0) {
    state.over = true;
    state.phase = 'over';
    state.screen = 'win';
    log(state, 'The Warden falls. The Court is yours.');
  } else if (state.player.life <= 0) {
    state.over = true;
    state.phase = 'over';
    state.screen = 'loss';
    log(state, 'Your light goes out. The Warden keeps the Court.');
  }
}

// Score shown on the end screens: life left matters most, then speed.
export function finalScore(state) {
  return state.player.life * 100 + Math.max(0, 40 - state.turn) * 10 + state.stats.damageDealt;
}

// The Warden's turn: keep playing its best affordable card until it cannot.
export function aiTakeTurn(state, onStep) {
  const ai = state.ai;
  ai.maxMana = Math.min(MAX_MANA, ai.maxMana + 1);
  ai.mana = ai.maxMana;
  drawCards(ai, 1);
  log(state, `— Turn ${state.turn}: the Warden's move (${ai.mana} mana) —`);

  const step = () => {
    if (state.over) return finish();
    let best = -1;
    let bestScore = 0;
    ai.hand.forEach((card, i) => {
      if (card.cost > ai.mana) return;
      let score = card.dmg * 1.2 + card.draw * 0.9;
      if (card.block) score += ai.life <= 16 ? card.block * 1.1 : card.block * 0.4;
      if (card.heal) score += ai.life <= 22 ? card.heal * 1.2 : card.heal * 0.3;
      if (score > bestScore) { bestScore = score; best = i; }
    });
    if (best === -1) return finish();
    playCard(state, 'ai', best);
    onStep();
    if (!state.over) setTimeout(step, 650);
    else finish();
  };

  const finish = () => {
    if (state.over) return;
    state.turn += 1;
    state.phase = 'player';
    const p = state.player;
    p.maxMana = Math.min(MAX_MANA, p.maxMana + 1);
    p.mana = p.maxMana;
    drawCards(p, 1);
    state.busy = false;
    log(state, `— Turn ${state.turn}: your move (${p.mana} mana, drew a card) —`);
    onStep();
  };

  setTimeout(step, 650);
}

export function endPlayerTurn(state, onStep) {
  if (state.phase !== 'player' || state.busy || state.over) return false;
  state.busy = true;
  state.phase = 'ai';
  log(state, 'You end your turn.');
  aiTakeTurn(state, onStep);
  return true;
}
