import ActionDetails from "./ActionDetails";
import Panel from "./ui/Panel";

function MainPage({
  player,
  resources,
  actionLog,
  storyLog,
  currentArea,
  currentAreaLabel,
  discoveredAreaGroups,
  availableActions,
  selectedAction,
  latestStoryBeat,
  currentAreaActions,
  onMoveToArea,
  onAction,
  onSelectAction,
}) {
  return (
    <section className="main-column">
      <div className="play-row">
        <Panel title="Areas">
          <div className="area-group-list">
            {discoveredAreaGroups.map((group) => (
              <div key={group.category} className="area-group">
                <h3>{group.category}</h3>

                <div className="button-list area-button-list">
                  {group.areas.map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      className={area.id === player.area ? "primary" : ""}
                      onClick={() => onMoveToArea(area)}
                    >
                      {area.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Actions" className="actions-panel">
          <div className="action-panel-body">
            <div className="button-list action-list-scroll">
              {availableActions.map((action) => {
                const isRestingAction =
                  action.startsResting && player.isResting;
                const isSelected = selectedAction?.id === action.id;

                return (
                  <button
                    key={action.id}
                    type="button"
                    className={isRestingAction || isSelected ? "primary" : ""}
                    disabled={isRestingAction}
                    onMouseEnter={() => onSelectAction(action.id)}
                    onFocus={() => onSelectAction(action.id)}
                    onClick={() => onAction(action)}
                  >
                    {isRestingAction ? "Resting..." : action.label}
                  </button>
                );
              })}

              {availableActions.length === 0 && (
                <p className="empty-note">No actions available here.</p>
              )}
            </div>

            <ActionDetails action={selectedAction} resources={resources} />
          </div>
        </Panel>

        <section className="panel story-panel">
          <div className="scene-header-block">
            <h1>{currentAreaLabel}</h1>

            <p>
              {currentArea?.description ||
                "You are somewhere unfamiliar. The path ahead is unclear."}
            </p>
          </div>

          <div className="scene-dashboard">
            <article className="scene-card scene-card-large">
              <h3>Latest Story Beat</h3>
              <p>{latestStoryBeat}</p>
            </article>

            <article className="scene-card">
              <h3>Available Actions</h3>

              {currentAreaActions.length > 0 ? (
                <div className="scene-action-chips">
                  {currentAreaActions.map((actionLabel) => (
                    <span key={actionLabel}>{actionLabel}</span>
                  ))}
                </div>
              ) : (
                <p>No actions available here.</p>
              )}
            </article>

            <article className="scene-card">
              <h3>Area Type</h3>
              <p>{currentArea?.category || "Unknown"}</p>
            </article>
          </div>
        </section>
      </div>

      <div className="log-row">
        <Panel title="Action Log">
          <ul className="log-list">
            {actionLog.map((entry, index) => (
              <li key={`${entry}-${index}`}>{entry}</li>
            ))}
          </ul>
        </Panel>

        <Panel title="Story Log">
          <ul className="log-list">
            {storyLog.map((entry, index) => (
              <li key={`${entry}-${index}`}>{entry}</li>
            ))}
          </ul>
        </Panel>
      </div>
    </section>
  );
}

export default MainPage;