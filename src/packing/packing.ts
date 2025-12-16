import { ANGLE_TRIES, CELL_PAD, SPIN_TRIES } from '../globals';
import { BoardCellSpec, Rect, Shape, TokenPoint, TokenShape, Vec } from '../interfaces';
import { execute_binary_search } from './search';
import { shape_from_rect, shape_overlaps_collection } from './shape';
import { add, mag, mul, vec } from '../vector';
import { my_shuffle, pickAny } from '../util';
import { rng } from '../random';

export function pack_cell(cell_dim: Vec, cell_spec: BoardCellSpec): TokenPoint[] {
  let rects: Rect[] = cell_spec.allowed_piece_specs.map((ps, i) => ({
    spec_id: i,
    dim: ps.profile.dim,
    rotation: 0,
  }));

  let packing = make_shape_packing(rects, cell_dim);
  // packing = packing.filter(
  //   (s) =>
  //     s.pos.x > -cell_dim.x / 2 + s.shape.outer_boundary.radius &&
  //     s.pos.y > -cell_dim.y / 2 + s.shape.outer_boundary.radius &&
  //     s.pos.x < cell_dim.x / 2 - s.shape.outer_boundary.radius &&
  //     s.pos.y < cell_dim.y / 2 - s.shape.outer_boundary.radius
  // );

  let token_points = packing.map((s) => ({
    pos: add(mul(cell_dim, 0.5), s.pos),
    spec: cell_spec.allowed_piece_specs[s.spec_id],
    rotation: s.rotation,
  }));

  return my_shuffle(token_points);
}

export function make_shape_packing(rects: Rect[], container_dim: Vec) {
  let packing: TokenShape[] = [];

  let next_shape;
  let retries = 0;
  while (retries < 5) {
    next_shape = get_next_shape(packing, rects, container_dim);
    if (next_shape == null) retries++;
    else packing.push(next_shape);
  }

  return packing;
}

// export function add_shape(shapes: TokenShape[], rects: Rect[]) {
//   let new_shape = get_next_shape(shapes, rects);
//   if (new_shape != null) return [...shapes, new_shape];
//   return shapes;
// }

function get_next_shape(ss: TokenShape[], rects: Rect[], container_dim: Vec): TokenShape | null {
  let area_radius = mag(container_dim) / 2;
  const rectangle = pickAny(rects);

  let best_position = vec(area_radius, area_radius);
  let best_spin = 0;
  let found = false;

  let phi = rng() * Math.PI * 2;
  for (let i = 0; i < ANGLE_TRIES; i++) {
    phi += Math.PI * 2 * (i / ANGLE_TRIES);
    rectangle.rotation = rng() * Math.PI;

    for (let j = 0; j < SPIN_TRIES; j++) {
      rectangle.rotation += Math.PI * (j / SPIN_TRIES);

      let pred = get_predicate(phi, rectangle, ss);
      let delta_fn = get_delta_fn(area_radius);

      let initial_radius = area_radius * (1 + rng() * 0.2);
      let center_dist = execute_binary_search(pred, delta_fn, initial_radius);

      let pos_x = Math.cos(phi) * center_dist;
      let pos_y = Math.sin(phi) * center_dist;
      let pos = vec(pos_x, pos_y);

      let within_container = is_within_container(shape_from_rect(pos, rectangle), container_dim);

      if (within_container && center_dist != -1 && mag(best_position) > mag(pos)) {
        best_position = pos;
        best_spin = rectangle.rotation;
        found = true;
      }
    }
  }

  if (found) {
    rectangle.rotation = best_spin;
    return {
      spec_id: rectangle.spec_id,
      pos: best_position,
      rotation: best_spin,
      shape: shape_from_rect(best_position, rectangle),
    };
  }

  return null;
}

function get_predicate(phi: number, rect: Rect, ss: TokenShape[]) {
  return (n: number) => {
    let pos_x = Math.cos(phi) * n;
    let pos_y = Math.sin(phi) * n;

    let s0 = shape_from_rect(vec(pos_x, pos_y), rect);

    return !shape_overlaps_collection(
      s0,
      ss.map((s) => s.shape)
    );
  };
}

function is_within_container(s0: Shape, container_dim: Vec): boolean {
  return [s0.quad.a, s0.quad.b, s0.quad.c, s0.quad.d].every(
    (v) => Math.abs(v.x) < container_dim.x / 2 - CELL_PAD && Math.abs(v.y) < container_dim.y / 2 - CELL_PAD
  );
}

function get_delta_fn(initial_radius: number) {
  return (iteration: number) => {
    return -initial_radius / Math.pow(2, iteration + 1);
  };
}
