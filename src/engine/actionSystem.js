import { storyEvents } from "../data/storyEvents";
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

function addLog(logList, message) {
  return [message, ...logList].slice(0, 50);
}

function getActionLog(action, message) {
  return `Action used: ${action.label}\n${message}`;
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

export function performAction(currentState, action) {
  const nextState = clone(currentState);

  /*
    Rest action:
    Starts resting mode.
    Health and stamina recovery happens in tickSystem.js.
  */
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

  /*
    Any non-rest action interrupts resting.
  */
  if (nextState.player.isResting) {
    nextState.player.isResting = false;
    nextState.actionLog = addLog(nextState.actionLog, "Rest interrupted.");
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

  const itemRewardMessages = grantItemRewards(
    nextState,
    action.itemRewards
  );

  recordActionProgress(nextState.progress, action);

  nextState.actionLog = addLog(
    nextState.actionLog,
    getActionLog(action, action.log || "Action completed.")
  );

  itemRewardMessages.forEach((message) => {
    nextState.actionLog = addLog(nextState.actionLog, message);
  });

  if (action.story) {
    nextState.storyLog = addLog(nextState.storyLog, action.story);
  }

  processStoryEvents(nextState, storyEvents);
  processUnlocks(nextState);

  return nextState;
}