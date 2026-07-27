/** Right-hand properties panel — everything selectable is editable here. */

import { Trash2, Copy, DoorOpen, Ruler } from "lucide-react";
import { catalogEntry } from "./catalog";
import { cornerMap, formatArea, formatLength, uid, wallLength } from "./geometry";
import type { Room } from "./geometry";
import { isEventLayout, planMetrics, STANDING_AREA_PER_GUEST } from "./metrics";
import {
  duplicateItem,
  moveCorner,
  removeCorner,
  removeItem,
  removeOpening,
  removeWall,
  setRoomStyle,
  setWallLength,
  updateItem,
  updateOpening,
  updateSettings,
  updateWall,
} from "./operations";
import type { Opening, OpeningType, Plan, Selection, Units } from "./types";
import { OPENING_LABELS } from "./types";
import {
  Button,
  ColorRow,
  EmptyHint,
  Field,
  NumberInput,
  Section,
  Select,
  Slider,
  Stat,
  TextInput,
  Toggle,
} from "./ui";

const FLOOR_SWATCHES = ["#c9a97e", "#a8794f", "#d9cdb8", "#cfcac0", "#c3ccd2", "#b7c3a8", "#9d8e7a"];
const ITEM_SWATCHES = ["#8ea3bd", "#b2856f", "#a8794f", "#f0ece4", "#c9a961", "#4f7d52", "#3a3f47"];

interface InspectorProps {
  plan: Plan;
  rooms: Room[];
  selection: Selection | null;
  onSelect: (selection: Selection | null) => void;
  apply: (mutator: (plan: Plan) => Plan, options?: { silent?: boolean }) => void;
  onRename: (name: string) => void;
}

