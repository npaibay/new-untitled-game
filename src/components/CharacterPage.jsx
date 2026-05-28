import {
  formatResourceCost,
  getNextUpgradeCost,
  getUpgradeLevel,
  isUpgradeMaxed,
} from "../engine/upgradeSystem";
import { formatRegenValue } from "../utils/formatters";
import InfoRow from "./ui/InfoRow";
import StatMeter from "./ui/StatMeter";

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
  const discoveredResources = Object.entries(resources).filter(
    ([resourceId, resource]) => {
      return resourceId !== "gold" && resource.discovered;
    }
  );

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
            <section className="character-card">
              <h3>Equippable Items</h3>
              <p className="empty-note">No equippable items discovered yet.</p>
            </section>

            <section className="character-card">
              <h3>Inventory</h3>
              <p className="empty-note">
                Materials, key items, and equipment will appear here later.
              </p>
            </section>
          </>
        )}
      </div>
    </section>
  );
}

export default CharacterPage;