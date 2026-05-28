import { storyEvents } from "../data/storyEvents";
import {
  canPayResourceCost,
  payResourceCost,
} from "./resourceSystem";
import { processStoryEvents } from "./storySystem";
import { processUnlocks } from "./unlockSystem";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function addLog(logList, message) {
  return [message, ...logList].slice(0, 50);
}

function ensureUpgradeState(state) {
  if (!state.upgrades) {
    state.upgrades = {
      levels: {},
    };
  }

  if (!state.upgrades.levels) {
    state.upgrades.levels = {};
  }
}

export function getUpgradeLevel(state, upgradeId) {
  return state.upgrades?.levels?.[upgradeId] || 0;
}

export function isUpgradeMaxed(state, upgrade) {
  return getUpgradeLevel(state, upgrade.id) >= upgrade.maxLevel;
}

export function getNextUpgradeCost(state, upgrade) {
  const currentLevel = getUpgradeLevel(state, upgrade.id);

  return upgrade.costs[currentLevel] || null;
}

function applyUpgradeEffects(player, effects = []) {
  effects.forEach((effect) => {
    const currentValue = player[effect.stat];

    if (typeof currentValue !== "number") return;

    player[effect.stat] = currentValue + effect.amount;
  });

  player.hp = Math.min(player.hp, player.maxHp);
  player.mp = Math.min(player.mp, player.maxMp);
  player.stamina = Math.min(player.stamina, player.maxStamina);
}

function formatResourceName(resources, resourceId) {
  return resources[resourceId]?.label || resourceId;
}

export function formatResourceCost(cost = {}, resources = {}) {
  const entries = Object.entries(cost);

  if (entries.length === 0) {
    return "Free";
  }

  return entries
    .map(([resourceId, amount]) => {
      return `${amount} ${formatResourceName(resources, resourceId)}`;
    })
    .join(", ");
}

function getMissingResourceMessage(resources, cost = {}) {
  const missingResources = Object.entries(cost)
    .filter(([resourceId, amount]) => {
      return (resources[resourceId]?.amount || 0) < amount;
    })
    .map(([resourceId]) => formatResourceName(resources, resourceId));

  if (missingResources.length === 0) {
    return "Not enough resources.";
  }

  if (missingResources.length === 1) {
    return `Not enough ${missingResources[0]}.`;
  }

  const lastResource = missingResources[missingResources.length - 1];
  const otherResources = missingResources.slice(0, -1).join(", ");

  return `Not enough ${otherResources} and ${lastResource}.`;
}

export function purchaseUpgrade(currentState, upgrade) {
  const nextState = clone(currentState);

  ensureUpgradeState(nextState);

  const currentLevel = getUpgradeLevel(nextState, upgrade.id);

  if (currentLevel >= upgrade.maxLevel) {
    nextState.actionLog = addLog(
      nextState.actionLog,
      `${upgrade.label} is already at max level.`
    );

    return nextState;
  }

  const cost = getNextUpgradeCost(nextState, upgrade);

  if (!cost) {
    nextState.actionLog = addLog(
      nextState.actionLog,
      `${upgrade.label} has no available upgrade cost.`
    );

    return nextState;
  }

  if (!canPayResourceCost(nextState.resources, cost)) {
    nextState.actionLog = addLog(
      nextState.actionLog,
      getMissingResourceMessage(nextState.resources, cost)
    );

    return nextState;
  }

  payResourceCost(nextState.resources, cost);
  applyUpgradeEffects(nextState.player, upgrade.effects);

  nextState.upgrades.levels[upgrade.id] = currentLevel + 1;

  nextState.actionLog = addLog(
    nextState.actionLog,
    `Upgrade purchased: ${upgrade.label} Lv. ${currentLevel + 1}.`
  );

  processStoryEvents(nextState, storyEvents);
  processUnlocks(nextState);

  return nextState;
}