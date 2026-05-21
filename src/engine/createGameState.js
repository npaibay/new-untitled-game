import { defaultPlayer } from "../data/defaultPlayer";
import { defaultResources } from "../data/defaultResources";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createGameState() {
  return {
    player: clone(defaultPlayer),
    resources: clone(defaultResources),

    actionLog: ["Prototype initialized."],
    storyLog: ["Story shell loaded."],

    flags: {},
    completedStoryEvents: [],

    progress: {
      totalActions: 0,
      actionCounts: {},
      areaVisits: {
        [defaultPlayer.area]: 1,
      },
    },
  };
}