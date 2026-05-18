export function getDiscoveredResources(resources) {
  return Object.entries(resources).filter(
    ([resourceId, resource]) => resourceId !== "gold" && resource.discovered
  );
}

export function getDiscoveredAreas(areas) {
  return areas.filter((area) => area.discovered);
}

export function getAvailableActions(actions, currentAreaId) {
  return actions.filter((action) => action.area === currentAreaId);
}

export function getAreaById(areas, areaId) {
  return areas.find((area) => area.id === areaId) || null;
}

export function getAreaLabel(areas, areaId) {
  const area = getAreaById(areas, areaId);

  return area ? area.label : "Unknown Area";
}