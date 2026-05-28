export function getDiscoveredResources(resources) {
  return Object.entries(resources).filter(
    ([resourceId, resource]) => resourceId !== "gold" && resource.discovered
  );
}

export function getDiscoveredAreas(areas, unlocks) {
  return areas.filter((area) => {
    if (area.discovered !== false) return true;

    return Boolean(unlocks?.areas?.[area.id]);
  });
}

export function getAvailableActions(actions, currentAreaId, unlocks) {
  return actions.filter((action) => {
    const isInCurrentArea = action.area === currentAreaId;
    const isUnlocked =
      action.unlocked !== false || Boolean(unlocks?.actions?.[action.id]);

    return isInCurrentArea && isUnlocked;
  });
}

export function getAreaById(areas, areaId) {
  return areas.find((area) => area.id === areaId) || null;
}

export function getAreaLabel(areas, areaId) {
  const area = getAreaById(areas, areaId);

  return area ? area.label : "Unknown Area";
}