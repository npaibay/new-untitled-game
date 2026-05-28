export function formatSlotDate(savedAt) {
  if (!savedAt) return "No save date";

  return new Date(savedAt).toLocaleString();
}

export function formatRegenValue(value) {
  const safeValue = Number(value || 0);
  const rounded = Math.round(safeValue * 10) / 10;

  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatStatValue(value, type) {
  if (type === "stamina") {
    const rounded = Math.round(value * 10) / 10;

    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }

  return String(Math.round(value));
}

export function formatStatLabel(stat) {
  const labels = {
    hp: "Health",
    mp: "Mana",
    stamina: "Stamina",
  };

  return labels[stat] || stat;
}