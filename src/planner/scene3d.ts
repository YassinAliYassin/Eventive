/**
 * The 3D view. A plain three.js scene rebuilt from the plan model — no React
 * reconciler in the render loop, which keeps the walkthrough smooth and the
 * dependency list short.
 *
 * Plan (x, y) maps to world (x, z); world +Y is up. Wall rotation is therefore
 * `-atan2(dz, dx)`, and an item's plan rotation `r` becomes `rotation.y = -r`.
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { catalogEntry } from "./catalog";
import { cornerMap, openingSpan, radians, wallEnds } from "./geometry";
import type { Room } from "./geometry";
import type { Plan, Selection, Wall } from "./types";
import { buildItemMesh } from "./items3d";

export type WallMode = "full" | "low" | "none";
export type CameraMode = "orbit" | "walk";

export interface SceneOptions {
  wallMode: WallMode;
  showFurniture: boolean;
  showGround: boolean;
  gridSize: number;
  shadows: boolean;
}

export interface SceneCallbacks {
  onSelect: (selection: Selection | null) => void;
  onItemDragStart: () => void;
  onItemDrag: (id: string, x: number, y: number) => void;
  onItemDragEnd: () => void;
  onModeChange: (mode: CameraMode) => void;
}

const WALK_HEIGHT = 1.65;
const WALK_SPEED = 3.4;

export class PropertyScene {
  private readonly canvas: HTMLCanvasElement;
  private readonly callbacks: SceneCallbacks;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly orbit: OrbitControls;
  private readonly pointerLock: PointerLockControls;
  private readonly sun: THREE.DirectionalLight;

  private readonly structure = new THREE.Group();
  private readonly furniture = new THREE.Group();
  private readonly ground: THREE.Mesh;
  private readonly grid: THREE.GridHelper;
  private readonly selectionBox: THREE.LineSegments;

  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  private plan: Plan | null = null;
  private rooms: Room[] = [];
  private options: SceneOptions = {
    wallMode: "full",
    showFurniture: true,
    showGround: true,
    gridSize: 0.25,
    shadows: true,
  };
  private mode: CameraMode = "orbit";
  private selection: Selection | null = null;
  private structureKey = "";
  private furnitureKey = "";

  private drag: { id: string; offset: THREE.Vector3; altKey: boolean } | null = null;
  private readonly keys = new Set<string>();
  private readonly velocity = new THREE.Vector3();
  private lastFrame = performance.now();
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, callbacks: SceneCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#cdd9ea");
    this.scene.fog = new THREE.Fog("#cdd9ea", 60, 190);

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.05, 500);
    this.camera.position.set(14, 14, 18);

    this.orbit = new OrbitControls(this.camera, canvas);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.08;
    this.orbit.maxPolarAngle = Math.PI / 2 - 0.02;
    this.orbit.screenSpacePanning = false;

    this.pointerLock = new PointerLockControls(this.camera, canvas);
    // Leaving pointer lock (Esc, or clicking away) drops back to orbiting.
    this.pointerLock.addEventListener("unlock", () => {
      if (this.mode === "walk") this.setMode("orbit");
    });

    // Lighting: a warm key with a cool sky fill reads well on white walls.
    const hemisphere = new THREE.HemisphereLight("#eaf1fb", "#9aa284", 1.15);
    this.scene.add(hemisphere);

    this.sun = new THREE.DirectionalLight("#fff4e2", 2.1);
    this.sun.position.set(24, 36, 16);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 140;
    this.sun.shadow.camera.left = -45;
    this.sun.shadow.camera.right = 45;
    this.sun.shadow.camera.top = 45;
    this.sun.shadow.camera.bottom = -45;
    this.sun.shadow.bias = -0.0008;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshStandardMaterial({ color: "#a9b795", roughness: 1 })
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = -0.02;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    this.grid = new THREE.GridHelper(200, 200, "#8f9c86", "#9aa791");
    (this.grid.material as THREE.Material).opacity = 0.25;
    (this.grid.material as THREE.Material).transparent = true;
    this.grid.position.y = 0.001;
    this.scene.add(this.grid);

    this.scene.add(this.structure);
    this.scene.add(this.furniture);

    this.selectionBox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
      new THREE.LineBasicMaterial({ color: "#2f5d8f", depthTest: false })
    );
    this.selectionBox.visible = false;
    this.selectionBox.renderOrder = 5;
    this.scene.add(this.selectionBox);

    canvas.addEventListener("pointerdown", this.handlePointerDown);
    canvas.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerUp);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    this.renderer.setAnimationLoop(this.tick);
  }

  /* ---------------- public API ---------------- */

  /**
   * Rebuilds only what actually changed. Dragging furniture streams a new plan
   * on every pointer move, and re-extruding every wall at that rate would be
   * wasteful — so the walls/floors and the furniture each carry a signature,
   * and a move that only changes transforms takes the cheap path.
   */
  setPlan(plan: Plan, rooms: Room[]): void {
    const previous = this.plan;
    this.plan = plan;
    this.rooms = rooms;

    const structureKey = structureSignature(plan, rooms);
    const furnitureKey = furnitureSignature(plan);

    if (!previous || structureKey !== this.structureKey) {
      this.structureKey = structureKey;
      this.rebuildStructure();
    }
    if (!previous || furnitureKey !== this.furnitureKey) {
      this.furnitureKey = furnitureKey;
      this.rebuildFurniture();
    } else {
      this.syncFurnitureTransforms();
    }
    this.updateSelectionBox();
  }

  setOptions(options: Partial<SceneOptions>): void {
    const previous = this.options;
    this.options = { ...previous, ...options };
    this.ground.visible = this.options.showGround;
    this.grid.visible = this.options.showGround;
    this.renderer.shadowMap.enabled = this.options.shadows;
    this.sun.castShadow = this.options.shadows;
    if (
      previous.wallMode !== this.options.wallMode ||
      previous.showFurniture !== this.options.showFurniture
    ) {
      this.rebuild();
    }
  }

  setSelection(selection: Selection | null): void {
    this.selection = selection;
    this.updateSelectionBox();
  }

  setMode(mode: CameraMode): void {
    if (this.mode === mode) return;
    this.mode = mode;
    if (mode === "walk") {
      const target = this.orbit.target.clone();
      this.orbit.enabled = false;
      this.camera.position.set(target.x, WALK_HEIGHT, target.z + 4);
      this.camera.rotation.set(0, 0, 0);
      this.pointerLock.lock();
    } else {
      this.pointerLock.unlock();
      this.orbit.enabled = true;
      this.orbit.target.set(this.camera.position.x, 0, this.camera.position.z - 4);
      this.camera.position.y = Math.max(this.camera.position.y, 6);
    }
    this.callbacks.onModeChange(mode);
  }

  resize(width: number, height: number): void {
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  /** Frames the whole property, from a three-quarter view. */
  fit(): void {
    if (!this.plan) return;
    const box = new THREE.Box3();
    box.setFromObject(this.structure);
    if (this.options.showFurniture && this.furniture.children.length > 0) {
      box.union(new THREE.Box3().setFromObject(this.furniture));
    }
    if (box.isEmpty()) box.set(new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 3, 5));

    const centre = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Frame against *both* field-of-view angles so a narrow viewport (the split
    // view) doesn't clip the property sideways. The horizontal extent uses the
    // plan diagonal because the camera looks in at an angle.
    const horizontalExtent = Math.max(3, Math.hypot(size.x, size.z) / 2);
    const verticalExtent = Math.max(2, size.y / 2 + horizontalExtent * 0.34);
    const verticalFov = radians(this.camera.fov);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * this.camera.aspect);
    const distance =
      Math.max(
        verticalExtent / Math.tan(verticalFov / 2),
        horizontalExtent / Math.tan(horizontalFov / 2)
      ) * 1.05;

    if (this.mode === "walk") this.setMode("orbit");
    const target = new THREE.Vector3(centre.x, Math.min(centre.y, 1.5), centre.z);
    const direction = new THREE.Vector3(0.58, 0.62, 1).normalize();
    this.orbit.target.copy(target);
    this.camera.position.copy(target).addScaledVector(direction, distance);
    this.camera.updateProjectionMatrix();
    this.orbit.update();

    this.sun.target.position.set(centre.x, 0, centre.z);
    this.sun.position.set(centre.x + 26, 38, centre.z + 18);
  }

  screenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL("image/png");
  }

  dispose(): void {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerUp);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.orbit.dispose();
    disposeChildren(this.structure);
    disposeChildren(this.furniture);
    this.renderer.dispose();
  }

  /* ---------------- geometry build ---------------- */

  private rebuild(): void {
    this.rebuildStructure();
    this.rebuildFurniture();
    this.updateSelectionBox();
  }

  private rebuildStructure(): void {
    if (!this.plan) return;
    disposeChildren(this.structure);

    const plan = this.plan;
    const corners = cornerMap(plan);

    for (const room of this.rooms) {
      const floor = buildFloor(room, plan.rooms[room.id]?.floorColor);
      floor.userData.roomId = room.id;
      this.structure.add(floor);
    }

    if (this.options.wallMode !== "none") {
      const cap = this.options.wallMode === "low" ? 1.1 : Infinity;
      for (const wall of plan.walls) {
        const group = buildWall(wall, corners, cap);
        if (group) this.structure.add(group);
      }
    }
  }

  private rebuildFurniture(): void {
    if (!this.plan) return;
    disposeChildren(this.furniture);
    if (!this.options.showFurniture) return;

    for (const item of this.plan.items) {
      const mesh = buildItemMesh(item, catalogEntry(item.catalogId));
      mesh.position.set(item.x, item.elevation, item.y);
      mesh.rotation.y = -radians(item.rotation);
      mesh.userData.itemId = item.id;
      mesh.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      this.furniture.add(mesh);
    }
  }

  /** Cheap path for moves and rotations: no geometry is rebuilt. */
  private syncFurnitureTransforms(): void {
    if (!this.plan) return;
    const byId = new Map(this.plan.items.map((item) => [item.id, item]));
    for (const object of this.furniture.children) {
      const item = byId.get(object.userData.itemId as string);
      if (!item) continue;
      object.position.set(item.x, item.elevation, item.y);
      object.rotation.y = -radians(item.rotation);
    }
  }

  private updateSelectionBox(): void {
    const selection = this.selection;
    if (!selection || selection.kind !== "item" || !this.plan) {
      this.selectionBox.visible = false;
      return;
    }
    const object = this.furniture.children.find((child) => child.userData.itemId === selection.id);
    if (!object) {
      this.selectionBox.visible = false;
      return;
    }
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    this.selectionBox.scale.set(Math.max(size.x, 0.05), Math.max(size.y, 0.05), Math.max(size.z, 0.05));
    this.selectionBox.position.copy(centre);
    this.selectionBox.visible = true;
  }

  /* ---------------- interaction ---------------- */

  private updatePointer(event: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  private handlePointerDown = (event: PointerEvent) => {
    if (this.mode === "walk" || event.button !== 0) return;
    this.updatePointer(event);

    const itemHit = this.raycaster.intersectObjects(this.furniture.children, true)[0];
    if (itemHit) {
      const id = findUserData(itemHit.object, "itemId");
      if (id) {
        this.callbacks.onSelect({ kind: "item", id });
        const item = this.plan?.items.find((i) => i.id === id);
        if (item) {
          this.dragPlane.set(new THREE.Vector3(0, 1, 0), -item.elevation);
          const hitPoint = new THREE.Vector3();
          this.raycaster.ray.intersectPlane(this.dragPlane, hitPoint);
          this.drag = {
            id,
            offset: new THREE.Vector3(item.x - hitPoint.x, 0, item.y - hitPoint.z),
            altKey: event.altKey,
          };
          this.orbit.enabled = false;
          this.callbacks.onItemDragStart();
        }
        return;
      }
    }

    const structureHit = this.raycaster.intersectObjects(this.structure.children, true)[0];
    if (structureHit) {
      const wallId = findUserData(structureHit.object, "wallId");
      if (wallId) {
        this.callbacks.onSelect({ kind: "wall", id: wallId });
        return;
      }
      const roomId = findUserData(structureHit.object, "roomId");
      if (roomId) {
        this.callbacks.onSelect({ kind: "room", id: roomId });
        return;
      }
    }

    this.callbacks.onSelect(null);
  };

  private handlePointerMove = (event: PointerEvent) => {
    if (!this.drag) return;
    this.updatePointer(event);
    const hitPoint = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.dragPlane, hitPoint)) return;

    let x = hitPoint.x + this.drag.offset.x;
    let y = hitPoint.z + this.drag.offset.z;
    if (!event.altKey && this.options.gridSize > 0) {
      x = Math.round(x / this.options.gridSize) * this.options.gridSize;
      y = Math.round(y / this.options.gridSize) * this.options.gridSize;
    }
    this.callbacks.onItemDrag(this.drag.id, x, y);
  };

  private handlePointerUp = () => {
    if (!this.drag) return;
    this.drag = null;
    this.orbit.enabled = this.mode === "orbit";
    this.callbacks.onItemDragEnd();
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
    this.keys.add(event.code);
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.code);
  };

  /* ---------------- loop ---------------- */

  private tick = () => {
    if (this.disposed) return;
    const now = performance.now();
    const delta = Math.min(0.1, (now - this.lastFrame) / 1000);
    this.lastFrame = now;

    if (this.mode === "walk" && this.pointerLock.isLocked) {
      const forward = Number(this.keys.has("KeyW") || this.keys.has("ArrowUp")) -
        Number(this.keys.has("KeyS") || this.keys.has("ArrowDown"));
      const strafe = Number(this.keys.has("KeyD") || this.keys.has("ArrowRight")) -
        Number(this.keys.has("KeyA") || this.keys.has("ArrowLeft"));
      const boost = this.keys.has("ShiftLeft") || this.keys.has("ShiftRight") ? 2 : 1;

      this.velocity.x -= this.velocity.x * 10 * delta;
      this.velocity.z -= this.velocity.z * 10 * delta;
      this.velocity.z -= forward * WALK_SPEED * boost * 10 * delta;
      this.velocity.x -= strafe * WALK_SPEED * boost * 10 * delta;

      this.pointerLock.moveRight(-this.velocity.x * delta);
      this.pointerLock.moveForward(-this.velocity.z * delta);
      this.camera.position.y = WALK_HEIGHT;
    } else {
      this.orbit.update();
    }

    this.renderer.render(this.scene, this.camera);
  };
}

