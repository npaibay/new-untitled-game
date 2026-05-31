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
    id: "train_with_garron",
    label: "Train with Garron",
    area: "stonefield_house",
    oneTime: true,
    cost: {
      stamina: 1,
    },
    itemRewards: [
      {
        itemId: "training_stick",
        quantity: 1,
      },
    ],
    unlocksOnComplete: {
      actions: ["practice_with_garron"],
    },
    log: "You train with Garron.",
    story:
      "Garron walks you through the basics, then hands you a simple training stick.",
  },

  {
    id: "practice_with_garron",
    label: "Practice with Garron",
    area: "stonefield_house",
    unlocked: false,
    cost: {
      stamina: 1,
    },
    log:
      "You practice the basic forms Garron taught you, slowly getting used to the weight of the training stick.",
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

  {
    id: "forage_carefully",
    label: "Forage Carefully",
    area: "forest_edge",
    unlocked: false,
    cost: {
      stamina: 2,
    },
    rewards: {
      herbs: 3,
    },
    log:
      "You take your time searching the forest edge and gather a better bundle of herbs.",
  },
];