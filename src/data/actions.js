export const actions = [
  {
    id: "talk_village_square",
    label: "Talk",
    area: "village_square",
    log: "You listen to the quiet chatter of the village.",
  },

  {
    id: "continue_story_village_square",
    label: "Continue Story",
    area: "village_square",
    log: "You continue the story.",
    story: "You take your first true step beyond the quiet safety of the village.",
  },

    {
    id: "rest_home",
    label: "Rest",
    area: "stonefield_house",
    startsResting: true,
    },

  {
    id: "explore_forest_edge",
    label: "Explore",
    area: "forest_edge",
    cost: {
      stamina: 1,
    },
    rewards: {
      herbs: 1,
    },
    log: "You explore the nearby forest edge and gather herbs.",
  },

  {
    id: "visit_healer",
    label: "Visit Healer",
    area: "healers_hut",
    restore: {
      hp: 2,
    },
    log: "The healer tends to your wounds.",
  },
];