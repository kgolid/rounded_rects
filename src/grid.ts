import { BoardCell, PieceProfile, RestrictionMap, Vec } from './interfaces';
import { trivial_restriction } from './restrictions';
import { pickAny, random_int } from './util';
import { mag, mul, sub, vec } from './vector';
import PoissonDiskSampling from 'poisson-disk-sampling';

export function get_grid_positions(dim: Vec, line_num: Vec, bc: (_: Vec) => Vec) {
  let array = [];

  let pos = mul(dim, -1 / 2);
  let line_dist = vec(dim.x / line_num.x, dim.y / line_num.y);

  for (let i = 0; i < line_num.y; i++) {
    const start = vec(pos.x, pos.y + i * line_dist.y);
    const end = vec(pos.x + dim.x, pos.y + i * line_dist.y);
    array.push([bc(start), bc(end)]);
  }

  for (let i = 0; i < line_num.x; i++) {
    const start = vec(pos.x + i * line_dist.x, pos.y);
    const end = vec(pos.x + i * line_dist.x, pos.y + dim.y);
    array.push([bc(start), bc(end)]);
  }

  return array;
}

export function get_grid(grid_dim: Vec, cell_num: Vec, profiles: PieceProfile[], color_ids: number[]) {
  let pos = mul(grid_dim, -1 / 2);
  let cell_dim = vec(grid_dim.x / cell_num.x, grid_dim.y / cell_num.y);

  let cells: BoardCell[] = [];
  for (let j = 0; j < cell_num.y; j++) {
    for (let i = 0; i < cell_num.x; i++) {
      let cell_pos = vec(pos.x + cell_dim.x * i, pos.y + cell_dim.y * j);
      let grid_pos = vec(i, j);
      let cell = get_cell(grid_pos, cell_pos, cell_dim, profiles, color_ids);
      cells.push(cell);
    }
  }

  let d = random_int(cell_num.x);
  console.log(d);
  let col_idx = pickAny(color_ids);
  cells.forEach((s) => (s.grid_pos.x == d ? (s.restrictions.color_id = (t: number) => t == col_idx) : {}));

  return cells;
}

function get_cell(grid_pos: Vec, pos: Vec, dim: Vec, profiles: PieceProfile[], color_ids: number[]): BoardCell {
  let token_points = get_token_points(dim, [], false);
  let is_color_restriction = Math.random() < 0.5;
  let profile_idx = pickAny(profiles).id;
  let col_idx = pickAny(color_ids);
  let restrictions: RestrictionMap = {
    type: is_color_restriction ? 'color' : 'type',
    color_id: (t: number) => (is_color_restriction ? t == col_idx : true),
    profile_id: (t: number) => (is_color_restriction ? true : t == profile_idx),
  };
  return board_cell(0, grid_pos, pos, dim, false, token_points, restrictions);
}

export function get_token_points(cell_dim: Vec, possible_profiles: PieceProfile[], orderly: boolean): Vec[] {
  if (possible_profiles.length == 0) return [];
  if (possible_profiles.length == 1 && orderly) return get_orderly_token_points(cell_dim, possible_profiles[0].dim);

  let dim = Math.max(...possible_profiles.map((p) => mag(p.dim)));

  let pad = dim / 2 + 5;
  if (cell_dim.x < 2 * pad || cell_dim.y < 2 * pad) return [];
  const sampling = new PoissonDiskSampling({
    shape: [cell_dim.x - pad * 2, cell_dim.y - pad * 2],
    minDistance: dim + 5,
    maxDistance: dim * 1.5,
    tries: 100,
  });

  let points = sampling.fill().map((d: number[]) => vec(d[0] + pad, d[1] + pad, 0));
  points.sort((a, b) => mag(sub(a, mul(cell_dim, 0.5))) - mag(sub(b, mul(cell_dim, 0.5))));
  return points;
}

function get_orderly_token_points(cell_dim: Vec, token_dim: Vec): Vec[] {
  let pad = 15;
  let x = Math.floor((cell_dim.x - pad * 2) / (token_dim.x + pad));
  let y = Math.floor((cell_dim.y - pad * 2) / (token_dim.y + pad));

  let rest_x = cell_dim.x - pad * 2 - (token_dim.x + pad) * x;
  let rest_y = cell_dim.y - pad * 2 - (token_dim.y + pad) * y;

  let points = [];
  for (let j = 0; j < y; j++) {
    for (let i = 0; i < x; i++) {
      let px = pad + rest_x / 2 + (i + 0.5) * (token_dim.x + pad);
      let py = pad + rest_y / 2 + (j + 0.5) * (token_dim.y + pad);
      points.push(vec(px, py));
    }
  }

  points.reverse();

  return points;
}

// --- Constructors ---

export function board_cell(
  id: number,
  grid_pos: Vec,
  pos: Vec,
  dim: Vec,
  orderly: boolean,
  token_points: Vec[] = [],
  restrictions: RestrictionMap = trivial_restriction
): BoardCell {
  return { id, grid_pos, pos, dim, orderly, token_points, restrictions };
}
