// The deck of Ember Court: 28 cards across the four houses of the court.
// Each card is one plain object: what it costs, what it does, and the line
// printed on its face. Nothing here is copied from another game; the houses,
// names and numbers are this game's own.
//
// Houses: EMBER (red, raw damage), TIDE (blue, block and healing),
// THORN (green, damage that mends you), GALE (violet, cheap and quick).

export const HOUSES = {
  ember: { name: 'Ember', color: '#c0392b', light: '#f5b7b1', glyph: 'E', suit: 'Flame' },
  tide: { name: 'Tide', color: '#2471a3', light: '#aed6f1', glyph: 'T', suit: 'Wave' },
  thorn: { name: 'Thorn', color: '#1e8449', light: '#a9dfbf', glyph: 'Th', suit: 'Leaf' },
  gale: { name: 'Gale', color: '#6c3483', light: '#d2b4de', glyph: 'G', suit: 'Wind' },
};

// id, name, house, cost, damage, block, heal, draw, face text
const DEFS = [
  ['spark', 'Spark', 'ember', 1, 2, 0, 0, 0, 'Deal 2 damage.'],
  ['spark2', 'Spark', 'ember', 1, 2, 0, 0, 0, 'Deal 2 damage.'],
  ['cinder-imp', 'Cinder Imp', 'ember', 2, 3, 0, 0, 0, 'Deal 3 damage.'],
  ['flame-lash', 'Flame Lash', 'ember', 2, 4, 0, 0, 0, 'Deal 4 damage.'],
  ['flame-lash2', 'Flame Lash', 'ember', 2, 4, 0, 0, 0, 'Deal 4 damage.'],
  ['ember-fan', 'Ember Fan', 'ember', 3, 5, 0, 0, 0, 'Deal 5 damage.'],
  ['inferno', 'Inferno', 'ember', 4, 8, 0, 0, 0, 'Deal 8 damage.'],
  ['tidewall', 'Tidewall', 'tide', 2, 0, 6, 0, 0, 'Gain 6 block.'],
  ['tidewall2', 'Tidewall', 'tide', 2, 0, 6, 0, 0, 'Gain 6 block.'],
  ['soothing-rain', 'Soothing Rain', 'tide', 2, 0, 0, 5, 0, 'Heal 5 life.'],
  ['deep-current', 'Deep Current', 'tide', 3, 0, 0, 0, 2, 'Draw 2 cards.'],
  ['riptide', 'Riptide', 'tide', 3, 5, 0, 0, 0, 'Deal 5 damage.'],
  ['frost-shard', 'Frost Shard', 'tide', 1, 1, 0, 0, 1, 'Deal 1 damage. Draw 1.'],
  ['still-waters', 'Still Waters', 'tide', 1, 0, 3, 2, 0, 'Gain 3 block. Heal 2.'],
  ['thorn-whip', 'Thorn Whip', 'thorn', 2, 3, 0, 2, 0, 'Deal 3 damage. Heal 2.'],
  ['thorn-whip2', 'Thorn Whip', 'thorn', 2, 3, 0, 2, 0, 'Deal 3 damage. Heal 2.'],
  ['briar-shield', 'Briar Shield', 'thorn', 1, 0, 4, 0, 0, 'Gain 4 block.'],
  ['overgrowth', 'Overgrowth', 'thorn', 3, 5, 0, 3, 0, 'Deal 5 damage. Heal 3.'],
  ['bramble-snare', 'Bramble Snare', 'thorn', 2, 4, 0, 0, 0, 'Deal 4 damage.'],
  ['seedling', 'Seedling', 'thorn', 1, 0, 0, 3, 0, 'Heal 3 life.'],
  ['root-grasp', 'Root Grasp', 'thorn', 3, 6, 0, 0, 0, 'Deal 6 damage.'],
  ['gust', 'Gust', 'gale', 1, 2, 0, 0, 0, 'Deal 2 damage.'],
  ['gust2', 'Gust', 'gale', 1, 2, 0, 0, 0, 'Deal 2 damage.'],
  ['cyclone', 'Cyclone', 'gale', 3, 6, 0, 0, 0, 'Deal 6 damage.'],
  ['slipstream', 'Slipstream', 'gale', 2, 1, 0, 0, 1, 'Deal 1 damage. Draw 1.'],
  ['tailwind', 'Tailwind', 'gale', 1, 0, 0, 0, 1, 'Draw 1 card.'],
  ['storm-crow', 'Storm Crow', 'gale', 2, 3, 0, 0, 0, 'Deal 3 damage.'],
  ['howling-gale', 'Howling Gale', 'gale', 4, 7, 0, 0, 0, 'Deal 7 damage.'],
];

export function buildDeck() {
  return DEFS.map(([id, name, house, cost, dmg, block, heal, draw, text]) => ({
    id, name, house, cost, dmg, block, heal, draw, text,
  }));
}

export function describe(card) {
  const parts = [];
  if (card.dmg) parts.push(`${card.dmg} damage`);
  if (card.block) parts.push(`${card.block} block`);
  if (card.heal) parts.push(`heal ${card.heal}`);
  if (card.draw) parts.push(`draw ${card.draw}`);
  return parts.join(', ');
}
