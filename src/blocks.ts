import { Vec } from './interfaces';
import { nmod } from './util';
import { add, angle_of_direction, nullVector, scale, sub, vec } from './vector';

export function get_silhouette(
  plane_pnts: Vec[],
  extraction: Vec,
  scale_number: number = 1,
  scale_anchor: Vec = vec(0, 0, 0)
): Vec[] {
  let pnts = [...plane_pnts, plane_pnts[0]];
  let scaled_pnts = pnts.map((t) => scale(t, scale_anchor, scale_number));

  let extr_angle = angle_of_direction(nullVector(), extraction);
  if (extraction.x == 0 && extraction.y == 0) extr_angle = Math.PI / 4;

  let new_pnts = [];
  for (let i = 0; i < pnts.length - 1; i++) {
    let a = pnts[i];
    let b = pnts[i + 1];

    let s_a = scaled_pnts[i];
    let d = add(s_a, extraction);

    let scaled_extraction_angle = angle_of_direction(nullVector(), sub(d, a)) + Math.PI / 4;

    let edge_angle = angle_of_direction(nullVector(), sub(b, a));

    let tp = Math.PI * 2;
    if (nmod(nmod(extr_angle, tp) - nmod(edge_angle, tp), tp) > Math.PI) {
      new_pnts.push(d);
    } else {
      new_pnts.push(a);
    }
  }
  return new_pnts;
}

export function get_sides(
  plane_pnts: Vec[],
  extraction: Vec,
  scale_number: number = 1,
  scale_anchor: Vec = vec(0, 0, 0)
): Vec[][] {
  let pnts = [...plane_pnts, plane_pnts[0]];
  let scaled_pnts = pnts.map((t) => scale(t, scale_anchor, scale_number));
  let sides = [];
  for (let i = 0; i < pnts.length - 1; i++) {
    let a = pnts[i];
    let b = pnts[i + 1];

    let s_a = scaled_pnts[i];
    let s_b = scaled_pnts[i + 1];

    if (segment_is_front(a, b)) {
      let c = add(s_b, extraction);
      let d = add(s_a, extraction);
      sides.push([d, c, b, a]);
    }
  }
  return sides;
}

export function segment_is_front(a: Vec, b: Vec) {
  return a.x - a.y < b.x - b.y;
}

export function point_is_in_front(a: Vec, b: Vec) {
  return a.x + a.y <= b.x + b.y;
}
