import { useEffect, useState } from "react";
import { processGameTick } from "./engine/tickSystem";

import { actions } from "./data/actions";
import { areas } from "./data/areas";

import { createGameState } from "./engine/createGameState";
import { performAction } from "./engine/actionSystem";
import { moveToArea } from "./engine/areaSystem";
import {
  getAvailableActions,
  getAreaById,
  getAreaLabel,
  getDiscoveredAreas,
  getDiscoveredResources,
} from "./engine/selectors";
import {
  clearAllSaveSlots,
  clearSaveSlot,
  getSaveSlotSummaries,
  loadGameFromSlot,
  loadLastUsedSave,
  saveGameToSlot,
} from "./engine/saveSystem";

function App() {
  const [gameState, setGameState] = useState(() => {
    return loadLastUsedSave() || createGameState();
  });

  const [activeModal, setActiveModal] = useState(null);
  const [saveSlots, setSaveSlots] = useState(() => getSaveSlotSummaries());

  const { player, resources, actionLog, storyLog, unlocks } = gameState;

  const currentArea = getAreaById(areas, player.area);
  const currentAreaLabel = getAreaLabel(areas, player.area);
  const discoveredAreas = getDiscoveredAreas(areas, unlocks);
  const availableActions = getAvailableActions(actions, player.area, unlocks);
  const discoveredResources = getDiscoveredResources(resources);
  const latestStoryBeat = storyLog[0] || "No major story events yet.";
  const currentAreaActions = availableActions.map((action) => action.label)

  useEffect(() => {
    let lastTime = Date.now();

    const intervalId = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;

      setGameState((currentState) =>
        processGameTick(currentState, deltaSeconds)
      );
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  function addSystemLog(currentState, message) {
    return {
      ...currentState,
      actionLog: [message, ...currentState.actionLog].slice(0, 50),
    };
  }

  function refreshSaveSlots() {
    setSaveSlots(getSaveSlotSummaries());
  }

  function openModal(modalType) {
    refreshSaveSlots();
    setActiveModal(modalType);
  }

  function closeModal() {
    setActiveModal(null);
  }

  function handleMoveToArea(area) {
    setGameState((currentState) => moveToArea(currentState, area));
  }

  function handleAction(action) {
    setGameState((currentState) => performAction(currentState, action));
  }

  function handleSaveToSlot(slotId) {
    const nextState = addSystemLog(gameState, `Game saved to Slot ${slotId}.`);

    saveGameToSlot(slotId, nextState);
    setGameState(nextState);
    refreshSaveSlots();
    closeModal();
  }

  function handleLoadFromSlot(slotId) {
    const savedState = loadGameFromSlot(slotId);

    if (!savedState) {
      setGameState((currentState) =>
        addSystemLog(currentState, `Slot ${slotId} is empty.`)
      );

      return;
    }

    setGameState(addSystemLog(savedState, `Loaded Slot ${slotId}.`));
    refreshSaveSlots();
    closeModal();
  }

  function handleDeleteSlot(slotId) {
    clearSaveSlot(slotId);
    refreshSaveSlots();

    setGameState((currentState) =>
      addSystemLog(currentState, `Deleted Slot ${slotId}.`)
    );
  }

  function handleResetCurrentGame() {
    const resetState = createGameState();

    setGameState(addSystemLog(resetState, "Current game reset."));
    closeModal();
  }

  function handleDeleteAllSaves() {
    clearAllSaveSlots();

    const resetState = createGameState();

    setGameState(addSystemLog(resetState, "All save slots deleted."));
    refreshSaveSlots();
    closeModal();
  }

  return (
    <div className="app">
      <header className="topbar">
        <nav className="nav-tabs">
          <button className="nav-btn active">Main</button>
          <button className="nav-btn">Story</button>
          <button className="nav-btn">Relationships</button>
          <button className="nav-btn">Party</button>
          <button className="nav-btn">Codex</button>
        </nav>

        <div className="topbar-right">
          <div className="status-strip">
            <span>Area: {currentAreaLabel}</span>
            <span>{player.day}</span>
            <span>Path: {player.path}</span>
          </div>

          <div className="top-actions">
            <button type="button" onClick={() => openModal("save")}>
              Save
            </button>

            <button type="button" onClick={() => openModal("load")}>
              Load
            </button>

            <button type="button" onClick={() => openModal("reset")}>
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="game-layout">
        <section className="main-column">
          <div className="play-row">
            <Panel title="Areas">
              <div className="button-list">
                {discoveredAreas.map((area) => (
                  <button
                    key={area.id}
                    type="button"
                    className={area.id === player.area ? "primary" : ""}
                    onClick={() => handleMoveToArea(area)}
                  >
                    {area.label}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Actions">
              <div className="button-list">
                {availableActions.map((action) => {
                  const isRestingAction =
                    action.startsResting && player.isResting;

                  return (
                    <button
                      key={action.id}
                      type="button"
                      className={isRestingAction ? "primary" : ""}
                      disabled={isRestingAction}
                      onClick={() => handleAction(action)}
                    >
                      {isRestingAction ? "Resting..." : action.label}
                    </button>
                  );
                })}

                {availableActions.length === 0 && (
                  <p className="empty-note">No actions available here.</p>
                )}
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

              <div className="scene-detail-grid">
                <article className="scene-card scene-card-large">
                  <h3>Latest Story Beat</h3>
                  <p>{latestStoryBeat}</p>
                </article>

                <article className="scene-card">
                  <h3>Available Actions</h3>
                  
                  {currentAreaActions.length > 0 ? (
                    <p>{currentAreaActions.join(" . ")}</p>
                  ) : (
                    <p>No actions available here.</p>
                  )}
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
      </main>

      {activeModal && (
        <SaveSlotModal
          mode={activeModal}
          slots={saveSlots}
          onClose={closeModal}
          onSave={handleSaveToSlot}
          onLoad={handleLoadFromSlot}
          onDeleteSlot={handleDeleteSlot}
          onResetCurrentGame={handleResetCurrentGame}
          onDeleteAllSaves={handleDeleteAllSaves}
        />
      )}
    </div>
  );
}

function SaveSlotModal({
  mode,
  slots,
  onClose,
  onSave,
  onLoad,
  onDeleteSlot,
  onResetCurrentGame,
  onDeleteAllSaves,
}) {
  const title = {
    save: "Save Game",
    load: "Load Game",
    reset: "Reset / Delete Saves",
  }[mode];

  return (
    <div className="modal-backdrop">
      <section className="modal-panel">
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>

        {mode === "reset" && (
          <div className="modal-danger-zone">
            <button type="button" onClick={onResetCurrentGame}>
              Reset Current Game
            </button>

            <button type="button" onClick={onDeleteAllSaves}>
              Delete All Save Slots
            </button>
          </div>
        )}

        <div className="save-slot-list">
          {slots.map((slot) => (
            <SaveSlotCard
              key={slot.slotId}
              mode={mode}
              slot={slot}
              onSave={onSave}
              onLoad={onLoad}
              onDeleteSlot={onDeleteSlot}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function SaveSlotCard({ mode, slot, onSave, onLoad, onDeleteSlot }) {
  const areaLabel = slot.areaId ? getAreaLabel(areas, slot.areaId) : null;

  return (
    <div className="save-slot-card">
      <div className="save-slot-info">
        <strong>Slot {slot.slotId}</strong>

        {slot.hasSave ? (
          <>
            <span>
              {slot.playerName || "Player"} · Level {slot.level ?? 1}
            </span>
            <span>{areaLabel || "Unknown Area"}</span>
            <span>{slot.day || "Unknown Day"}</span>
            <span>{formatSlotDate(slot.savedAt)}</span>
          </>
        ) : (
          <span>Empty Slot</span>
        )}
      </div>

      <div className="save-slot-actions">
        {mode === "save" && (
          <button type="button" onClick={() => onSave(slot.slotId)}>
            {slot.hasSave ? "Overwrite" : "Save"}
          </button>
        )}

        {mode === "load" && (
          <button
            type="button"
            disabled={!slot.hasSave}
            onClick={() => onLoad(slot.slotId)}
          >
            Load
          </button>
        )}

        {mode === "reset" && (
          <button
            type="button"
            disabled={!slot.hasSave}
            onClick={() => onDeleteSlot(slot.slotId)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function formatSlotDate(savedAt) {
  if (!savedAt) return "No save date";

  return new Date(savedAt).toLocaleString();
}

function Panel({ title, children }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
      </div>

      {children}
    </section>
  );
}

function InfoGroup({ title, children }) {
  return (
    <div className="info-group">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function InfoRow({ label, value, highlight = false }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong className={highlight ? "gold-text" : ""}>{value}</strong>
    </div>
  );
}

function StatMeter({ label, value, max, type }) {
  const percent =
    max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  const displayValue = formatStatValue(value, type);
  const displayMax = formatStatValue(max, "max");

  return (
    <div className="stat-meter">
      <div className="stat-meter-top">
        <span>{label}</span>
        <strong>
          {displayValue}/{displayMax}
        </strong>
      </div>

      <div className="stat-track">
        <div
          className={`stat-fill stat-fill-${type}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function formatStatValue(value, type) {
  if (type === "stamina") {
    const rounded = Math.round(value * 10) / 10;

    return Number.isInteger(rounded)
      ? String(rounded)
      : rounded.toFixed(1);
  }

  return String(Math.round(value));
}

export default App;