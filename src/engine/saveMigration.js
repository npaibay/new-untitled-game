import { createGameState } from "./createGameState";

export const CURRENT_SAVE_VERSION = 7;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (value === undefined) return undefined;

  return JSON.parse(JSON.stringify(value));
}

function mergeWithDefaults(defaultValue, savedValue) {
  if (savedValue === undefined || savedValue === null) {
    return clone(defaultValue);
  }

  if (Array.isArray(defaultValue)) {
    return Array.isArray(savedValue) ? clone(savedValue) : clone(defaultValue);
  }

  if (isPlainObject(defaultValue)) {
    const merged = {};
    const savedObject = isPlainObject(savedValue) ? savedValue : {};

    const keys = new Set([
      ...Object.keys(defaultValue),
      ...Object.keys(savedObject),
    ]);

    keys.forEach((key) => {
      merged[key] = mergeWithDefaults(defaultValue[key], savedObject[key]);
    });

    return merged;
  }

  return savedValue;
}

function normalizePlayer(player) {
  player.hp = Math.min(player.hp, player.maxHp);
  player.mp = Math.min(player.mp, player.maxMp);
  player.stamina = Math.min(player.stamina, player.maxStamina);

  player.hp = Math.max(0, player.hp);
  player.mp = Math.max(0, player.mp);
  player.stamina = Math.max(0, player.stamina);

  player.attributes = normalizeAttributes(player.attributes);

  return player;
}

function normalizeAttributes(attributes) {
  const defaultAttributes = createGameState().player.attributes;
  const normalizedAttributes = isPlainObject(attributes) ? attributes : {};

  return Object.keys(defaultAttributes).reduce((nextAttributes, attribute) => {
    const value = Number(normalizedAttributes[attribute]);

    nextAttributes[attribute] =
      Number.isFinite(value) && value >= 0
        ? Math.floor(value)
        : defaultAttributes[attribute];

    return nextAttributes;
  }, {});
}

export function migrateSaveState(savedState) {
  const defaultState = createGameState();

  if (!isPlainObject(savedState)) {
    return defaultState;
  }

  const migratedState = mergeWithDefaults(defaultState, savedState);

  migratedState.player = normalizePlayer(migratedState.player);

  return migratedState;
}

export function migrateSaveRecord(saveRecord) {
  if (!isPlainObject(saveRecord)) {
    return null;
  }

  const savedState = saveRecord.state || saveRecord;

  return migrateSaveState(savedState);
}