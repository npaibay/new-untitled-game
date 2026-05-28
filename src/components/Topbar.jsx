function Topbar({
  activePage,
  currentAreaLabel,
  player,
  onChangePage,
  onOpenModal,
}) {
  return (
    <header className="topbar">
      <nav className="nav-tabs" aria-label="Main navigation">
        <button
          className={activePage === "main" ? "nav-btn active" : "nav-btn"}
          type="button"
          onClick={() => onChangePage("main")}
        >
          Main
        </button>

        <button
          className={activePage === "character" ? "nav-btn active" : "nav-btn"}
          type="button"
          onClick={() => onChangePage("character")}
        >
          Character
        </button>

        <button className="nav-btn" type="button">
          Story
        </button>

        <button className="nav-btn" type="button">
          Relationships
        </button>

        <button className="nav-btn" type="button">
          Party
        </button>

        <button className="nav-btn" type="button">
          Codex
        </button>
      </nav>

      <div className="topbar-right">
        <div className="status-strip" aria-label="Current status">
          <span>Area: {currentAreaLabel}</span>
          <span>{player.day}</span>
          <span>Path: {player.path}</span>
        </div>

        <div className="top-actions">
          <button type="button" onClick={() => onOpenModal("save")}>
            Save
          </button>

          <button type="button" onClick={() => onOpenModal("load")}>
            Load
          </button>

          <button type="button" onClick={() => onOpenModal("reset")}>
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;