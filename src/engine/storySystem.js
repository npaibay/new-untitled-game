function addLog(logList, message) {
  return [message, ...logList].slice(0, 50);
}

export function processStoryEvents(state, storyEvents = []) {
  storyEvents.forEach((event) => {
    const alreadyCompleted = state.completedStoryEvents.includes(event.id);

    if (alreadyCompleted) return;
    if (!event.condition(state)) return;

    state.storyLog = addLog(state.storyLog, event.text);
    state.completedStoryEvents.push(event.id);

    if (event.setFlags) {
      Object.assign(state.flags, event.setFlags);
    }
  });
}