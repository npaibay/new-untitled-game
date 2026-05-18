export const storyEvents = [
  {
    id: "first_visit_forest_edge",
    condition: (state) => state.player.area === "forest_edge",
    text:
      "For the first time, you stand at the edge of the forest. The village feels close behind you, but the path ahead feels much larger than it should.",
  },

  {
    id: "first_herb_discovery",
    condition: (state) => state.resources.herbs.discovered,
    text:
      "You discovered your first useful resource: herbs. Even something small may become important in the days ahead.",
  },

  {
    id: "first_exhaustion",
    condition: (state) => state.player.stamina <= 0,
    text:
      "Your body grows heavy from exhaustion. Even determination has its limits.",
  },
];