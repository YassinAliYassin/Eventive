/**
 * Property Studio — the tool shell: toolbar, tool rail, catalogue, the 2D/3D
 * panes and the inspector. State lives here; the panes stay presentational.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  DoorOpen,
  Download,
  Eye,
  Footprints,
  Grid3x3,
  Hand,
  Layers,
  Maximize2,
  MousePointer2,
  PanelRight,
  PenLine,
  Redo2,
  Ruler,
  Sofa,
  Square,
  SunMedium,
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
import { Button } from "./ui";

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
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [cameraMode, setCameraMode] = useState<CameraMode>("orbit");
  const [wallMode, setWallMode] = useState<WallMode>("full");
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);
  const [shadows, setShadows] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [fitToken, setFitToken] = useState(0);
  const [samplesOpen, setSamplesOpen] = useState(false);

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
      setSamplesOpen(false);
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

        <div className="relative">
          <button
            type="button"
            onClick={() => setSamplesOpen((open) => !open)}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-white/60 px-2.5 py-1.5 text-xs font-medium text-paper-dim transition hover:bg-white"
          >
            {plan.name}
            <ChevronDown className="h-3 w-3" />
          </button>
          {samplesOpen && (
            <div className="absolute left-0 top-full z-30 mt-1 w-64 rounded-xl border border-line bg-panel-raised p-1.5 shadow-lg backdrop-blur">
              <p className="px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-clay">
                Start from
              </p>
              {SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => startSample(sample.id)}
                  className="w-full rounded-lg px-2 py-1.5 text-left transition hover:bg-azure-soft"
                >
                  <span className="block text-xs font-medium text-paper-dim">{sample.name}</span>
                  <span className="block text-[10px] leading-snug text-ink-dim">{sample.blurb}</span>
                </button>
              ))}
            </div>
          )}
        </div>

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

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: "2d", label: "Plan" },
              { value: "split", label: "Split" },
              { value: "3d", label: "3D" },
            ]}
          />

          <IconButton
            label={showGrid ? "Hide grid" : "Show grid"}
            onClick={() => setShowGrid((value) => !value)}
            active={showGrid}
          >
            <Grid3x3 className="h-4 w-4" />
          </IconButton>
          <IconButton
            label={showDimensions ? "Hide dimensions" : "Show dimensions"}
            onClick={() => setShowDimensions((value) => !value)}
            active={showDimensions}
          >
            <Ruler className="h-4 w-4" />
          </IconButton>
          <IconButton
            label={showFurniture ? "Hide furnishings" : "Show furnishings"}
            onClick={() => setShowFurniture((value) => !value)}
            active={showFurniture}
          >
            <Sofa className="h-4 w-4" />
          </IconButton>
          <IconButton
            label={
              wallMode === "full"
                ? "Walls: full height"
                : wallMode === "low"
                  ? "Walls: dollhouse"
                  : "Walls: hidden"
            }
            onClick={() =>
              setWallMode((mode) => (mode === "full" ? "low" : mode === "low" ? "none" : "full"))
            }
            active={wallMode !== "full"}
          >
            <Eye className="h-4 w-4" />
          </IconButton>
          <IconButton
            label={shadows ? "Shadows on" : "Shadows off"}
            onClick={() => setShadows((value) => !value)}
            active={shadows}
          >
            <SunMedium className="h-4 w-4" />
          </IconButton>
          <IconButton
            label={cameraMode === "walk" ? "Exit walkthrough" : "Walk through"}
            onClick={() => {
              if (viewMode === "2d") setViewMode("split");
              setCameraMode(cameraMode === "walk" ? "orbit" : "walk");
            }}
            active={cameraMode === "walk"}
          >
            <Footprints className="h-4 w-4" />
          </IconButton>
          <IconButton label="Fit both views" onClick={() => setFitToken((token) => token + 1)}>
            <Maximize2 className="h-4 w-4" />
          </IconButton>

          <div className="h-5 w-px bg-line" />

          <Button onClick={exportPng} title="Download the 2D plan as PNG">
            <Download className="h-3.5 w-3.5" /> Plan
          </Button>
          <Button onClick={exportRender} title="Download the 3D view as PNG">
            <Camera className="h-3.5 w-3.5" /> Render
          </Button>
          <Button onClick={exportJson} title="Download the editable plan file">
            <Download className="h-3.5 w-3.5" /> JSON
          </Button>
          <Button onClick={() => fileRef.current?.click()} title="Open a plan file">
            <Upload className="h-3.5 w-3.5" /> Open
          </Button>
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

      <div className="flex min-h-0 flex-1">
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

        {/* Catalogue */}
        {tool === "item" && (
          <aside className="hidden w-60 flex-shrink-0 border-r border-line bg-panel md:block">
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
          <aside className="hidden w-72 flex-shrink-0 overflow-y-auto border-l border-line bg-panel md:block">
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
