import { items } from "../data/items";
import {
  formatResourceCost,
  getNextUpgradeCost,
  getUpgradeLevel,
  isUpgradeMaxed,
} from "../engine/upgradeSystem";
import { formatRegenValue } from "../utils/formatters";
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

function CharacterPage({
  player,
  resources,
  gameState,
  currentAreaLabel,
  upgrades,
  activeTab,
  onChangeTab,
  onPurchaseUpgrade,
}) {
  const itemMap = new Map(items.map((item) => [item.id, item]));

  const discoveredResources = Object.entries(resources).filter(
    ([resourceId, resource]) => {
      return resourceId !== "gold" && resource.discovered;
    }
  );

  const inventoryItems = gameState.inventory?.items || [];
  const equipment = gameState.equipment || {};

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
        <h2>Character Overview</h2>
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

function InventorySection({ title, items }) {
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

          return (
            <div key={item.id} className="inventory-item">
              <div>
                <strong>{item.label}</strong>
                <p>{item.description}</p>
              </div>

              <div className="inventory-item-meta">
                <span className="item-type-pill">
                  {formatItemType(item)}
                </span>
                <span className="item-type-pill">{item.category}</span>
                <span className="item-type-pill">x{quantity}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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

export default CharacterPage;