export function Inspector(props: InspectorProps) {
  const { plan, rooms, selection, apply } = props;

  if (!selection) return <PlanPanel {...props} />;

  switch (selection.kind) {
    case "room": {
      const room = rooms.find((r) => r.id === selection.id);
      if (!room) return <PlanPanel {...props} />;
      const style = plan.rooms[room.id] ?? {};
      return (
        <>
          <Section title="Room">
            <Field label="Name">
              <TextInput
                value={style.name ?? ""}
                placeholder="Room"
                className="w-36"
                onChange={(name) => apply((current) => setRoomStyle(current, room.id, { name }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Floor area" value={formatArea(room.area, plan.settings.units)} />
              <Stat label="Walls" value={`${room.cornerIds.length}`} />
            </div>
          </Section>
          <Section title="Floor finish">
            <ColorRow
              value={style.floorColor ?? "#c9a97e"}
              swatches={FLOOR_SWATCHES}
              onChange={(floorColor) =>
                apply((current) => setRoomStyle(current, room.id, { floorColor }))
              }
            />
          </Section>
        </>
      );
    }

    case "wall": {
      const wall = plan.walls.find((w) => w.id === selection.id);
      if (!wall) return <PlanPanel {...props} />;
      const length = wallLength(wall, cornerMap(plan));
      return (
        <>
          <Section title="Wall">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Length" value={formatLength(length, plan.settings.units)} />
              <Stat
                label="Face area"
                value={formatArea(length * wall.height, plan.settings.units)}
              />
            </div>
            <Field label="Set length">
              <NumberInput
                value={length}
                step={0.05}
                min={0.1}
                suffix="m"
                onChange={(next) => apply((current) => setWallLength(current, wall.id, next))}
              />
            </Field>
            <Field label="Height">
              <NumberInput
                value={wall.height}
                step={0.05}
                min={0.3}
                max={12}
                suffix="m"
                onChange={(height) => apply((current) => updateWall(current, wall.id, { height }))}
              />
            </Field>
            <Field label="Thickness">
              <NumberInput
                value={wall.thickness}
                step={0.01}
                min={0.03}
                max={1}
                suffix="m"
                onChange={(thickness) =>
                  apply((current) => updateWall(current, wall.id, { thickness }))
                }
              />
            </Field>
            <Toggle
              label="Exterior wall"
              checked={wall.exterior !== false}
              onChange={(exterior) => apply((current) => updateWall(current, wall.id, { exterior }))}
            />
          </Section>

          <Section title={`Openings (${wall.openings.length})`}>
            {wall.openings.length === 0 && (
              <EmptyHint>
                Pick the door, window or opening tool and click this wall to cut one in.
              </EmptyHint>
            )}
            <div className="space-y-1.5">
              {wall.openings.map((opening) => (
                <button
                  key={opening.id}
                  type="button"
                  onClick={() =>
                    props.onSelect({ kind: "opening", id: opening.id, parentId: wall.id })
                  }
                  className="flex w-full items-center justify-between rounded-lg border border-line bg-white/50 px-2.5 py-1.5 text-xs text-paper-dim transition hover:border-azure/40 hover:bg-azure-soft"
                >
                  <span className="flex items-center gap-2">
                    <DoorOpen className="h-3.5 w-3.5 text-clay" />
                    {OPENING_LABELS[opening.type]}
                  </span>
                  <span className="font-mono text-[10px] text-ink-dim">
                    {formatLength(opening.width, plan.settings.units)}
                  </span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Actions">
            <Button
              variant="danger"
              className="w-full"
              onClick={() => {
                apply((current) => removeWall(current, wall.id));
                props.onSelect(null);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete wall
            </Button>
          </Section>
        </>
      );
    }

    case "opening": {
      const wall = plan.walls.find((w) => w.id === selection.parentId);
      const opening = wall?.openings.find((o) => o.id === selection.id);
      if (!wall || !opening) return <PlanPanel {...props} />;
      const length = wallLength(wall, cornerMap(plan));
      const patch = (values: Partial<Opening>) =>
        apply((current) => updateOpening(current, wall.id, opening.id, values));
      return (
        <>
          <Section title={OPENING_LABELS[opening.type]}>
            <Field label="Type">
              <Select<OpeningType>
                value={opening.type}
                options={(Object.keys(OPENING_LABELS) as OpeningType[]).map((type) => ({
                  value: type,
                  label: OPENING_LABELS[type],
                }))}
                onChange={(type) => patch({ type, sill: type === "window" ? opening.sill : 0 })}
              />
            </Field>
            <Field label="Width">
              <NumberInput
                value={opening.width}
                step={0.05}
                min={0.3}
                max={Math.max(0.4, length)}
                suffix="m"
                onChange={(width) => patch({ width })}
              />
            </Field>
            <Field label="Height">
              <NumberInput
                value={opening.height}
                step={0.05}
                min={0.3}
                max={wall.height}
                suffix="m"
                onChange={(height) => patch({ height })}
              />
            </Field>
            <Field label="Sill height">
              <NumberInput
                value={opening.sill}
                step={0.05}
                min={0}
                max={Math.max(0, wall.height - opening.height)}
                suffix="m"
                onChange={(sill) => patch({ sill })}
              />
            </Field>
            <Field label="Along wall">
              <Slider
                value={opening.t}
                min={0}
                max={1}
                step={0.005}
                onChange={(t) => patch({ t })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Stat
                label="From start"
                value={formatLength(opening.t * length, plan.settings.units)}
              />
              <Stat label="Wall" value={formatLength(length, plan.settings.units)} />
            </div>
          </Section>
          <Section title="Actions">
            <Button
              variant="danger"
              className="w-full"
              onClick={() => {
                apply((current) => removeOpening(current, wall.id, opening.id));
                props.onSelect({ kind: "wall", id: wall.id });
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove opening
            </Button>
          </Section>
        </>
      );
    }

    case "item": {
      const item = plan.items.find((i) => i.id === selection.id);
      if (!item) return <PlanPanel {...props} />;
      const entry = catalogEntry(item.catalogId);
      const patch = (values: Parameters<typeof updateItem>[2]) =>
        apply((current) => updateItem(current, item.id, values));
      return (
        <>
          <Section title={entry.name}>
            <Field label="Label">
              <TextInput
                value={item.label ?? ""}
                placeholder={entry.name}
                className="w-36"
                onChange={(label) => patch({ label: label || undefined })}
              />
            </Field>
            <Field label="Width">
              <NumberInput
                value={item.width}
                step={0.05}
                min={0.05}
                suffix="m"
                onChange={(width) => patch({ width })}
              />
            </Field>
            <Field label="Depth">
              <NumberInput
                value={item.depth}
                step={0.05}
                min={0.05}
                suffix="m"
                onChange={(depth) => patch({ depth })}
              />
            </Field>
            <Field label="Height">
              <NumberInput
                value={item.height}
                step={0.05}
                min={0.02}
                suffix="m"
                onChange={(height) => patch({ height })}
              />
            </Field>
            <Field label="Off floor">
              <NumberInput
                value={item.elevation}
                step={0.05}
                min={0}
                suffix="m"
                onChange={(elevation) => patch({ elevation })}
              />
            </Field>
          </Section>

          <Section title="Placement">
            <Field label="X">
              <NumberInput value={item.x} step={0.05} suffix="m" onChange={(x) => patch({ x })} />
            </Field>
            <Field label="Y">
              <NumberInput value={item.y} step={0.05} suffix="m" onChange={(y) => patch({ y })} />
            </Field>
            <Field label="Rotation">
              <NumberInput
                value={item.rotation}
                step={15}
                min={-360}
                max={360}
                suffix="°"
                onChange={(rotation) => patch({ rotation })}
              />
            </Field>
          </Section>

          <Section title="Finish">
            <ColorRow
              value={item.color}
              swatches={ITEM_SWATCHES}
              onChange={(color) => patch({ color })}
            />
          </Section>

          <Section title="Actions">
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  const copyId = uid("i");
                  apply((current) => duplicateItem(current, item.id, copyId));
                  props.onSelect({ kind: "item", id: copyId });
                }}
              >
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  apply((current) => removeItem(current, item.id));
                  props.onSelect(null);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </Section>
        </>
      );
    }

    case "corner": {
      const corner = plan.corners.find((c) => c.id === selection.id);
      if (!corner) return <PlanPanel {...props} />;
      const connected = plan.walls.filter((w) => w.start === corner.id || w.end === corner.id);
      return (
        <>
          <Section title="Corner">
            <Field label="X">
              <NumberInput
                value={corner.x}
                step={0.05}
                suffix="m"
                onChange={(x) => apply((current) => moveCorner(current, corner.id, { x, y: corner.y }))}
              />
            </Field>
            <Field label="Y">
              <NumberInput
                value={corner.y}
                step={0.05}
                suffix="m"
                onChange={(y) => apply((current) => moveCorner(current, corner.id, { x: corner.x, y }))}
              />
            </Field>
            <Stat label="Walls joined" value={`${connected.length}`} />
            <EmptyHint>
              Drag a corner onto another to weld them together — every wall and room attached
              follows.
            </EmptyHint>
          </Section>
          <Section title="Actions">
            <Button
              variant="danger"
              className="w-full"
              onClick={() => {
                apply((current) => removeCorner(current, corner.id));
                props.onSelect(null);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete corner and its walls
            </Button>
          </Section>
        </>
      );
    }

    default:
      return <PlanPanel {...props} />;
  }
}

/* ------------------------------------------------------------------ *
 * Nothing selected — plan-wide settings and totals
 * ------------------------------------------------------------------ */

function PlanPanel({ plan, rooms, apply, onRename }: InspectorProps) {
  const metrics = planMetrics(plan, rooms);

  return (
    <>
      <Section title="Property">
        <TextInput value={plan.name} onChange={onRename} className="w-full" />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Floor area" value={formatArea(metrics.floorArea, plan.settings.units)} />
          <Stat label="Rooms" value={`${rooms.length}`} />
          <Stat label="Wall run" value={formatLength(metrics.wallRun, plan.settings.units)} />
          <Stat label="Openings" value={`${metrics.openings}`} />
        </div>
      </Section>

      {isEventLayout(metrics) && (
        <Section title="Event capacity">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Seats placed" value={`${metrics.seats}`} />
            <Stat label="Tables" value={`${metrics.tables}`} />
            <Stat
              label={`Standing (${STANDING_AREA_PER_GUEST} m²/guest)`}
              value={`${metrics.standingCapacity}`}
            />
            <Stat
              label="Dance floor"
              value={formatArea(metrics.danceFloorArea, plan.settings.units)}
            />
          </div>
          <EmptyHint>
            Seats are counted from the chairs actually placed, so the figure matches what the
            crew will physically set out.
          </EmptyHint>
        </Section>
      )}

      <Section title="Rooms">
        {rooms.length === 0 ? (
          <EmptyHint>
            No enclosed rooms yet. Close a loop of walls and the floor is detected automatically.
          </EmptyHint>
        ) : (
          <div className="space-y-1">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between rounded-lg border border-line-soft bg-white/40 px-2.5 py-1.5 text-xs"
              >
                <span className="text-paper-dim">{plan.rooms[room.id]?.name ?? "Room"}</span>
                <span className="font-mono text-[10px] text-ink-dim">
                  {formatArea(room.area, plan.settings.units)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Defaults">
        <Field label="Units">
          <Select<Units>
            value={plan.settings.units}
            options={[
              { value: "m", label: "Metres" },
              { value: "ft", label: "Feet & inches" },
            ]}
            onChange={(units) => apply((current) => updateSettings(current, { units }))}
          />
        </Field>
        <Field label="Wall height">
          <NumberInput
            value={plan.settings.wallHeight}
            step={0.05}
            min={1}
            max={12}
            suffix="m"
            onChange={(wallHeight) => apply((current) => updateSettings(current, { wallHeight }))}
          />
        </Field>
        <Field label="Wall thickness">
          <NumberInput
            value={plan.settings.wallThickness}
            step={0.01}
            min={0.05}
            max={1}
            suffix="m"
            onChange={(wallThickness) =>
              apply((current) => updateSettings(current, { wallThickness }))
            }
          />
        </Field>
        <Field label="Snap grid">
          <Select
            value={String(plan.settings.gridSize)}
            options={[
              { value: "0.1", label: "10 cm" },
              { value: "0.25", label: "25 cm" },
              { value: "0.5", label: "50 cm" },
              { value: "1", label: "1 m" },
            ]}
            onChange={(value) =>
              apply((current) => updateSettings(current, { gridSize: Number.parseFloat(value) }))
            }
          />
        </Field>
        <EmptyHint>
          <Ruler className="mr-1 inline h-3 w-3" />
          Hold Alt while dragging to ignore the grid; Shift constrains wall angles to 45°.
        </EmptyHint>
      </Section>
    </>
  );
}
