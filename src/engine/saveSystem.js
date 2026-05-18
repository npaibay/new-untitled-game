import {
  CURRENT_SAVE_VERSION,
  migrateSaveRecord,
} from "./saveMigration";

export const SAVE_SLOT_COUNT = 10;

const SAVE_KEY_PREFIX = "new-untitled-game-save-slot";
const LAST_USED_SLOT_KEY = "new-untitled-game-last-used-slot";

function getSlotKey(slotId) {
  return `${SAVE_KEY_PREFIX}-${slotId}`;
}

function createSaveRecord(state) {
  return {
    version: CURRENT_SAVE_VERSION,
    savedAt: new Date().toISOString(),
    state,
  };
}

function safelyParseSave(rawSave) {
  try {
    return JSON.parse(rawSave);
  } catch (error) {
    console.error("Could not parse save file:", error);
    return null;
  }
}

export function saveGameToSlot(slotId, state) {
  const saveRecord = createSaveRecord(state);

  localStorage.setItem(getSlotKey(slotId), JSON.stringify(saveRecord));
  localStorage.setItem(LAST_USED_SLOT_KEY, String(slotId));
}

export function loadGameFromSlot(slotId) {
  const rawSave = localStorage.getItem(getSlotKey(slotId));

  if (!rawSave) {
    return null;
  }

  const saveRecord = safelyParseSave(rawSave);

  if (!saveRecord) {
    return null;
  }

  const migratedState = migrateSaveRecord(saveRecord);

  if (!migratedState) {
    return null;
  }

  localStorage.setItem(LAST_USED_SLOT_KEY, String(slotId));

  return migratedState;
}

export function loadLastUsedSave() {
  const lastUsedSlot = localStorage.getItem(LAST_USED_SLOT_KEY);

  if (!lastUsedSlot) {
    return null;
  }

  return loadGameFromSlot(Number(lastUsedSlot));
}

export function clearSaveSlot(slotId) {
  localStorage.removeItem(getSlotKey(slotId));

  const lastUsedSlot = localStorage.getItem(LAST_USED_SLOT_KEY);

  if (String(slotId) === lastUsedSlot) {
    localStorage.removeItem(LAST_USED_SLOT_KEY);
  }
}

export function clearAllSaveSlots() {
  for (let slotId = 1; slotId <= SAVE_SLOT_COUNT; slotId += 1) {
    localStorage.removeItem(getSlotKey(slotId));
  }

  localStorage.removeItem(LAST_USED_SLOT_KEY);
}

export function getSaveSlotSummaries() {
  const summaries = [];

  for (let slotId = 1; slotId <= SAVE_SLOT_COUNT; slotId += 1) {
    const rawSave = localStorage.getItem(getSlotKey(slotId));
    const saveRecord = rawSave ? safelyParseSave(rawSave) : null;
    const savedState = saveRecord ? migrateSaveRecord(saveRecord) : null;

    summaries.push({
      slotId,
      hasSave: Boolean(savedState),
      savedAt: saveRecord?.savedAt || null,
      version: saveRecord?.version || 0,
      playerName: savedState?.player?.name || null,
      level: savedState?.player?.level || null,
      areaId: savedState?.player?.area || null,
      day: savedState?.player?.day || null,
      path: savedState?.player?.path || null,
    });
  }

  return summaries;
}