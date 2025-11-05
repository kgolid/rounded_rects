import { color_set } from './colors';
import { PIECE_MARGIN } from './globals';
import {
  BoardCell,
  BoardCellSpec,
  EmptyCellSpec,
  GridCellSpec,
  PieceSpec,
  ScatterCellSpec,
  TokenPoint,
  Vec,
} from './interfaces';
import { pack_cell } from './packing/packing';
import { decide_cell_wide_rotation } from './restrictions';
import { my_shuffle, pickAny, random_int, random_subset } from './util';
import { mag, mul, sub, vec } from './vector';
import PoissonDiskSampling from 'poisson-disk-sampling';

export function fill_with_cell_specs(cells: BoardCell[], piece_specs: PieceSpec[]) {
  let ids = new Set(cells.map((c) => c.id));

  let spec_map = new Map<number, BoardCellSpec>();
  ids.forEach((id) => spec_map.set(id, get_cell_spec(cells.find((c) => c.id == id).dim, piece_specs)));
  cells.forEach((c) => (c.spec = c.leave_empty ? get_empty_cell_spec(c.dim) : spec_map.get(c.id)));
}

export function get_cell_spec(dim: Vec, piece_specs: PieceSpec[]): BoardCellSpec {
  let has_spec_requirement = Math.random() < 0.5;

  let chosen_spec = pickAny(piece_specs);
  let allowed_piece_specs = has_spec_requirement
    ? [chosen_spec]
    : piece_specs.filter((t) => t.profile == chosen_spec.profile);

  let allowed_scatter_specs = has_spec_requirement
    ? [chosen_spec]
    : Math.random() < 0.5
    ? piece_specs.filter((t) => t.color_id == chosen_spec.color_id)
    : random_subset(piece_specs);

  let cell_type = pickAny(['scatter', 'grid', 'scatter', 'grid', 'empty']);

  if (cell_type == 'scatter') {
    return get_scatter_cell_spec(allowed_scatter_specs);
  }
  if (cell_type == 'grid') {
    return get_grid_cell_spec(dim, allowed_piece_specs);
  }
  if (cell_type == 'empty') {
    if (dim.x < 250 || dim.y < 250) return get_empty_cell_spec(dim);
    return get_scatter_cell_spec(allowed_scatter_specs);
  }
}

function get_empty_cell_spec(dim: Vec): EmptyCellSpec {
  let show_index = Math.random() < 0.4;
  let has_stack = dim.x < 300 && dim.y < 300 && Math.random() < 0.2;
  let color_id = random_int(color_set.length);
  return { type: 'empty', show_index, has_stack, color_id, allowed_piece_specs: [], rotation: 0 };
}

function get_scatter_cell_spec(allowed_piece_specs: PieceSpec[]): ScatterCellSpec {
  let profile = allowed_piece_specs[0].profile;
  let rotation = (Math.random() * Math.PI) / 2;
  let piece_dist = mag(profile.dim) + PIECE_MARGIN;
  return { type: 'scatter', allowed_piece_specs, rotation, piece_dist };
}

function get_grid_cell_spec(dim: Vec, allowed_piece_specs: PieceSpec[]): GridCellSpec {
  let profile = allowed_piece_specs[0].profile;
  let rotation = decide_cell_wide_rotation(dim, profile);
  let piece_dim = rotation == 0 ? profile.dim : vec(profile.dim.y, profile.dim.x, profile.dim.z);

  let x = Math.floor(dim.x / (piece_dim.x + PIECE_MARGIN));
  let y = Math.floor(dim.y / (piece_dim.y + PIECE_MARGIN));
  let grid_dim = vec(x, y);
  let grid_layout = pickAny(['space-around', 'space-between']);
  let piece_distribution = pickAny(['ltr', 'random', 'single']);
  let indexing = pickAny(['coordinate', 'linear']);

  return { type: 'grid', allowed_piece_specs, rotation, grid_dim, grid_layout, piece_distribution, indexing };
}

