export const unlockRules = [
  {
    id: "unlock_forest_trail",
    type: "area",
    targetId: "forest_trail",
    condition: (state) =>
      (state.progress.actionCounts.explore_forest_edge || 0) >= 3,
    log: "New area unlocked: Forest Trail.",
  },

  {
    id: "unlock_forage_carefully",
    type: "action",
    targetId: "forage_carefully",
    condition: (state) => state.resources.herbs.discovered,
    log: "New action unlocked: Forage Carefully.",
  },
];

function addLog(logList, message) {
  return [message, ...logList].slice(0, 50);
}

export function processUnlocks(state) {
  unlockRules.forEach((rule) => {
    if (state.unlocks.completedRules.includes(rule.id)) return;
    if (!rule.condition(state)) return;

    if (rule.type === "area") {
      state.unlocks.areas[rule.targetId] = true;
    }

    if (rule.type === "action") {
      state.unlocks.actions[rule.targetId] = true;
    }

    state.unlocks.completedRules.push(rule.id);

    if (rule.log) {
      state.actionLog = addLog(state.actionLog, rule.log);
    }
  });

  return state;
}