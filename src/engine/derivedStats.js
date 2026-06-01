function getAttribute(attributes, attributeId) {
  const value = Number(attributes?.[attributeId]);

  return Number.isFinite(value) ? value : 1;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getDerivedCombatStats(player, gameState) {
  const attributes = player.attributes || {};
  const combatTraining = gameState.progress?.combatTraining ?? 0;
  const hasBasicGuard = Boolean(gameState.unlocks?.systems?.basic_guard);

  const strength = getAttribute(attributes, "strength");
  const dexterity = getAttribute(attributes, "dexterity");
  const constitution = getAttribute(attributes, "constitution");
  const intelligence = getAttribute(attributes, "intelligence");
  const wisdom = getAttribute(attributes, "wisdom");
  const charisma = getAttribute(attributes, "charisma");
  const luck = getAttribute(attributes, "luck");

  return {
    attackPower: 1 + strength * 2 + Math.floor(combatTraining / 2),
    defense: 1 + constitution + (hasBasicGuard ? 2 : 0),
    guardPower:
      1 + constitution + Math.floor(strength / 2) + (hasBasicGuard ? 2 : 0),
    accuracy: clamp(70 + dexterity * 3 + Math.floor(combatTraining / 2), 0, 95),
    evasion: clamp(5 + dexterity * 2 + Math.floor(wisdom / 2), 0, 60),
    criticalChance: clamp(3 + luck, 0, 50),
    initiative: dexterity + Math.floor(luck / 2),
    focus: intelligence + wisdom,
    resolve: wisdom + charisma,
  };
}

export function formatDerivedCombatStatValue(statId, value) {
  const percentStats = ["accuracy", "evasion", "criticalChance"];

  if (percentStats.includes(statId)) {
    return `${value}%`;
  }

  return value;
}