/* ------------------------------------------------------------------ *
 * Builders
 * ------------------------------------------------------------------ */

const WALL_MATERIAL = new THREE.MeshStandardMaterial({ color: "#f3f0ea", roughness: 0.94 });
const WALL_INNER_MATERIAL = new THREE.MeshStandardMaterial({ color: "#e8e4dc", roughness: 0.95 });
const GLASS_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: "#cfe3ef",
  roughness: 0.08,
  metalness: 0,
  transmission: 0.55,
  transparent: true,
  opacity: 0.42,
});
const DOOR_MATERIAL = new THREE.MeshStandardMaterial({ color: "#a8794f", roughness: 0.6 });
const FRAME_MATERIAL = new THREE.MeshStandardMaterial({ color: "#e2ddd3", roughness: 0.7 });

/**
 * Builds a wall as a set of boxes: full-height runs between openings, plus the
 * spandrel above each opening and the sill below a window. Cheap, robust, and
 * it avoids pulling in a CSG library for what is always an axis-aligned hole.
 */
function buildWall(
  wall: Wall,
  corners: ReturnType<typeof cornerMap>,
  heightCap: number
): THREE.Group | null {
  const ends = wallEnds(wall, corners);
  if (!ends) return null;

  const dx = ends.b.x - ends.a.x;
  const dz = ends.b.y - ends.a.y;
  const length = Math.hypot(dx, dz);
  if (length < 0.01) return null;

  const angle = Math.atan2(dz, dx);
  const half = wall.thickness / 2;
  const extended = length + wall.thickness;
  const height = Math.min(wall.height, heightCap);
  const group = new THREE.Group();
  group.userData.wallId = wall.id;

  // Everything is laid out in "distance along the extended wall" space, then
  // rotated into place in one go at the end.
  const material = wall.exterior === false ? WALL_INNER_MATERIAL : WALL_MATERIAL;

  const addBox = (from: number, to: number, bottom: number, top: number, mat: THREE.Material) => {
    const w = to - from;
    const h = top - bottom;
    if (w <= 0.001 || h <= 0.001) return;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, wall.thickness), mat);
    mesh.position.set(from + w / 2 - extended / 2, bottom + h / 2, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.wallId = wall.id;
    group.add(mesh);
  };

  const gaps = wall.openings
    .map((opening) => {
      const span = openingSpan(opening, length);
      return {
        opening,
        start: span.start + half,
        end: span.end + half,
        sill: opening.sill,
        top: opening.sill + opening.height,
      };
    })
    .sort((a, b) => a.start - b.start);

  let cursor = 0;
  for (const gap of gaps) {
    if (gap.start > cursor) addBox(cursor, gap.start, 0, height, material);
    if (gap.sill > 0) addBox(gap.start, gap.end, 0, Math.min(gap.sill, height), material);
    if (gap.top < height) addBox(gap.start, gap.end, gap.top, height, material);
    cursor = Math.max(cursor, gap.end);

    // Frame, glazing and door leaves live inside the hole.
    const width = gap.end - gap.start;
    const centre = gap.start + width / 2 - extended / 2;
    const clearTop = Math.min(gap.top, height);
    if (clearTop <= gap.sill) continue;

    if (gap.opening.type === "window") {
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.06, clearTop - gap.sill - 0.06, 0.03),
        GLASS_MATERIAL
      );
      glass.position.set(centre, (gap.sill + clearTop) / 2, 0);
      group.add(glass);
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(width, clearTop - gap.sill, wall.thickness * 0.34),
        FRAME_MATERIAL
      );
      frame.position.set(centre, (gap.sill + clearTop) / 2, 0);
      frame.userData.wallId = wall.id;
      group.add(frame);
      glass.renderOrder = 2;
    } else if (gap.opening.type === "door" || gap.opening.type === "double-door") {
      const leaves = gap.opening.type === "double-door" ? 2 : 1;
      const leafWidth = (width - 0.04) / leaves;
      for (let i = 0; i < leaves; i += 1) {
        // Hinged open at 75° so rooms read as connected in the walkthrough.
        const hingeX = centre - width / 2 + (i === 0 ? 0.02 : width - 0.02);
        const pivot = new THREE.Group();
        pivot.position.set(hingeX, 0, 0);
        pivot.rotation.y = (i === 0 ? -1 : 1) * radians(75);
        const leaf = new THREE.Mesh(
          new THREE.BoxGeometry(leafWidth, clearTop - gap.sill - 0.03, 0.045),
          DOOR_MATERIAL
        );
        leaf.position.set((i === 0 ? 1 : -1) * (leafWidth / 2), (clearTop - gap.sill) / 2, 0);
        leaf.castShadow = true;
        pivot.add(leaf);
        group.add(pivot);
      }
    }
  }
  if (cursor < extended) addBox(cursor, extended, 0, height, material);

  group.position.set((ends.a.x + ends.b.x) / 2, 0, (ends.a.y + ends.b.y) / 2);
  group.rotation.y = -angle;
  return group;
}

