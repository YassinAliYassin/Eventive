/**
 * Furniture geometry. Every catalogue shape is assembled from primitives and
 * normalised to the item's own width/height/depth, so a piece resized in the
 * inspector keeps its proportions instead of stretching a fixed model.
 *
 * Convention: base sits at y = 0, the "front" of a piece faces -Z.
 */

import * as THREE from "three";
import type { CatalogEntry } from "./catalog";
import type { Item } from "./types";

function material(color: string, roughness = 0.8, metalness = 0): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function box(
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  x = 0,
  y = 0,
  z = 0
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y + h / 2, z);
  return mesh;
}

function cylinder(
  radius: number,
  h: number,
  mat: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  segments = 24
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, h, segments), mat);
  mesh.position.set(x, y + h / 2, z);
  return mesh;
}

function shade(color: string, amount: number): string {
  const c = new THREE.Color(color);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + amount)));
  return `#${c.getHexString()}`;
}

export function buildItemMesh(item: Item, entry: CatalogEntry): THREE.Group {
  const group = new THREE.Group();
  const w = item.width;
  const h = item.height;
  const d = item.depth;
  const body = material(item.color);
  const dark = material(shade(item.color, -0.22));
  const light = material(shade(item.color, 0.12));

  switch (entry.shape) {
    case "cylinder": {
      group.add(cylinder(Math.min(w, d) / 2, h, body));
      break;
    }

    case "round-table": {
      const radius = Math.min(w, d) / 2;
      group.add(cylinder(radius, 0.05, light, 0, h - 0.05));
      group.add(cylinder(radius * 0.14, h - 0.05, dark));
      group.add(cylinder(radius * 0.45, 0.04, dark));
      break;
    }

    case "chair": {
      const seatHeight = h * 0.48;
      group.add(box(w, 0.07, d, body, 0, seatHeight - 0.07));
      group.add(box(w, h - seatHeight, 0.07, body, 0, seatHeight, d / 2 - 0.035));
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          group.add(
            box(0.05, seatHeight - 0.07, 0.05, dark, (sx * (w / 2 - 0.05)), 0, sz * (d / 2 - 0.05))
          );
        }
      }
      break;
    }

    case "sofa": {
      const seat = h * 0.52;
      group.add(box(w, seat, d, body, 0, 0));
      group.add(box(w, h - seat, d * 0.28, body, 0, seat, d / 2 - d * 0.14));
      for (const sx of [-1, 1]) {
        group.add(box(w * 0.12, h * 0.78, d, light, sx * (w / 2 - w * 0.06), 0));
      }
      group.add(box(w * 0.72, 0.08, d * 0.62, light, 0, seat, -d * 0.1));
      break;
    }

    case "bed": {
      const baseHeight = h * 0.42;
      group.add(box(w, baseHeight, d, dark, 0, 0));
      group.add(box(w - 0.06, h - baseHeight, d - 0.06, light, 0, baseHeight));
      group.add(box(w, h * 1.1, 0.08, dark, 0, 0, d / 2 - 0.04));
      const pillow = material("#ffffff", 0.9);
      for (const sx of w > 1.2 ? [-1, 1] : [0]) {
        group.add(box(w * 0.36, 0.12, d * 0.16, pillow, sx * w * 0.22, h, d * 0.3));
      }
      break;
    }

    case "plant": {
      const potHeight = h * 0.3;
      group.add(cylinder(Math.min(w, d) * 0.28, potHeight, material("#a3714f", 0.9)));
      const foliage = new THREE.Mesh(
        new THREE.SphereGeometry(Math.min(w, d) * 0.45, 16, 12),
        material("#4f7d52", 0.95)
      );
      foliage.position.y = potHeight + (h - potHeight) * 0.55;
      foliage.scale.y = 1.25;
      group.add(foliage);
      break;
    }

    case "tree": {
      const trunkHeight = h * 0.42;
      group.add(cylinder(Math.min(w, d) * 0.07, trunkHeight, material("#6b5138", 1), 0, 0, 0, 10));
      const canopy = material("#4a7a4e", 1);
      const radius = Math.min(w, d) * 0.42;
      const crown = new THREE.Mesh(new THREE.SphereGeometry(radius, 14, 10), canopy);
      crown.position.y = trunkHeight + radius * 0.85;
      group.add(crown);
      const upper = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.72, 12, 9), canopy);
      upper.position.set(radius * 0.28, trunkHeight + radius * 1.55, -radius * 0.2);
      group.add(upper);
      break;
    }

    case "rug": {
      const mesh = box(w, Math.max(h, 0.015), d, body);
      mesh.receiveShadow = true;
      mesh.castShadow = false;
      group.add(mesh);
      break;
    }

    case "counter": {
      group.add(box(w * 0.96, h - 0.04, d * 0.92, body, 0, 0));
      group.add(box(w, 0.04, d, light, 0, h - 0.04));
      break;
    }

    case "screen": {
      group.add(box(w, h, Math.max(d, 0.05), material("#15181d", 0.4)));
      group.add(box(w * 0.94, h * 0.9, 0.01, material("#39404a", 0.2), 0, h * 0.05, -d / 2 - 0.006));
      break;
    }

    case "stage": {
      group.add(box(w, h - 0.05, d, dark, 0, 0));
      group.add(box(w, 0.05, d, material("#3d4654", 0.7), 0, h - 0.05));
      break;
    }

    case "toilet": {
      group.add(box(w * 0.9, h * 0.55, d * 0.55, body, 0, 0, -d * 0.16));
      group.add(box(w, h, d * 0.28, body, 0, 0, d / 2 - d * 0.14));
      break;
    }

    case "bath": {
      group.add(box(w, h, d, body));
      group.add(box(w - 0.16, h * 0.35, d - 0.16, material("#dce7ec", 0.3), 0, h - h * 0.34));
      break;
    }

    case "car": {
      const bodyHeight = h * 0.55;
      group.add(box(w, bodyHeight, d, body, 0, h * 0.16));
      group.add(box(w * 0.86, h * 0.32, d * 0.5, material("#2e343d", 0.3), 0, h * 0.16 + bodyHeight, -d * 0.04));
      const wheel = material("#1b1f26", 0.9);
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const tyre = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.2, h * 0.2, 0.18, 14), wheel);
          tyre.rotation.z = Math.PI / 2;
          tyre.position.set(sx * (w / 2 - 0.04), h * 0.2, sz * (d * 0.32));
          group.add(tyre);
        }
      }
      break;
    }

    case "speaker": {
      group.add(box(w, h, d, material("#15181d", 0.75)));
      for (const [y, radius] of [
        [h * 0.62, Math.min(w, d) * 0.3],
        [h * 0.3, Math.min(w, d) * 0.36],
      ]) {
        const cone = new THREE.Mesh(new THREE.CircleGeometry(radius, 18), material("#2c3138", 0.6));
        cone.position.set(0, y, -d / 2 - 0.005);
        cone.rotation.y = Math.PI;
        group.add(cone);
      }
      break;
    }

    case "arch": {
      const postWidth = Math.max(0.08, w * 0.06);
      for (const sx of [-1, 1]) {
        group.add(box(postWidth, h - postWidth, d * 0.5, body, sx * (w / 2 - postWidth / 2), 0));
      }
      group.add(box(w, postWidth, d * 0.5, body, 0, h - postWidth));
      const foliage = new THREE.Mesh(
        new THREE.TorusGeometry(w * 0.2, 0.06, 8, 18),
        material("#5f8a55", 1)
      );
      foliage.position.set(-w * 0.3, h - postWidth * 2, 0);
      group.add(foliage);
      break;
    }

    case "box":
    default: {
      group.add(box(w, h, d, body));
      break;
    }
  }

  return group;
}
