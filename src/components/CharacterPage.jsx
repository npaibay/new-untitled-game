import { items } from "../data/items";
import {
  formatDerivedCombatStatValue,
  getDerivedCombatStats,
} from "../engine/derivedStats";
import {
  formatResourceCost,
  getNextUpgradeCost,
  getUpgradeLevel,
  isUpgradeMaxed,
} from "../engine/upgradeSystem";
import {
  formatAttributeLabel,
  formatDerivedCombatStatLabel,
  formatRegenValue,
} from "../utils/formatters";
import InfoRow from "./ui/InfoRow";
import StatMeter from "./ui/StatMeter";

const equipmentSlots = [
  {
    id: "weapon",
    label: "Weapon",
  },
  {
    id: "accessory1",
    label: "Accessory 1",
  },
  {
    id: "accessory2",
    label: "Accessory 2",
  },
  {
    id: "accessory3",
    label: "Accessory 3",
  },
];

const accessorySlots = ["accessory1", "accessory2", "accessory3"];

const attributeOrder = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
  "luck",
];

const derivedCombatStatOrder = [
  "attackPower",
  "defense",
  "guardPower",
  "accuracy",
  "evasion",
  "criticalChance",
  "initiative",
  "focus",
  "resolve",
];

function CharacterPage({
  player,
  resources,
  gameState,
  currentAreaLabel,
  upgrades,
  activeTab,
  onChangeTab,
  onPurchaseUpgrade,
  onEquipItem,
  onUnequipSlot,
}) {
  const itemMap = new Map(items.map((item) => [item.id, item]));

  const discoveredResources = Object.entries(resources).filter(
    ([resourceId, resource]) => {
      return resourceId !== "gold" && resource.discovered;
    }
  );

  const inventoryItems = gameState.inventory?.items || [];
  const equipment = gameState.equipment || {};
  const combatTraining = gameState.progress?.combatTraining ?? 0;
  const combatBasicsUnlocked = Boolean(
    gameState.unlocks?.systems?.combat_basics
  );
  const basicGuardUnlocked = Boolean(gameState.unlocks?.systems?.basic_guard);
  const attributes = player.attributes || {};
  const derivedCombatStats = getDerivedCombatStats(player, gameState);

  const resolvedInventoryItems = inventoryItems.map((entry) => {
    const itemId = entry.itemId || entry.id;
    const item = itemMap.get(itemId);

    return {
      entry,
      itemId,
      item,
      quantity: entry.quantity ?? 1,
    };
  });

  const equipmentInventoryItems = resolvedInventoryItems.filter(({ item }) => {
    return item?.type === "equipment";
  });

  const keyItems = resolvedInventoryItems.filter(({ item }) => {
    return item?.type === "key_item";
  });

  const unknownItems = resolvedInventoryItems.filter(({ item }) => {
    return !item;
  });

  return (
    <section className="character-page-panel">
      <div className="panel-header">
        <h2>Character</h2>
      </div>

      <div className="character-page-tabs">
        <button
          type="button"
          className={activeTab === "overview" ? "primary" : ""}
          onClick={() => onChangeTab("overview")}
        >
          Overview
        </button>

        <button
          type="button"
          className={activeTab === "combat" ? "primary" : ""}
          onClick={() => onChangeTab("combat")}
        >
          Combat
        </button>

        <button
          type="button"
          className={activeTab === "upgrades" ? "primary" : ""}
          onClick={() => onChangeTab("upgrades")}
        >
          Upgrades
        </button>

        <button
          type="button"
          className={activeTab === "items" ? "primary" : ""}
          onClick={() => onChangeTab("items")}
        >
          Items
        </button>
      </div>

      <div className="character-page-content">
        {activeTab === "overview" && (
          <>
            <section className="character-card">
              <h3>Profile</h3>

              <div className="character-grid">
                <InfoRow label="Name" value={player.name} />
                <InfoRow label="Gender" value={player.gender} />
                <InfoRow label="Level" value={player.level} />
                <InfoRow label="Path" value={player.path} />
                <InfoRow label="Area" value={currentAreaLabel} />
                <InfoRow label="Day" value={player.day} />
              </div>
            </section>

            <section className="character-card">
              <h3>Attributes</h3>

              <div className="character-grid">
                {attributeOrder.map((attribute) => (
                  <InfoRow
                    key={attribute}
                    label={formatAttributeLabel(attribute)}
                    value={attributes[attribute] ?? 1}
                  />
                ))}
              </div>
            </section>

            <section className="character-card">
              <h3>Status Details</h3>

              <StatMeter
                label="Health"
                value={player.hp}
                max={player.maxHp}
                type="health"
              />

              <StatMeter
                label="Mana"
                value={player.mp}
                max={player.maxMp}
                type="mana"
              />

              <StatMeter
                label="Stamina"
                value={player.stamina}
                max={player.maxStamina}
                type="stamina"
              />

              <div className="character-grid">
                <InfoRow
                  label="HP Regen"
                  value={formatRegenValue(player.hpRegen)}
                />
                <InfoRow
                  label="Stamina Regen"
                  value={`${formatRegenValue(player.staminaRegen)}/s`}
                />
              </div>
            </section>

            <section className="character-card">
              <h3>Resources</h3>

              <InfoRow
                label={resources.gold.label}
                value={`${resources.gold.amount}g`}
                highlight
              />

              {discoveredResources.map(([resourceId, resource]) => (
                <InfoRow
                  key={resourceId}
                  label={resource.label}
                  value={resource.amount}
                />
              ))}

              {discoveredResources.length === 0 && (
                <p className="empty-note">No other resources discovered.</p>
              )}
            </section>
          </>
        )}

        {activeTab === "combat" && (
          <>
            <section className="character-card">
              <h3>Combat Foundation</h3>

              <div className="character-grid">
                <InfoRow
                  label="Combat Basics"
                  value={combatBasicsUnlocked ? "Unlocked" : "Locked"}
                  highlight={combatBasicsUnlocked}
                />
                <InfoRow
                  label="Combat Training"
                  value={combatTraining}
                  highlight={combatTraining > 0}
                />
                <InfoRow
                  label="Training Rank"
                  value={getCombatTrainingRank(combatTraining)}
                />
                <InfoRow
                  label="Basic Guard"
                  value={basicGuardUnlocked ? "Learned" : "Not learned"}
                  highlight={basicGuardUnlocked}
                />
              </div>
            </section>

            <section className="character-card">
              <h3>Derived Combat Stats</h3>

              <div className="character-grid">
                {derivedCombatStatOrder.map((statId) => (
                  <InfoRow
                    key={statId}
                    label={formatDerivedCombatStatLabel(statId)}
                    value={formatDerivedCombatStatValue(
                      statId,
                      derivedCombatStats[statId]
                    )}
                    highlight={
                      statId === "attackPower" ||
                      statId === "defense" ||
                      statId === "guardPower"
                    }
                  />
                ))}
              </div>
            </section>

            <section className="character-card character-card-wide">
              <h3>Combat Notes</h3>

              <p className="empty-note">
                These stats are calculated from attributes, combat training,
                and combat unlocks. They do not affect battle yet.
              </p>
            </section>
          </>
        )}

        {activeTab === "upgrades" && (
          <section className="character-card character-card-wide">
            <h3>Upgrades</h3>

            <div className="upgrade-list">
              {upgrades.map((upgrade) => {
                const level = getUpgradeLevel(gameState, upgrade.id);
                const maxed = isUpgradeMaxed(gameState, upgrade);
                const cost = getNextUpgradeCost(gameState, upgrade);

                return (
                  <div key={upgrade.id} className="upgrade-card">
                    <div className="upgrade-card-header">
                      <strong>{upgrade.label}</strong>
                      <span>
                        Lv. {level}/{upgrade.maxLevel}
                      </span>
                    </div>

                    <p>{upgrade.description}</p>

                    <div className="upgrade-card-footer">
                      <span>
                        {maxed
                          ? "Maxed"
                          : `Cost: ${formatResourceCost(cost, resources)}`}
                      </span>

                      <button
                        type="button"
                        disabled={maxed}
                        onClick={() => onPurchaseUpgrade(upgrade)}
                      >
                        {maxed ? "Max" : "Upgrade"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "items" && (
          <>
            <section className="character-card character-card-wide">
              <h3>Equipment</h3>

              <div className="equipment-grid">
                {equipmentSlots.map((slot) => {
                  const equippedItemId = equipment[slot.id];
                  const equippedItem = itemMap.get(equippedItemId);

                  return (
                    <div key={slot.id} className="equipment-slot">
                      <span className="equipment-slot-label">
                        {slot.label}
                      </span>

                      {equippedItem ? (
                        <>
                          <strong>{equippedItem.label}</strong>
                          <p>{equippedItem.description}</p>

                          <button
                            type="button"
                            onClick={() => onUnequipSlot(slot.id)}
                          >
                            Unequip
                          </button>
                        </>
                      ) : (
                        <>
                          <strong>Empty</strong>
                          <p>No item equipped in this slot.</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="character-card character-card-wide">
              <h3>Inventory</h3>

              <InventorySection
                title="Equipment Items"
                items={equipmentInventoryItems}
                equipment={equipment}
                onEquipItem={onEquipItem}
              />

              <InventorySection title="Key Items" items={keyItems} />

              {unknownItems.length > 0 && (
                <InventorySection title="Unknown Items" items={unknownItems} />
              )}

              {resolvedInventoryItems.length === 0 && (
                <p className="empty-note">No items discovered yet.</p>
              )}
            </section>
          </>
        )}
      </div>
    </section>
  );
}

function InventorySection({ title, items, equipment, onEquipItem }) {
  if (items.length === 0) {
    return (
      <div className="inventory-section">
        <h4>{title}</h4>
        <p className="empty-note">Nothing here yet.</p>
      </div>
    );
  }

  return (
    <div className="inventory-section">
      <h4>{title}</h4>

      <div className="inventory-list">
        {items.map(({ itemId, item, quantity }) => {
          if (!item) {
            return (
              <div key={itemId} className="inventory-item">
                <div>
                  <strong>{itemId}</strong>
                  <p>Unknown item.</p>
                </div>

                <span className="item-type-pill">x{quantity}</span>
              </div>
            );
          }

          const equippedSlotId = getEquippedSlotId(equipment, item.id);
          const canEquip = item.type === "equipment" && !equippedSlotId;

          return (
            <div key={item.id} className="inventory-item">
              <div>
                <strong>{item.label}</strong>
                <p>{item.description}</p>

                {equippedSlotId && (
                  <p className="empty-note">
                    Equipped in {formatEquipmentSlotLabel(equippedSlotId)}.
                  </p>
                )}
              </div>

              <div className="inventory-item-meta">
                <span className="item-type-pill">
                  {formatItemType(item)}
                </span>
                <span className="item-type-pill">{item.category}</span>
                <span className="item-type-pill">x{quantity}</span>

                {canEquip && (
                  <button
                    type="button"
                    onClick={() => onEquipItem(item.id)}
                  >
                    Equip
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getEquippedSlotId(equipment, itemId) {
  if (!equipment) {
    return null;
  }

  return Object.entries(equipment).find(([, equippedItemId]) => {
    return equippedItemId === itemId;
  })?.[0] || null;
}

function formatEquipmentSlotLabel(slotId) {
  const slot = equipmentSlots.find((entry) => entry.id === slotId);

  return slot?.label || slotId;
}

function formatItemType(item) {
  if (item.type === "equipment" && item.slot) {
    return item.slot;
  }

  if (item.type === "key_item") {
    return "key item";
  }

  return item.type || "item";
}

function getCombatTrainingRank(combatTraining) {
  if (combatTraining >= 5) {
    return "Guard Basics";
  }

  if (combatTraining > 0) {
    return "Beginner";
  }

  return "Untrained";
}

export default CharacterPage;