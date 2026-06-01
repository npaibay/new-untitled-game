import { useEffect, useState } from "react";
import { processGameTick } from "./engine/tickSystem";

import { actions } from "./data/actions";
import { areas } from "./data/areas";
import { upgrades } from "./data/upgrades";

import { createGameState } from "./engine/createGameState";
import { performAction } from "./engine/actionSystem";
import { moveToArea } from "./engine/areaSystem";
import { equipItem, unequipSlot } from "./engine/equipmentSystem";
import {
  getAvailableActions,
  getAreaById,
  getAreaLabel,
  getDiscoveredAreaGroups,
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
import { purchaseUpgrade } from "./engine/upgradeSystem";

import Topbar from "./components/Topbar";
import MainPage from "./components/MainPage";
import CharacterPage from "./components/CharacterPage";
import QuickOverviewSidebar from "./components/QuickOverviewSidebar";
import SaveSlotModal from "./components/SaveSlotModal";

function App() {
  const [gameState, setGameState] = useState(() => {
    return loadLastUsedSave() || createGameState();
  });

  const [activeModal, setActiveModal] = useState(null);
  const [saveSlots, setSaveSlots] = useState(() => getSaveSlotSummaries());
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [activePage, setActivePage] = useState("main");
  const [characterTab, setCharacterTab] = useState("overview");

  const { player, resources, actionLog, storyLog, unlocks } = gameState;

  const currentArea = getAreaById(areas, player.area);
  const currentAreaLabel = getAreaLabel(areas, player.area);
  const discoveredAreaGroups = getDiscoveredAreaGroups(areas, unlocks);
  const availableActions = getAvailableActions(actions, player.area, unlocks);
  const discoveredResources = getDiscoveredResources(resources);

  const latestStoryBeat = storyLog[0] || "No major story events yet.";
  const currentAreaActions = availableActions.map((action) => action.label);

  const selectedAction =
    availableActions.find((action) => action.id === selectedActionId) ||
    availableActions[0] ||
    null;

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

  function handlePurchaseUpgrade(upgrade) {
    setGameState((currentState) => purchaseUpgrade(currentState, upgrade));
  }

  function handleEquipItem(itemId, preferredSlotId = null) {
    setGameState((currentState) =>
      equipItem(currentState, itemId, preferredSlotId)
    );
  }

  function handleUnequipSlot(slotId) {
    setGameState((currentState) => unequipSlot(currentState, slotId));
  }

  function handleMoveToArea(area) {
    setSelectedActionId(null);
    setGameState((currentState) => moveToArea(currentState, area));
  }

  function handleAction(action) {
    setSelectedActionId(action.id);
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

    setSelectedActionId(null);
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

    setSelectedActionId(null);
    setActivePage("main");
    setCharacterTab("overview");
    setGameState(addSystemLog(resetState, "Current game reset."));
    closeModal();
  }

  function handleDeleteAllSaves() {
    clearAllSaveSlots();

    const resetState = createGameState();

    setSelectedActionId(null);
    setActivePage("main");
    setCharacterTab("overview");
    setGameState(addSystemLog(resetState, "All save slots deleted."));
    refreshSaveSlots();
    closeModal();
  }

  return (
    <div className="app">
      <Topbar
        activePage={activePage}
        currentAreaLabel={currentAreaLabel}
        player={player}
        onChangePage={setActivePage}
        onOpenModal={openModal}
      />

      <main
        className={
          activePage === "character"
            ? "game-layout character-layout"
            : "game-layout"
        }
      >
        {activePage === "main" ? (
          <>
            <MainPage
              player={player}
              resources={resources}
              actionLog={actionLog}
              storyLog={storyLog}
              currentArea={currentArea}
              currentAreaLabel={currentAreaLabel}
              discoveredAreaGroups={discoveredAreaGroups}
              availableActions={availableActions}
              selectedAction={selectedAction}
              latestStoryBeat={latestStoryBeat}
              currentAreaActions={currentAreaActions}
              onMoveToArea={handleMoveToArea}
              onAction={handleAction}
              onSelectAction={setSelectedActionId}
            />

            <QuickOverviewSidebar
              player={player}
              resources={resources}
              discoveredResources={discoveredResources}
            />
          </>
        ) : (
          <CharacterPage
            player={player}
            resources={resources}
            gameState={gameState}
            currentAreaLabel={currentAreaLabel}
            upgrades={upgrades}
            activeTab={characterTab}
            onChangeTab={setCharacterTab}
            onPurchaseUpgrade={handlePurchaseUpgrade}
            onEquipItem={handleEquipItem}
            onUnequipSlot={handleUnequipSlot}
          />
        )}
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

export default App;