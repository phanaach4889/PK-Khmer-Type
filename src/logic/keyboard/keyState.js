/** Framework-independent keyboard helpers for the React keyboard slice. */
export const layoutIds = ['standard', 'nida', 'english'];
export function normalizeLayoutId(layoutId) { return layoutIds.includes(layoutId) ? layoutId : 'standard'; }
export function keyLayerFromEvent(event) {
  if (event.getModifierState?.('AltGraph') || (event.ctrlKey && event.altKey)) return 'altgr';
  return event.shiftKey ? 'shift' : 'base';
}
