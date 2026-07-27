/** React wrapper around the imperative three.js scene. */

import { useEffect, useLayoutEffect, useRef } from "react";
import type { Room } from "./geometry";
import { updateItem } from "./operations";
import { PropertyScene } from "./scene3d";
import type { CameraMode, SceneOptions } from "./scene3d";
import type { Plan, Selection } from "./types";

interface View3DProps {
  plan: Plan;
  rooms: Room[];
  selection: Selection | null;
  onSelect: (selection: Selection | null) => void;
  apply: (mutator: (plan: Plan) => Plan, options?: { silent?: boolean }) => void;
  checkpoint: () => void;
  options: Omit<SceneOptions, "gridSize">;
  mode: CameraMode;
  onModeChange: (mode: CameraMode) => void;
  fitToken: number;
  sceneRef?: React.MutableRefObject<PropertyScene | null>;
}

export function View3D(props: View3DProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<PropertyScene | null>(null);

  // Callbacks change every render; the scene is built once, so it reads them
  // through a ref instead of being torn down and rebuilt.
  const handlers = useRef(props);
  handlers.current = props;

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const scene = new PropertyScene(canvas, {
      onSelect: (selection) => handlers.current.onSelect(selection),
      onItemDragStart: () => handlers.current.checkpoint(),
      onItemDrag: (id, x, y) =>
        handlers.current.apply((plan) => updateItem(plan, id, { x, y }), { silent: true }),
      onItemDragEnd: () => undefined,
      onModeChange: (mode) => handlers.current.onModeChange(mode),
    });
    sceneRef.current = scene;
    if (props.sceneRef) props.sceneRef.current = scene;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      scene.resize(Math.max(1, width), Math.max(1, height));
    });
    observer.observe(wrapper);

    const rect = wrapper.getBoundingClientRect();
    scene.resize(Math.max(1, rect.width), Math.max(1, rect.height));
    scene.setPlan(handlers.current.plan, handlers.current.rooms);
    scene.fit();

    return () => {
      observer.disconnect();
      scene.dispose();
      sceneRef.current = null;
      if (props.sceneRef) props.sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sceneRef.current?.setPlan(props.plan, props.rooms);
  }, [props.plan, props.rooms]);

  useEffect(() => {
    sceneRef.current?.setSelection(props.selection);
  }, [props.selection]);

  useEffect(() => {
    sceneRef.current?.setOptions({ ...props.options, gridSize: props.plan.settings.gridSize });
  }, [props.options, props.plan.settings.gridSize]);

  useEffect(() => {
    sceneRef.current?.setMode(props.mode);
  }, [props.mode]);

  useEffect(() => {
    if (props.fitToken <= 0) return;
    // Wait a frame: the ResizeObserver that gives the camera its new aspect
    // ratio runs after effects, and fitting with a stale aspect mis-frames.
    const frame = requestAnimationFrame(() => sceneRef.current?.fit());
    return () => cancelAnimationFrame(frame);
  }, [props.fitToken]);

  return (
    <div ref={wrapperRef} className="relative h-full w-full overflow-hidden">
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />
      {props.mode === "walk" && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-line-soft bg-panel-raised px-4 py-1.5 text-[11px] font-medium text-ink-dim shadow-sm backdrop-blur">
          WASD to walk · mouse to look · Shift to sprint · Esc to exit
        </div>
      )}
    </div>
  );
}
