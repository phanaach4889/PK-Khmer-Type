import { readJson, writeJson } from './storageUtils.js';
export const ADAPTIVE_KEY = 'pk_adaptive_state_v1';
export const loadAdaptiveState = () => readJson(ADAPTIVE_KEY, null);
export const saveAdaptiveState = (value) => writeJson(ADAPTIVE_KEY, value);
