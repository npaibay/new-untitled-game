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
    nextState.actionLog = addLog(
      nextState.actionLog,
      getActionLog(action, "Not enough status points.")
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

  nextState.actionLog = addLog(
    nextState.actionLog,
    getActionLog(action, action.log || "Action completed.")
  );

  if (action.story) {
    nextState.storyLog = addLog(nextState.storyLog, action.story);
  }

  processStoryEvents(nextState, storyEvents);

  return nextState;
}