function buildFloor(room: Room, color?: string): THREE.Mesh {
  const shape = new THREE.Shape();
  room.polygon.forEach((point, index) => {
    if (index === 0) shape.moveTo(point.x, point.y);
    else shape.lineTo(point.x, point.y);
  });
  shape.closePath();

  const geometry = new THREE.ShapeGeometry(shape);
  geometry.rotateX(Math.PI / 2);

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: color ?? "#c9a97e",
      roughness: 0.85,
      side: THREE.DoubleSide,
    })
  );
  mesh.position.y = 0.01;
  mesh.receiveShadow = true;
  return mesh;
}

/* ------------------------------------------------------------------ *
 * Utilities
 * ------------------------------------------------------------------ */

/** Everything that changes the extruded shell: corners, walls, floors. */
function structureSignature(plan: Plan, rooms: Room[]): string {
  const corners = plan.corners.map((c) => `${c.id}:${c.x},${c.y}`).join(";");
  const walls = plan.walls
    .map(
      (w) =>
        `${w.id}:${w.start},${w.end},${w.thickness},${w.height},${w.exterior}` +
        w.openings.map((o) => `|${o.type},${o.t},${o.width},${o.height},${o.sill}`).join("")
    )
    .join(";");
  const floors = rooms
    .map((room) => `${room.id}:${plan.rooms[room.id]?.floorColor ?? ""}`)
    .join(";");
  return `${corners}#${walls}#${floors}`;
}

/** Everything that changes furniture *geometry* — position and rotation are
 * deliberately excluded so that dragging takes the transform-only path. */
function furnitureSignature(plan: Plan): string {
  return plan.items
    .map((i) => `${i.id}:${i.catalogId},${i.width},${i.depth},${i.height},${i.color}`)
    .join(";");
}

function findUserData(object: THREE.Object3D, key: string): string | null {
  let current: THREE.Object3D | null = object;
  while (current) {
    const value = current.userData?.[key];
    if (typeof value === "string") return value;
    current = current.parent;
  }
  return null;
}

function disposeChildren(group: THREE.Group): void {
  for (const child of [...group.children]) {
    child.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      // Shared materials (walls, glass) are module-level and must survive.
      if (Array.isArray(material)) material.forEach(disposeIfOwned);
      else if (material) disposeIfOwned(material);
    });
    group.remove(child);
  }
}

const SHARED_MATERIALS = new Set<THREE.Material>([
  WALL_MATERIAL,
  WALL_INNER_MATERIAL,
  GLASS_MATERIAL,
  DOOR_MATERIAL,
  FRAME_MATERIAL,
]);

function disposeIfOwned(material: THREE.Material): void {
  if (!SHARED_MATERIALS.has(material)) material.dispose();
}