export function get_token_points(cell_dim: Vec, cell_spec: BoardCellSpec): TokenPoint[] {
  if (cell_spec.type == 'single' || cell_spec.type == 'empty') return [];

  let piece_profile = cell_spec.allowed_piece_specs[0].profile;
  if (cell_spec.type == 'grid')
    return cell_spec.grid_layout == 'space-around'
      ? get_orderly_token_points(cell_dim, cell_spec, piece_profile.dim)
      : get_orderly_token_points2(cell_dim, cell_spec, piece_profile.dim);

  return pack_cell(cell_dim, cell_spec); //  get_scattered_token_points(cell_dim, cell_spec, piece_profile.dim);

  // let pad = dim / 2 + 5;
  // if (cell_dim.x < 2 * pad || cell_dim.y < 2 * pad) return [];
  // const sampling = new PoissonDiskSampling({
  //   shape: [cell_dim.x - pad * 2, cell_dim.y - pad * 2],
  //   minDistance: dim + 5,
  //   maxDistance: dim * 1.5,
  //   tries: 100,
  // });

  // let points = sampling.fill().map((d: number[]) => vec(d[0] + pad, d[1] + pad, 0));
  // points.sort((a, b) => mag(sub(a, mul(cell_dim, 0.5))) - mag(sub(b, mul(cell_dim, 0.5))));
  // return points;
}

function get_scattered_token_points(cell_dim: Vec, cell_spec: BoardCellSpec, token_dim: Vec): TokenPoint[] {
  let dim = mag(token_dim);
  let pad = dim / 2 + 5;
  if (cell_dim.x < 2 * pad || cell_dim.y < 2 * pad) return [];
  const sampling = new PoissonDiskSampling({
    shape: [cell_dim.x - pad * 2, cell_dim.y - pad * 2],
    minDistance: dim + 5,
    maxDistance: dim * 1.5,
    tries: 100,
  });

  let points = sampling.fill().map((d: number[]) => vec(d[0] + pad, d[1] + pad, cell_dim.z / 10));
  points.sort((a, b) => mag(sub(a, mul(cell_dim, 0.5))) - mag(sub(b, mul(cell_dim, 0.5))));

  let token_points = points.map((t) => ({
    pos: t,
    spec: pickAny(cell_spec.allowed_piece_specs),
    rotation: cell_spec.rotation,
  }));
  return token_points;
}

function get_orderly_token_points(cell_dim: Vec, cell_spec: GridCellSpec, token_dim: Vec): TokenPoint[] {
  let dim = cell_spec.rotation == 0 ? token_dim : vec(token_dim.y, token_dim.x, token_dim.z);
  let pad = PIECE_MARGIN;
  let x = cell_spec.grid_dim.x;
  let y = cell_spec.grid_dim.y;

  let rest_x = cell_dim.x - pad * 2 - (dim.x + pad) * x;
  let rest_y = cell_dim.y - pad * 2 - (dim.y + pad) * y;

  let points = [];
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      let px = pad + rest_x / 2 + (i + 0.5) * (dim.x + pad);
      let py = pad + rest_y / 2 + (y - j - 0.5) * (dim.y + pad);
      let pos = vec(px, py, cell_dim.z / 10);
      let token_point: TokenPoint = { pos, rotation: cell_spec.rotation, spec: cell_spec.allowed_piece_specs[0] };
      points.push(token_point);
    }
  }

  points.reverse();

  return points;
}

function get_orderly_token_points2(cell_dim: Vec, cell_spec: GridCellSpec, token_dim: Vec): TokenPoint[] {
  let dim = cell_spec.rotation == 0 ? token_dim : vec(token_dim.y, token_dim.x, token_dim.z);
  let pad = PIECE_MARGIN;

  let x = cell_spec.grid_dim.x;
  let y = cell_spec.grid_dim.y;

  let rest_x = cell_dim.x - (dim.x + pad) * x;
  let rest_y = cell_dim.y - (dim.y + pad) * y;

  let inner_pad_x = rest_x / x;
  let inner_pad_y = rest_y / y;

  let points = [];
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      let px = (i + 0.5) * (dim.x + pad + inner_pad_x);
      let py = (y - j - 0.5) * (dim.y + pad + inner_pad_y);
      let pos = vec(px, py, cell_dim.z / 10);
      let token_point: TokenPoint = { pos, rotation: cell_spec.rotation, spec: cell_spec.allowed_piece_specs[0] };
      points.push(token_point);
    }
  }

  points.reverse();

  if (cell_spec.piece_distribution == 'random' || cell_spec.piece_distribution == 'single') points = my_shuffle(points);

  return points;
}

// --- Constructors ---

export function board_cell(
  id: number,
  pos: Vec,
  dim: Vec,
  leave_empty: boolean,
  spec: BoardCellSpec,
  token_points: TokenPoint[] = []
): BoardCell {
  return { id, pos, dim, spec, token_points, leave_empty };
}
