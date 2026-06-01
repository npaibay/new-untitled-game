import { items } from "../data/items";

const accessorySlots = ["accessory1", "accessory2", "accessory3"];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createLogEntry(type, message) {
  return {
    type,
    message,
  };
}

function addLog(logList, entry) {
  return [entry, ...logList].slice(0, 50);
}

function getItemById(itemId) {
  return items.find((item) => item.id === itemId) || null;
}

function ensureInventory(state) {
  if (!state.inventory) {
    state.inventory = {
      items: [],
    };
  }

  if (!Array.isArray(state.inventory.items)) {
    state.inventory.items = [];
  }
}

function ensureEquipment(state) {
  if (!state.equipment) {
    state.equipment = {};
  }

  if (!Object.prototype.hasOwnProperty.call(state.equipment, "weapon")) {
    state.equipment.weapon = null;
  }

  accessorySlots.forEach((slotId) => {
    if (!Object.prototype.hasOwnProperty.call(state.equipment, slotId)) {
      state.equipment[slotId] = null;
    }
  });
}

function hasInventoryItem(state, itemId) {
  ensureInventory(state);

  return state.inventory.items.some((entry) => {
    return (entry.itemId || entry.id) === itemId;
  });
}

function getDefaultSlotForItem(state, item) {
  ensureEquipment(state);

  if (item.slot === "weapon") {
    return "weapon";
  }

  if (item.slot === "accessory") {
    return (
      accessorySlots.find((slotId) => {
        return !state.equipment[slotId];
      }) || "accessory1"
    );
  }

  return null;
}

function canItemUseSlot(item, slotId) {
  if (item.slot === "weapon") {
    return slotId === "weapon";
  }

  if (item.slot === "accessory") {
    return accessorySlots.includes(slotId);
  }

  return false;
}

function clearExistingEquipmentInstance(state, itemId) {
  ensureEquipment(state);

  Object.keys(state.equipment).forEach((slotId) => {
    if (state.equipment[slotId] === itemId) {
      state.equipment[slotId] = null;
    }
  });
}

export function equipItem(currentState, itemId, preferredSlotId = null) {
  const nextState = clone(currentState);
  const item = getItemById(itemId);

  ensureInventory(nextState);
  ensureEquipment(nextState);

  if (!item) {
    nextState.actionLog = addLog(
      nextState.actionLog,
      createLogEntry("warning", `Unknown item: ${itemId}.`)
    );

    return nextState;
  }

  if (item.type !== "equipment") {
    nextState.actionLog = addLog(
      nextState.actionLog,
      createLogEntry("warning", `${item.label} cannot be equipped.`)
    );

    return nextState;
  }

  if (!hasInventoryItem(nextState, item.id)) {
    nextState.actionLog = addLog(
      nextState.actionLog,
      createLogEntry("warning", `You do not have ${item.label}.`)
    );

    return nextState;
  }

  const targetSlotId = preferredSlotId || getDefaultSlotForItem(nextState, item);

  if (!targetSlotId || !canItemUseSlot(item, targetSlotId)) {
    nextState.actionLog = addLog(
      nextState.actionLog,
      createLogEntry("warning", `${item.label} cannot be equipped there.`)
    );

    return nextState;
  }

  if (nextState.equipment[targetSlotId] === item.id) {
    nextState.actionLog = addLog(
      nextState.actionLog,
      createLogEntry("system", `${item.label} is already equipped.`)
    );

    return nextState;
  }

  clearExistingEquipmentInstance(nextState, item.id);

  nextState.equipment[targetSlotId] = item.id;

  nextState.actionLog = addLog(
    nextState.actionLog,
    createLogEntry("system", `Equipped: ${item.label}.`)
  );

  return nextState;
}

export function unequipSlot(currentState, slotId) {
  const nextState = clone(currentState);

  ensureEquipment(nextState);

  const equippedItemId = nextState.equipment[slotId];

  if (!equippedItemId) {
    nextState.actionLog = addLog(
      nextState.actionLog,
      createLogEntry("system", "Nothing is equipped there.")
    );

    return nextState;
  }

  const item = getItemById(equippedItemId);
  const itemLabel = item?.label || equippedItemId;

  nextState.equipment[slotId] = null;

  nextState.actionLog = addLog(
    nextState.actionLog,
    createLogEntry("system", `Unequipped: ${itemLabel}.`)
  );

  return nextState;
}