function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function addLog(logList, message) {
  return [message, ...logList].slice(0, 50);
}

export function moveToArea(currentState, area) {
  const nextState = clone(currentState);

  nextState.player.area = area.id;
  nextState.actionLog = addLog(
    nextState.actionLog,
    `Moved to: ${area.label}`
  );

  return nextState;
}