import InfoGroup from "./ui/InfoGroup";
import InfoRow from "./ui/InfoRow";
import StatMeter from "./ui/StatMeter";

function QuickOverviewSidebar({ player, resources, discoveredResources }) {
  return (
    <aside className="panel stats-panel">
      <div className="panel-header">
        <h2>Character & Resources</h2>
      </div>

      <div className="stats-content">
        <InfoGroup title="Character">
          <InfoRow label="Name" value={player.name} />
          <InfoRow label="Gender" value={player.gender} />
          <InfoRow label="Level" value={player.level} />
          <InfoRow label="Path" value={player.path} />
        </InfoGroup>

        <InfoGroup title="Status">
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
        </InfoGroup>

        <InfoGroup title="Resources">
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
        </InfoGroup>
      </div>
    </aside>
  );
}

export default QuickOverviewSidebar;