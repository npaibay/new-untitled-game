import { items } from "../data/items";

function getItemById(itemId) {
  return items.find((item) => item.id === itemId) || null;
}

function formatUnlockLabel(unlockId) {
  return unlockId
    .split("_")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
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

function ensureUnlockGroups(state) {
  if (!state.unlocks) {
    state.unlocks = {};
  }

  if (!state.unlocks.areas) {
    state.unlocks.areas = {};
  }

  if (!state.unlocks.actions) {
    state.unlocks.actions = {};
  }

  if (!state.unlocks.systems) {
    state.unlocks.systems = {};
  }

  if (!Array.isArray(state.unlocks.completedRules)) {
    state.unlocks.completedRules = [];
  }
}

function isStackableItem(item) {
  if (typeof item.stackable === "boolean") {
    return item.stackable;
  }

  return item.type !== "equipment" && item.type !== "key_item";
}

function addItemToInventory(state, item, quantity = 1) {
  ensureInventory(state);

  const existingEntry = state.inventory.items.find((entry) => {
    return (entry.itemId || entry.id) === item.id;
  });

  const stackable = isStackableItem(item);

  if (existingEntry) {
    if (stackable) {
      existingEntry.quantity = (existingEntry.quantity || 1) + quantity;

      return {
        added: true,
        alreadyOwned: false,
      };
    }

    return {
      added: false,
      alreadyOwned: true,
    };
  }

  state.inventory.items.push({
    itemId: item.id,
    quantity,
  });

  return {
    added: true,
    alreadyOwned: false,
  };
}

function applyItemProgression(state, item) {
  const messages = [];
  const progression = item.progression || {};

  if (!state.flags) {
    state.flags = {};
  }

  ensureUnlockGroups(state);

  const flags = progression.flags || [];

  flags.forEach((flag) => {
    state.flags[flag] = true;
  });

  const unlocks = progression.unlocks || {};

  if (Array.isArray(unlocks.systems)) {
    unlocks.systems.forEach((systemId) => {
      if (!state.unlocks.systems[systemId]) {
        state.unlocks.systems[systemId] = true;
        messages.push(`Unlocked: ${formatUnlockLabel(systemId)}.`);
      }
    });
  }

  if (Array.isArray(unlocks.actions)) {
    unlocks.actions.forEach((actionId) => {
      state.unlocks.actions[actionId] = true;
    });
  }

  if (Array.isArray(unlocks.areas)) {
    unlocks.areas.forEach((areaId) => {
      state.unlocks.areas[areaId] = true;
    });
  }

  return messages;
}

export function grantItemRewards(state, itemRewards = []) {
  if (!Array.isArray(itemRewards) || itemRewards.length === 0) {
    return [];
  }

  const messages = [];

  itemRewards.forEach((reward) => {
    const itemId = reward.itemId || reward.id;
    const quantity = reward.quantity ?? 1;
    const item = getItemById(itemId);

    if (!item) {
      messages.push(`Unknown item reward: ${itemId}.`);
      return;
    }

    const result = addItemToInventory(state, item, quantity);

    if (result.added) {
      messages.push(`Obtained: ${item.label}.`);
    }

    if (result.alreadyOwned) {
      messages.push(`Already obtained: ${item.label}.`);
    }

    const progressionMessages = applyItemProgression(state, item);
    messages.push(...progressionMessages);
  });

  return messages;
}