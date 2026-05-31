import { actions } from "../data/actions";
import { areas } from "../data/areas";
import { defaultPlayer } from "../data/defaultPlayer";
import { defaultResources } from "../data/defaultResources";
import { starterEquipment, starterInventory } from "../data/items";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createInitialUnlockMap(items, defaultKey = "discovered") {
  return items.reduce((unlocks, item) => {
    if (item[defaultKey] !== false) {
      unlocks[item.id] = true;
    }

    return unlocks;
  }, {});
}

export function createGameState() {
  return {
    player: clone(defaultPlayer),
    resources: clone(defaultResources),

    inventory: clone(starterInventory),
    equipment: clone(starterEquipment),

    actionLog: ["Prototype initialized."],
    storyLog: ["Story shell loaded."],

    flags: {},
    completedStoryEvents: [],

    upgrades: {
      levels: {},
    },

    progress: {
      totalActions: 0,
      actionCounts: {},
      areaVisits: {
        [defaultPlayer.area]: 1,
      },
    },

    unlocks: {
      areas: createInitialUnlockMap(areas, "discovered"),
      actions: createInitialUnlockMap(actions, "unlocked"),
      systems: {},
      completedActions: {},
      completedRules: [],
    },
  };
}