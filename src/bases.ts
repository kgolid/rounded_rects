import { Vec } from './interfaces';
import { add, mul, translateWithBase, vec } from './vector';

export function get_base_change_function(scale: number, rotation: number, translation: Vec = vec(0, 0, 0)) {
  return (pnt: Vec) => translateWithBase(add(pnt, translation), get_bases(scale, rotation));
}

export function get_shadow_base_change_function(scale: number, rotation: number, translation: Vec = vec(0, 0, 0)) {
  return (pnt: Vec) => translateWithBase(add(pnt, translation), get_shadow_bases(scale, rotation));
}

export function get_bases(scale: number, rotation: number): Vec[] {
  const rot = (rotation * Math.PI) / 12;
  const squish = 1; // 1 / Math.sqrt(2); //Math.cos(Math.PI / 3) / Math.sin(Math.PI / 3);

  const PHI1 = -(5 * Math.PI) / 6 + rot;
  const PHI2 = -(1 * Math.PI) / 6 + rot;
  const PHI3 = -Math.PI / 2 + rot;

  const b1 = { x: Math.cos(PHI1), y: squish * Math.sin(PHI1), z: 0 };
  const b2 = { x: Math.cos(PHI2), y: squish * Math.sin(PHI2), z: 0 };
  const b3 = { x: Math.cos(PHI3), y: Math.sin(PHI3), z: 1 };

  return [b1, b2, b3].map((b) => mul(b, scale));
}

export function get_shadow_bases(scale: number, rotation: number): Vec[] {
  const rot = (rotation * Math.PI) / 12;
  const squish = 1 / Math.sqrt(2); //Math.cos(Math.PI / 3) / Math.sin(Math.PI / 3);

  const PHI1 = -(5 * Math.PI) / 6 + rot;
  const PHI2 = -(1 * Math.PI) / 6 + rot;
  const PHI3 = -Math.PI / 6 + rot;

  const b1 = { x: Math.cos(PHI1), y: squish * Math.sin(PHI1), z: 0 };
  const b2 = { x: Math.cos(PHI2), y: squish * Math.sin(PHI2), z: 0 };
  const b3 = { x: Math.cos(PHI3), y: Math.sin(PHI3), z: 1 };

  return [b1, b2, b3].map((b) => mul(b, scale));
}
