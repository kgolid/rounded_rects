import { Vec } from './interfaces';

export function vec(x: number, y: number, z: number = 0): Vec {
  return { x, y, z };
}

export function nullVector() {
  return vec(0, 0);
}

export function add(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function addN(a: Vec, x: number = 0, y: number = 0, z: number = 0): Vec {
  return { x: a.x + x, y: a.y + y, z: a.z + z };
}

export function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function mul(a: Vec, s: number): Vec {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

export function dotProduct(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function crossProduct(a: Vec, b: Vec): Vec {
  const cx = a.y * b.z - a.z * b.y;
  const cy = a.z * b.x - a.x * b.z;
  const cz = a.x * b.y - a.y * b.x;
  return { x: cx, y: cy, z: cz };
}

export function mag(a: Vec): number {
  return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
}

export function normalize(a: Vec): Vec {
  return mul(a, 1 / mag(a));
}

export function angleBetween(a: Vec, b: Vec): number {
  return Math.acos(dotProduct(a, b) / (mag(a) * mag(b)));
}

export function angle_of_direction(p1: Vec, p2: Vec) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

export function midpoint(a: Vec, b: Vec): Vec {
  return add(a, mul(sub(b, a), 0.5));
}

export function translateWithBase(pnt: Vec, bases: Vec[]): Vec {
  const [b1, b2, b3] = bases;

  return add(mul(b1, pnt.x), add(mul(b2, pnt.y), mul(b3, pnt.z)));
}

export function lerp(a: Vec, b: Vec, r: number): Vec {
  return add(a, mul(sub(b, a), r));
}

export function rotate_around(p1: Vec, pivot: Vec, phi: number): Vec {
  const dx = p1.x - pivot.x;
  const dy = p1.y - pivot.y;

  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  return {
    x: cosPhi * dx - sinPhi * dy + pivot.x,
    y: sinPhi * dx + cosPhi * dy + pivot.y,
    z: p1.z,
  };
}

export function scale(p1: Vec, p2: Vec, mag: number): Vec {
  return {
    x: p2.x + (p1.x - p2.x) * mag,
    y: p2.y + (p1.y - p2.y) * mag,
    z: p1.z,
  };
}
