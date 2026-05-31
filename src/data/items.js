export const items = [
  {
    id: "training_stick",
    label: "Training Stick",
    type: "equipment",
    slot: "weapon",
    rarity: "common",
    category: "Training Gear",
    description:
      "A simple wooden stick. It is not much of a weapon, but it is familiar and easy to hold.",
    progression: {
      flags: ["has_training_stick"],
      unlocks: {
        systems: ["combat_basics"],
      },
    },
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
    progression: {
      flags: ["has_threadbare_charm"],
    },
  },
  {
    id: "worn_cloak",
    label: "Worn Cloak",
    type: "key_item",
    rarity: "common",
    category: "Keepsake",
    description:
      "A plain cloak from home. It carries the comfort of ordinary days.",
    progression: {
      flags: ["has_home_keepsake"],
    },
  },
  {
    id: "suspicious_pebble",
    label: "Suspicious Pebble",
    type: "key_item",
    rarity: "common",
    category: "???",
    description: "It looks important. It is probably not. Probably.",
    progression: {
      flags: ["has_suspicious_pebble"],
    },
  },
];

export const starterInventory = {
  items: [
    {
      itemId: "threadbare_charm",
      quantity: 1,
    },
    {
      itemId: "worn_cloak",
      quantity: 1,
    },
    {
      itemId: "suspicious_pebble",
      quantity: 1,
    },
  ],
};

export const starterEquipment = {
  weapon: null,
  accessory1: "threadbare_charm",
  accessory2: null,
  accessory3: null,
};