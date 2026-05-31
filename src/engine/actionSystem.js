import { storyEvents } from "../data/storyEvents";
import { actions } from "../data/actions";
import {
  addResources,
  canPayResourceCost,
  payResourceCost,
} from "./resourceSystem";
import {
  canPayStatCost,
  payStatCost,
  restoreStats,
} from "./statSystem";
import { processStoryEvents } from "./storySystem";
import { recordActionProgress } from "./progressSystem";
import { processUnlocks } from "./unlockSystem";
import { grantItemRewards } from "./itemSystem";

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

function getActionLog(action, message) {
  return createLogEntry(
    "action",
    `Action used: ${action.label}\n${message}`
  );
}

function isBelowMax(value, max) {
  return value < max - 0.001;
}

function isFullyRested(player) {
  return (
    !isBelowMax(player.hp, player.maxHp) &&
    !isBelowMax(player.stamina, player.maxStamina)
  );
}

function getRestStartMessage(player) {
  const needsHealth = isBelowMax(player.hp, player.maxHp);
  const needsStamina = isBelowMax(player.stamina, player.maxStamina);

  if (needsHealth && needsStamina) {
    return "You settle in and begin recovering health and stamina.";
  }

  if (needsHealth) {
    return "You settle in and begin recovering health.";
  }

  if (needsStamina) {
    return "You settle in and begin recovering stamina.";
  }

  return "You are already fully rested.";
}

function getActionCosts(action) {
  const cost = action.cost || {};

  if (cost.stats || cost.resources) {
    return {
      statCost: cost.stats || {},
      resourceCost: cost.resources || {},
    };
  }

  return {
    statCost: cost,
    resourceCost: {},
  };
}

function formatStatName(stat) {
  const statNames = {
    hp: "health",
    mp: "mana",
    stamina: "stamina",
  };

  return statNames[stat] || stat;
}

function formatUnlockLabel(unlockId) {
  return unlockId
    .split("_")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function getActionLabel(actionId) {
  const action = actions.find((entry) => entry.id === actionId);

  return action?.label || formatUnlockLabel(actionId);
}

function getMissingStatCosts(player, statCost = {}) {
  return Object.entries(statCost)
    .filter(([stat, amount]) => {
      return typeof player[stat] === "number" && player[stat] < amount;
    })
    .map(([stat]) => formatStatName(stat));
}

function getMissingStatMessage(missingStats) {
  if (missingStats.length === 0) {
    return "Not enough status points.";
  }

  if (missingStats.length === 1) {
    return `Not enough ${missingStats[0]}.`;
  }

  const lastStat = missingStats[missingStats.length - 1];
  const otherStats = missingStats.slice(0, -1).join(", ");

  return `Not enough ${otherStats} and ${lastStat}.`;
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

  if (!state.unlocks.completedActions) {
    state.unlocks.completedActions = {};
  }
}

function markOneTimeActionCompleted(state, action) {
  if (!action.oneTime) {
    return;
  }

  ensureUnlockGroups(state);

  const completionId = action.completionId || action.id;

  state.unlocks.completedActions[completionId] = true;
}

function applyActionCompletionUnlocks(state, action) {
  const messages = [];
  const unlocks = action.unlocksOnComplete || {};

  ensureUnlockGroups(state);

  if (Array.isArray(unlocks.actions)) {
    unlocks.actions.forEach((actionId) => {
      if (!state.unlocks.actions[actionId]) {
        state.unlocks.actions[actionId] = true;

        messages.push(
          createLogEntry("unlock", `Unlocked action: ${getActionLabel(actionId)}`)
        );
      }
    });
  }

  if (Array.isArray(unlocks.areas)) {
    unlocks.areas.forEach((areaId) => {
      if (!state.unlocks.areas[areaId]) {
        state.unlocks.areas[areaId] = true;

        messages.push(
          createLogEntry("unlock", `Unlocked area: ${formatUnlockLabel(areaId)}`)
        );
      }
    });
  }

  if (Array.isArray(unlocks.systems)) {
    unlocks.systems.forEach((systemId) => {
      if (!state.unlocks.systems[systemId]) {
        state.unlocks.systems[systemId] = true;

        messages.push(
          createLogEntry("unlock", `Unlocked: ${formatUnlockLabel(systemId)}`)
        );
      }
    });
  }

  return messages;
}

export function performAction(currentState, action) {
  const nextState = clone(currentState);

  if (action.startsResting) {
    if (nextState.player.isResting) {
      nextState.actionLog = addLog(
        nextState.actionLog,
        getActionLog(action, "You are already resting.")
      );

      return nextState;
    }

    const restMessage = getRestStartMessage(nextState.player);

    if (isFullyRested(nextState.player)) {
      nextState.actionLog = addLog(
        nextState.actionLog,
        getActionLog(action, restMessage)
      );

      return nextState;
    }

    nextState.player.isResting = true;

    nextState.actionLog = addLog(
      nextState.actionLog,
      getActionLog(action, restMessage)
    );

    return nextState;
  }

  if (nextState.player.isResting) {
    nextState.player.isResting = false;
    nextState.actionLog = addLog(
      nextState.actionLog,
      createLogEntry("system", "Rest interrupted.")
    );
  }

  const { statCost, resourceCost } = getActionCosts(action);

  if (!canPayStatCost(nextState.player, statCost)) {
    const missingStats = getMissingStatCosts(nextState.player, statCost);
    const missingStatMessage = getMissingStatMessage(missingStats);

    nextState.actionLog = addLog(
      nextState.actionLog,
      getActionLog(action, missingStatMessage)
    );

    return nextState;
  }

  if (!canPayResourceCost(nextState.resources, resourceCost)) {
    nextState.actionLog = addLog(
      nextState.actionLog,
      getActionLog(action, "Not enough resources.")
    );

    return nextState;
  }

  payStatCost(nextState.player, statCost);
  payResourceCost(nextState.resources, resourceCost);

  restoreStats(nextState.player, action.restore);
  addResources(nextState.resources, action.rewards);

  const itemRewardMessages = grantItemRewards(nextState, action.itemRewards);
  const completionUnlockMessages = applyActionCompletionUnlocks(
    nextState,
    action
  );

  recordActionProgress(nextState.progress, action);
  markOneTimeActionCompleted(nextState, action);

  nextState.actionLog = addLog(
    nextState.actionLog,
    getActionLog(action, action.log || "Action completed.")
  );

  itemRewardMessages.forEach((message) => {
    nextState.actionLog = addLog(nextState.actionLog, message);
  });

  completionUnlockMessages.forEach((message) => {
    nextState.actionLog = addLog(nextState.actionLog, message);
  });

  if (action.story) {
    nextState.storyLog = addLog(nextState.storyLog, action.story);
  }

  processStoryEvents(nextState, storyEvents);
  processUnlocks(nextState);

  return nextState;
}