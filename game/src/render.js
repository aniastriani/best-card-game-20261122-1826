// The table: Ember Court is drawn as DOM, not canvas, so every card's value
// stays crisp text a screenshot can read. render() rebuilds the table from
// the state after each move; overlays (title, win, loss) are shown or hidden
// by the screen field.

import { HOUSES } from './cards.js';
import { finalScore, MAX_LIFE, MAX_MANA } from './state.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function manaGems(parent, mana, maxMana) {
  const wrap = el('div', 'gems');
  for (let i = 0; i < MAX_MANA; i++) {
    const gem = el('div', 'gem' + (i < mana ? ' on' : '') + (i >= maxMana ? ' locked' : ''));
    wrap.appendChild(gem);
  }
  return wrap;
}

function lifeBar(side, label) {
  const wrap = el('div', 'life-wrap');
  const name = el('span', 'side-name', label);
  const bar = el('div', 'life-bar');
  const fill = el('div', 'life-fill');
  fill.style.width = `${Math.round((side.life / side.maxLife) * 100)}%`;
  bar.appendChild(fill);
  const num = el('span', 'life-num', `${side.life} / ${side.maxLife}`);
  if (side.block > 0) {
    const block = el('span', 'block-badge', `BLOCK ${side.block}`);
    wrap.append(name, bar, num, block);
  } else {
    wrap.append(name, bar, num);
  }
  return wrap;
}

function cardNode(card, index, playable, onPlay) {
  const house = HOUSES[card.house];
  const node = el('button', 'card' + (playable ? '' : ' dim'));
  node.style.setProperty('--house', house.color);
  node.style.setProperty('--house-light', house.light);
  node.dataset.index = index;
  node.setAttribute('aria-label', `${card.name}, cost ${card.cost}, ${card.text}`);
  const cost = el('span', 'cost', String(card.cost));
  const houseTag = el('span', 'house-tag', house.name.toUpperCase());
  const glyph = el('div', 'glyph', house.glyph);
  const name = el('div', 'card-name', card.name);
  const text = el('div', 'card-text', card.text);
  const value = el('div', 'card-value');
  if (card.dmg) value.textContent = `ATK ${card.dmg}`;
  else if (card.block) value.textContent = `BLK ${card.block}`;
  else if (card.heal) value.textContent = `HEAL ${card.heal}`;
  else value.textContent = `DRAW ${card.draw}`;
  node.append(cost, houseTag, glyph, name, text, value);
  node.addEventListener('click', () => onPlay(index));
  return node;
}

function cardBackNode() {
  const node = el('div', 'card-back');
  node.appendChild(el('div', 'back-glyph', 'E'));
  return node;
}

export function render(state, handlers) {
  const app = document.getElementById('app');
  app.innerHTML = '';

  // --- header ---
  const header = el('header', 'topbar');
  header.appendChild(el('div', 'brand', 'EMBER COURT'));
  const turn = el('div', 'turn-badge', state.screen === 'play' ? `Turn ${state.turn} — ${state.phase === 'player' ? 'Your move' : 'The Warden thinks…'}` : 'Duel of the Four Houses');
  header.appendChild(turn);
  const btns = el('div', 'top-btns');
  const soundBtn = el('button', 'mini-btn', handlers.muted ? 'Sound: off' : 'Sound: on');
  soundBtn.addEventListener('click', handlers.onToggleSound);
  const restartBtn = el('button', 'mini-btn', 'Restart');
  restartBtn.addEventListener('click', handlers.onRestart);
  btns.append(soundBtn, restartBtn);
  header.appendChild(btns);
  app.appendChild(header);

  // --- opponent row ---
  const opp = el('section', 'side-row opponent');
  const avatar = el('div', 'avatar', 'W');
  const oppInfo = el('div', 'side-info');
  oppInfo.appendChild(lifeBar(state.ai, 'THE WARDEN'));
  oppInfo.appendChild(manaGems(null, state.ai.mana, state.ai.maxMana));
  const oppHand = el('div', 'opp-hand');
  state.ai.hand.forEach(() => oppHand.appendChild(cardBackNode()));
  const oppCount = el('div', 'hand-count', `${state.ai.hand.length} cards in hand · ${state.ai.deck.length} left in deck`);
  opp.append(avatar, oppInfo, oppHand, oppCount);
  app.appendChild(opp);

  // --- middle: last play + log ---
  const mid = el('section', 'mid-row');
  const playArea = el('div', 'play-area');
  if (state.lastPlay) {
    const banner = el('div', 'last-play');
    banner.appendChild(el('div', 'last-play-who', state.lastPlay.by.toUpperCase()));
    banner.appendChild(el('div', 'last-play-text', state.lastPlay.text));
    playArea.appendChild(banner);
  } else {
    playArea.appendChild(el('div', 'last-play idle', 'No card played yet — play one from your hand.'));
  }
  const hint = el('div', 'hint', 'Click a card or press 1–7 to play it · Space ends your turn · R restarts · M mutes');
  playArea.appendChild(hint);
  const logBox = el('div', 'log');
  logBox.appendChild(el('div', 'log-title', 'DUEL LOG'));
  state.log.slice(-9).forEach((line) => logBox.appendChild(el('div', 'log-line', line)));
  logBox.scrollTop = logBox.scrollHeight;
  mid.append(playArea, logBox);
  app.appendChild(mid);

  // --- player row ---
  const me = el('section', 'side-row player');
  const meAvatar = el('div', 'avatar you', 'Y');
  const meInfo = el('div', 'side-info');
  meInfo.appendChild(lifeBar(state.player, 'YOU'));
  meInfo.appendChild(manaGems(null, state.player.mana, state.player.maxMana));
  const endBtn = el('button', 'end-turn', state.phase === 'player' && !state.over ? 'END TURN  ⏎' : state.phase === 'ai' ? 'WARDEN…' : '—');
  endBtn.disabled = state.phase !== 'player' || state.over;
  endBtn.addEventListener('click', handlers.onEndTurn);
  me.append(meAvatar, meInfo, endBtn);
  app.appendChild(me);

  // --- hand ---
  const hand = el('section', 'hand');
  state.player.hand.forEach((card, i) => {
    const playable = state.phase === 'player' && !state.over && card.cost <= state.player.mana;
    hand.appendChild(cardNode(card, i, playable, handlers.onPlay));
  });
  if (state.player.hand.length === 0) {
    hand.appendChild(el('div', 'hand-empty', 'Your hand is empty — end your turn to draw.'));
  }
  app.appendChild(hand);

  renderOverlay(state, handlers);
}

