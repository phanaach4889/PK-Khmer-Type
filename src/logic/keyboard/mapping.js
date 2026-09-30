import keyboardData from '../../../data/keyboard.json';

export const CODE_TO_ID = {
  'Backquote': 'grave', 'Digit1': 'k1', 'Digit2': 'k2', 'Digit3': 'k3', 'Digit4': 'k4',
  'Digit5': 'k5', 'Digit6': 'k6', 'Digit7': 'k7', 'Digit8': 'k8', 'Digit9': 'k9', 'Digit0': 'k0',
  'Minus': 'minus', 'Equal': 'equal', 'Backspace': 'backspace', 'Tab': 'tab', 'KeyQ': 'q',
  'KeyW': 'w', 'KeyE': 'e', 'KeyR': 'r', 'KeyT': 't', 'KeyY': 'y', 'KeyU': 'u', 'KeyI': 'i',
  'KeyO': 'o', 'KeyP': 'p', 'BracketLeft': 'bracketL', 'BracketRight': 'bracketR', 'Enter': 'enter',
  'CapsLock': 'caps', 'KeyA': 'a', 'KeyS': 's', 'KeyD': 'd', 'KeyF': 'f', 'KeyG': 'g', 'KeyH': 'h',
  'KeyJ': 'j', 'KeyK': 'k', 'KeyL': 'l', 'Semicolon': 'semicolon', 'Quote': 'quote', 'Backslash': 'backslash',
  'ShiftLeft': 'shiftL', 'KeyZ': 'z', 'KeyX': 'x', 'KeyC': 'c', 'KeyV': 'v', 'KeyB': 'b', 'KeyN': 'n',
  'KeyM': 'm', 'Comma': 'comma', 'Period': 'period', 'Slash': 'slash', 'ShiftRight': 'shiftR',
  'ControlLeft': 'ctrlL', 'AltLeft': 'alt', 'Space': 'space', 'AltRight': 'altgr', 'ControlRight': 'ctrlR'
};

export function characterForEvent(event, layoutId) { 
  const id = CODE_TO_ID[event.code]; 
  if (!id) return ''; 
  if (id === 'space') {
    const layout = keyboardData.LAYOUTS[layoutId];
    if (layout?.spaceMap) {
      const layer = event.getModifierState?.('AltGraph') || (event.ctrlKey && event.altKey) ? 'altgr' : event.ctrlKey ? 'ctrl' : event.shiftKey ? 'shift' : 'base';
      return layout.spaceMap[layer] || ' ';
    }
    return ' '; 
  }
  const key = keyboardData.LAYOUTS[layoutId]?.rows.flat().find(value => value.id === id); 
  if (!key || key.kind !== 'glyph') return ''; 
  const layer = event.getModifierState?.('AltGraph') || (event.ctrlKey && event.altKey) ? 'altgr' : event.ctrlKey ? 'ctrl' : event.shiftKey || (event.getModifierState?.('CapsLock') && layoutId === 'english') ? 'shift' : 'base'; 
  return key[layer] || ''; 
}
