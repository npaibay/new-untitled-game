import { storyEvents } from "../data/storyEvents";
import { processStoryEvents } from "./storySystem";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function addLog(logList, message) {
  return [message, ...logList].slice(0, 50);
}

export function moveToArea(currentState, area) {
  const nextState = clone(currentState);

  if (nextState.player.isResting) {
    nextState.player.isResting = false;
    nextState.actionLog = addLog(nextState.actionLog, "Rest interrupted.");
  }

  nextState.player.area = area.id;
  nextState.actionLog = addLog(
    nextState.actionLog,
    `Moved to: ${area.label}`
  );

  processStoryEvents(nextState, storyEvents);

  return nextState;
}