function overlayShell(title, cls) {
  const ov = el('div', `overlay ${cls}`);
  const panel = el('div', 'panel');
  panel.appendChild(el('h1', 'panel-title', title));
  ov.appendChild(panel);
  return { ov, panel };
}

function statsList(state) {
  const list = el('div', 'stats');
  const rows = [
    ['Turns played', String(state.turn)],
    ['Your life left', `${state.player.life} / ${MAX_LIFE}`],
    ['Damage you dealt', String(state.stats.damageDealt)],
    ['Cards you played', String(state.stats.cardsPlayed)],
    ['Life you healed', String(state.stats.healed)],
    ['Final score', String(finalScore(state))],
  ];
  rows.forEach(([k, v]) => {
    const row = el('div', 'stat-row');
    row.append(el('span', 'stat-key', k), el('span', 'stat-val', v));
    list.appendChild(row);
  });
  return list;
}

function renderOverlay(state, handlers) {
  const old = document.querySelector('.overlay');
  if (old) old.remove();
  if (state.screen === 'title') {
    const { ov, panel } = overlayShell('EMBER COURT', 'title-screen');
    panel.appendChild(el('p', 'tagline', 'A duel of the four houses. Outplay the Warden, card by card.'));
    const rules = el('div', 'rules');
    rules.innerHTML =
      '<b>How to play</b>' +
      '<br>• You and the Warden start at <b>30 life</b>. First to 0 loses.' +
      '<br>• Each turn you gain <b>+1 mana crystal</b> (up to 10) and draw a card.' +
      '<br>• Cards cost mana: <b>Ember</b> burns, <b>Tide</b> shields and heals,' +
      ' <b>Thorn</b> wounds and mends, <b>Gale</b> strikes fast and draws.' +
      '<br>• Block soaks damage before life does. Click a card (or press 1–7)' +
      ' to play it, then <b>End Turn</b> (Space).' +
      '<br>• Your deck holds 28 cards; when it runs out, the discard pile is shuffled back in.';
    panel.appendChild(rules);
    const begin = el('button', 'big-btn', 'BEGIN THE DUEL');
    begin.addEventListener('click', handlers.onBegin);
    panel.appendChild(begin);
    panel.appendChild(el('p', 'fine', 'An original game · plays offline in your browser · no account needed'));
    document.body.appendChild(ov);
  } else if (state.screen === 'win' || state.screen === 'loss') {
    const won = state.screen === 'win';
    const { ov, panel } = overlayShell(won ? 'VICTORY' : 'DEFEAT', won ? 'win-screen' : 'loss-screen');
    panel.appendChild(el('p', 'tagline', won
      ? 'The Warden falls. The Ember Court is yours — the four houses bow to you.'
      : 'Your light goes out. The Warden keeps the Court… for now.'));
    panel.appendChild(statsList(state));
    const again = el('button', 'big-btn', 'PLAY AGAIN');
    again.addEventListener('click', handlers.onRestart);
    panel.appendChild(again);
    document.body.appendChild(ov);
  }
}
