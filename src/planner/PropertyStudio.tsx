/**
 * Property Studio — the tool shell: toolbar, tool rail, catalogue, the 2D/3D
 * panes and the inspector. State lives here; the panes stay presentational.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  FileDown,
  Home,
  SlidersHorizontal,
  X,
  DoorOpen,
  Download,
  Footprints,
  Hand,
  Layers,
  Maximize2,
  MousePointer2,
  PanelRight,
  PenLine,
  Redo2,
  Sofa,
  Square,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";
import { CatalogPanel } from "./CatalogPanel";
import { Inspector } from "./Inspector";
import { Plan2D } from "./Plan2D";
import { View3D } from "./View3D";
import { detectRooms } from "./geometry";
import {
  removeCorner,
  removeItem,
  removeOpening,
  removeWall,
} from "./operations";
import { createSample, SAMPLES } from "./samples";
import type { PropertyScene, WallMode, CameraMode } from "./scene3d";
import { loadSavedPlan, normalizePlan, usePlanner } from "./store";
import type { Plan, Selection, Tool } from "./types";
import { Menu, MenuItem, Toggle } from "./ui";

type ViewMode = "2d" | "split" | "3d";

const TOOLS: Array<{ tool: Tool; label: string; icon: typeof MousePointer2; key: string }> = [
  { tool: "select", label: "Select & move", icon: MousePointer2, key: "V" },
  { tool: "wall", label: "Draw walls", icon: PenLine, key: "W" },
  { tool: "room", label: "Rectangular room", icon: Square, key: "R" },
  { tool: "door", label: "Door", icon: DoorOpen, key: "D" },
  { tool: "window", label: "Window", icon: Layers, key: "N" },
  { tool: "item", label: "Furnishings", icon: Sofa, key: "F" },
  { tool: "pan", label: "Pan view", icon: Hand, key: "H" },
];

export function PropertyStudio() {
  const initial = useMemo<Plan>(() => loadSavedPlan() ?? createSample("house"), []);
  const { plan, apply, checkpoint, undo, redo, load, canUndo, canRedo } = usePlanner(initial);

  const [selection, setSelection] = useState<Selection | null>(null);
  const [tool, setTool] = useState<Tool>("select");
  const [pendingCatalogId, setPendingCatalogId] = useState<string | null>(null);
  // A phone cannot usefully show two panes or a docked inspector at once.
  const wideScreen = typeof window === "undefined" || window.innerWidth >= 1024;
  const [viewMode, setViewMode] = useState<ViewMode>(wideScreen ? "split" : "2d");
  const [cameraMode, setCameraMode] = useState<CameraMode>("orbit");
  const [wallMode, setWallMode] = useState<WallMode>("full");
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);
  const [shadows, setShadows] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(wideScreen);
  const [fitToken, setFitToken] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<PropertyScene | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const rooms = useMemo(() => detectRooms(plan), [plan]);

  /* ---------------- commands ---------------- */

  const deleteSelection = useCallback(() => {
    if (!selection) return;
    apply((current) => {
      switch (selection.kind) {
        case "item":
          return removeItem(current, selection.id);
        case "wall":
          return removeWall(current, selection.id);
        case "corner":
          return removeCorner(current, selection.id);
        case "opening":
          return selection.parentId
            ? removeOpening(current, selection.parentId, selection.id)
            : current;
        default:
          return current;
      }
    });
    setSelection(null);
  }, [apply, selection]);

  const pickTool = useCallback((next: Tool) => {
    setTool(next);
    if (next !== "item") setPendingCatalogId(null);
  }, []);

  const startSample = useCallback(
    (id: string) => {
      load(createSample(id));
      setSelection(null);
      setFitToken((token) => token + 1);
    },
    [load]
  );

  const exportJson = useCallback(() => {
    download(
      `${slug(plan.name)}.plan.json`,
      new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" })
    );
  }, [plan]);

  const importJson = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        load(normalizePlan(JSON.parse(text)));
        setSelection(null);
        setFitToken((token) => token + 1);
      } catch {
        window.alert("That file could not be read as a property plan.");
      }
    },
    [load]
  );

  const exportPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) download(`${slug(plan.name)}-plan.png`, blob);
    });
  }, [plan.name]);

  const exportRender = useCallback(() => {
    const data = sceneRef.current?.screenshot();
    if (!data) return;
    const link = document.createElement("a");
    link.href = data;
    link.download = `${slug(plan.name)}-3d.png`;
    link.click();
  }, [plan.name]);

  // Panes change size when the layout switches, so re-frame both views.
  useEffect(() => {
    setFitToken((token) => token + 1);
  }, [viewMode]);

  /* ---------------- keyboard ---------------- */

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (event.metaKey || event.ctrlKey) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelection();
        return;
      }

      const shortcut = TOOLS.find((entry) => entry.key.toLowerCase() === event.key.toLowerCase());
      // "R" nudges a selected item's rotation in the plan view, so only take it
      // as a tool shortcut when nothing is selected.
      if (shortcut && !(shortcut.key === "R" && selection?.kind === "item")) {
        pickTool(shortcut.tool);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteSelection, pickTool, redo, selection, undo]);

  /* ---------------- render ---------------- */

  const show2D = viewMode !== "3d";
  const show3D = viewMode !== "2d";

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-canvas text-ink">
      {/* Top bar */}
      <header className="z-20 flex flex-wrap items-center gap-2 border-b border-line bg-panel-raised px-3 py-2 backdrop-blur">
        <a
          href="/"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-ink-dim transition hover:bg-white/60 hover:text-azure"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Eventive
        </a>

        <div className="h-5 w-px bg-line" />

        <Menu label={plan.name} icon={<Home className="h-3.5 w-3.5" />} align="left">
          {(close) => (
            <>
              <p className="px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-clay">
                Start from
              </p>
              {SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    startSample(sample.id);
                    close();
                  }}
                  className="w-full rounded-lg px-2 py-1.5 text-left transition hover:bg-azure-soft"
                >
                  <span className="block text-xs font-medium text-paper-dim">{sample.name}</span>
                  <span className="block text-[10px] leading-snug text-ink-dim">{sample.blurb}</span>
                </button>
              ))}
            </>
          )}
        </Menu>

        <div className="flex items-center gap-1">
          <IconButton label="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo}>
            <Undo2 className="h-4 w-4" />
          </IconButton>
          <IconButton label="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={!canRedo}>
            <Redo2 className="h-4 w-4" />
          </IconButton>
          <IconButton label="Delete selection" onClick={deleteSelection} disabled={!selection}>
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: "2d", label: "Plan" },
              { value: "split", label: "Split" },
              { value: "3d", label: "3D" },
            ]}
          />

          <Menu label="View" icon={<SlidersHorizontal className="h-3.5 w-3.5" />}>
            <div className="space-y-1.5">
              <Toggle label="Grid" checked={showGrid} onChange={setShowGrid} />
              <Toggle label="Dimensions" checked={showDimensions} onChange={setShowDimensions} />
              <Toggle label="Furnishings" checked={showFurniture} onChange={setShowFurniture} />
              <Toggle label="Shadows" checked={shadows} onChange={setShadows} />
              <div className="pt-1">
                <p className="px-1 pb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-clay">
                  Walls in 3D
                </p>
                <div className="flex rounded-lg border border-line bg-white/50 p-0.5">
                  {(["full", "low", "none"] as WallMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setWallMode(mode)}
                      className={`flex-1 rounded-md px-2 py-1 text-[11px] font-medium capitalize transition ${
                        wallMode === mode ? "bg-azure text-white" : "text-ink-dim hover:text-azure"
                      }`}
                    >
                      {mode === "low" ? "Dollhouse" : mode}
                    </button>
                  ))}
                </div>
              </div>
              <MenuItem
                icon={<Footprints className="h-3.5 w-3.5" />}
                onClick={() => {
                  if (viewMode === "2d") setViewMode(wideScreen ? "split" : "3d");
                  setCameraMode(cameraMode === "walk" ? "orbit" : "walk");
                }}
              >
                {cameraMode === "walk" ? "Exit walkthrough" : "Walk through"}
              </MenuItem>
              <MenuItem
                icon={<Maximize2 className="h-3.5 w-3.5" />}
                onClick={() => setFitToken((token) => token + 1)}
              >
                Fit both views
              </MenuItem>
            </div>
          </Menu>

          <Menu label="Export" icon={<FileDown className="h-3.5 w-3.5" />}>
            {(close) => (
              <>
                <MenuItem
                  icon={<Download className="h-3.5 w-3.5" />}
                  onClick={() => {
                    exportPng();
                    close();
                  }}
                >
                  Plan as PNG
                </MenuItem>
                <MenuItem
                  icon={<Camera className="h-3.5 w-3.5" />}
                  onClick={() => {
                    exportRender();
                    close();
                  }}
                >
                  3D view as PNG
                </MenuItem>
                <MenuItem
                  icon={<Download className="h-3.5 w-3.5" />}
                  onClick={() => {
                    exportJson();
                    close();
                  }}
                >
                  Editable plan (JSON)
                </MenuItem>
                <MenuItem
                  icon={<Upload className="h-3.5 w-3.5" />}
                  onClick={() => {
                    fileRef.current?.click();
                    close();
                  }}
                >
                  Open a plan file
                </MenuItem>
              </>
            )}
          </Menu>

          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importJson(file);
              event.target.value = "";
            }}
          />
          <IconButton
            label={inspectorOpen ? "Hide properties" : "Show properties"}
            onClick={() => setInspectorOpen((open) => !open)}
            active={inspectorOpen}
          >
            <PanelRight className="h-4 w-4" />
          </IconButton>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* Tool rail */}
        <nav className="z-10 flex w-12 flex-col items-center gap-1 border-r border-line bg-panel py-2">
          {TOOLS.map(({ tool: value, label, icon: Icon, key }) => (
            <button
              key={value}
              type="button"
              title={`${label} (${key})`}
              onClick={() => pickTool(value)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                tool === value
                  ? "border-azure bg-azure text-white shadow-sm"
                  : "border-transparent text-ink-dim hover:bg-white/70 hover:text-azure"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </nav>

        {/* Catalogue — docked on wide screens, a slide-over on narrow ones */}
        {tool === "item" && (
          <aside className="absolute inset-y-0 left-12 z-30 w-60 border-r border-line bg-panel-raised backdrop-blur-xl shadow-2xl md:static md:z-auto md:w-60 md:flex-shrink-0 md:bg-panel md:shadow-none">
            <button
              type="button"
              onClick={() => pickTool("select")}
              aria-label="Close catalogue"
              className="absolute right-2 top-2 z-10 rounded-lg p-1 text-ink-dim transition hover:bg-white hover:text-azure md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
            <CatalogPanel
              selectedId={pendingCatalogId}
              onPick={setPendingCatalogId}
              units={plan.settings.units}
            />
          </aside>
        )}

        {/* Viewports */}
        <main className="flex min-w-0 flex-1 flex-col lg:flex-row">
          {show2D && (
            <div
              className={`relative min-h-0 border-line ${
                show3D ? "flex-1 border-b lg:border-b-0 lg:border-r" : "flex-1"
              }`}
            >
              <Plan2D
                plan={plan}
                rooms={rooms}
                tool={tool}
                onToolChange={pickTool}
                pendingCatalogId={pendingCatalogId}
                selection={selection}
                onSelect={setSelection}
                apply={apply}
                checkpoint={checkpoint}
                options={{ grid: showGrid, dimensions: showDimensions, furniture: showFurniture }}
                fitToken={fitToken}
                canvasRef={canvasRef}
              />
              <ViewBadge label="Plan" />
            </div>
          )}

          {show3D && (
            <div className="relative min-h-0 flex-1">
              <View3D
                plan={plan}
                rooms={rooms}
                selection={selection}
                onSelect={setSelection}
                apply={apply}
                checkpoint={checkpoint}
                options={{ wallMode, showFurniture, showGround: true, shadows }}
                mode={cameraMode}
                onModeChange={setCameraMode}
                fitToken={fitToken}
                sceneRef={sceneRef}
              />
              <ViewBadge label={cameraMode === "walk" ? "Walkthrough" : "3D"} />
            </div>
          )}
        </main>

        {/* Inspector */}
        {inspectorOpen && (
          <aside className="absolute inset-x-0 bottom-0 z-30 max-h-[46%] overflow-y-auto border-t border-line bg-panel-raised backdrop-blur-xl shadow-2xl md:static md:z-auto md:max-h-none md:w-72 md:flex-shrink-0 md:border-l md:border-t-0 md:bg-panel md:shadow-none">
            <Inspector
              plan={plan}
              rooms={rooms}
              selection={selection}
              onSelect={setSelection}
              apply={apply}
              onRename={(name) => apply((current) => ({ ...current, name }))}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Chrome
 * ------------------------------------------------------------------ */

function IconButton({
  children,
  label,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? "border-azure/40 bg-azure-soft text-azure-bright"
          : "border-line bg-white/50 text-ink-dim hover:bg-white hover:text-azure"
      }`}
    >
      {children}
    </button>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="flex rounded-lg border border-line bg-white/50 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
            value === option.value ? "bg-azure text-white" : "text-ink-dim hover:text-azure"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ViewBadge({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-line-soft bg-panel-raised px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-dim backdrop-blur">
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function download(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "property"
  );
}
