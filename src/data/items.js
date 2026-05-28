export const items = [
  {
    id: "training_stick",
    label: "Training Stick",
    type: "equipment",
    slot: "weapon",
    rarity: "common",
    category: "Starter Gear",
    description:
      "A simple wooden stick. It is not much of a weapon, but it is familiar and easy to hold.",
  },
  {
    id: "worn_cloak",
    label: "Worn Cloak",
    type: "equipment",
    slot: "body",
    rarity: "common",
    category: "Starter Gear",
    description:
      "A plain cloak from home. It carries the comfort of ordinary days.",
  },
  {
    id: "threadbare_charm",
    label: "Threadbare Charm",
    type: "equipment",
    slot: "accessory",
    rarity: "common",
    category: "Starter Gear",
    description:
      "A small charm tied with old thread. It does not seem powerful, but it feels important.",
  },
];

export const starterInventory = {
  items: [
    {
      itemId: "training_stick",
      quantity: 1,
    },
    {
      itemId: "worn_cloak",
      quantity: 1,
    },
    {
      itemId: "threadbare_charm",
      quantity: 1,
    },
  ],
};

export const starterEquipment = {
  weapon: "training_stick",
  body: "worn_cloak",
  accessory: "threadbare_charm",
};