// Keyboard play for Ember Court: 1-7 plays a card from the hand, Space or
// Enter ends the turn (or begins / restarts on the overlays), R restarts,
// M toggles sound. All of it is also clickable, so mouse-only players lose
// nothing.

export function bindKeyboard(getState, handlers) {
  window.addEventListener('keydown', (event) => {
    const state = getState();
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'm') { handlers.onToggleSound(); return; }
    if (key === 'r') { handlers.onRestart(); return; }
    if (state.screen === 'title' && (key === 'enter' || key === ' ')) {
      event.preventDefault();
      handlers.onBegin();
      return;
    }
    if ((state.screen === 'win' || state.screen === 'loss') && (key === 'enter' || key === ' ')) {
      event.preventDefault();
      handlers.onRestart();
      return;
    }
    if (state.screen !== 'play' || state.phase !== 'player' || state.over) return;
    if (key >= '1' && key <= '7') {
      const index = Number(key) - 1;
      if (index < state.player.hand.length) handlers.onPlay(index);
    } else if (key === ' ' || key === 'enter') {
      event.preventDefault();
      handlers.onEndTurn();
    }
  });
}
