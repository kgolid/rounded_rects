import { CIRCLE_DIST, CIRCLE_RADIUS, MAX_RECT_DIM, MIN_RECT_DIM } from '../globals';
import { Circle, Quad, Rect, Shape, Vec } from '../interfaces';
import { add, dist, mag, mul, points_along_line, quad, rotate_quad, vec, vmul } from '../vector';

export function circle(x: number, y: number, r: number = CIRCLE_RADIUS): Circle {
  return { pos: vec(x, y), radius: r };
}

export function shape(quad: Quad, inner_boundary: Circle[], outer_boundary: Circle): Shape {
  return { quad, inner_boundary, outer_boundary };
}

export function shape_from_rect(pos: Vec, rect: Rect) {
  let pnts = [vec(-1, -1), vec(1, -1), vec(1, 1), vec(-1, 1)].map((v) => add(vmul(v, mul(rect.dim, 0.5)), pos));
  let q = quad(pnts[0], pnts[1], pnts[2], pnts[3]);
  let outer_boundary_dim = mag(mul(rect.dim, 0.5)) + CIRCLE_RADIUS;
  let outer_boundary = circle(pos.x, pos.y, outer_boundary_dim);

  let inner_boundary_dim = Math.min(rect.dim.x / 2, rect.dim.y / 2) + CIRCLE_RADIUS;
  let inner_boundary = circle(pos.x, pos.y, inner_boundary_dim);

  return shape_from_quad(rotate_quad(q, pos, rect.rotation), outer_boundary, inner_boundary);
}

export function shape_from_quad(quad: Quad, outer_boundary: Circle, inner_boundary: Circle) {
  return shape(quad, boundary_from_quad(quad, inner_boundary), outer_boundary);
}

function boundary_from_quad(quad: Quad, inner_boundary: Circle) {
  let pnts_ab = points_along_line(quad.a, quad.b, CIRCLE_DIST);
  let pnts_bc = points_along_line(quad.b, quad.c, CIRCLE_DIST);
  let pnts_cd = points_along_line(quad.c, quad.d, CIRCLE_DIST);
  let pnts_da = points_along_line(quad.d, quad.a, CIRCLE_DIST);

  return [...pnts_ab, ...pnts_bc, ...pnts_cd, ...pnts_da].map((t) => circle(t.x, t.y)).concat([inner_boundary]);
}

// ---- Overlap ----

export function shape_overlaps_collection(s0: Shape, ss: Shape[]) {
  let proximity = ss.filter((s) => shapes_are_within_proximity(s0, s));
  return proximity.some((s) => shapes_overlap(s0, s));
}

export function shapes_overlap(s1: Shape, s2: Shape) {
  return s1.inner_boundary.some((c1) => s2.inner_boundary.some((c2) => circles_overlap(c1, c2)));
}

export function shapes_are_within_proximity(s1: Shape, s2: Shape) {
  return circles_overlap(s1.outer_boundary, s2.outer_boundary);
}

export function circles_overlap(c1: Circle, c2: Circle) {
  return dist(c1.pos, c2.pos) < c1.radius + c2.radius;
}

export function circle_is_contained(c1: Circle, c2: Circle) {
  let d = dist(c1.pos, c2.pos);

  return d < Math.max(c1.radius, c2.radius);
}
