import { BoardCell, PieceProfile, RestrictionMap, Vec } from './interfaces';
import { trivial_restriction } from './restrictions';
import { mag, mul, sub, vec } from './vector';
import PoissonDiskSampling from 'poisson-disk-sampling';

export function get_token_points(
  cell_dim: Vec,
  possible_profiles: PieceProfile[],
  orderly: boolean,
  rotation: number
): Vec[] {
  if (possible_profiles.length == 0) return [];
  if (possible_profiles.length == 1 && orderly)
    return Math.random() < 0.5
      ? get_orderly_token_points(cell_dim, possible_profiles[0].dim, rotation)
      : get_orderly_token_points2(cell_dim, possible_profiles[0].dim, rotation);

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

function get_orderly_token_points(cell_dim: Vec, token_dim: Vec, rotation: number): Vec[] {
  let dim = rotation == 0 ? token_dim : vec(token_dim.y, token_dim.x, token_dim.z);
  let pad = 15;
  let x = Math.floor((cell_dim.x - pad * 2) / (dim.x + pad));
  let y = Math.floor((cell_dim.y - pad * 2) / (dim.y + pad));

  let rest_x = cell_dim.x - pad * 2 - (dim.x + pad) * x;
  let rest_y = cell_dim.y - pad * 2 - (dim.y + pad) * y;

  let points = [];
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      let px = pad + rest_x / 2 + (i + 0.5) * (dim.x + pad);
      let py = pad + rest_y / 2 + (y - j - 0.5) * (dim.y + pad);
      points.push(vec(px, py));
    }
  }

  points.reverse();

  return points;
}

function get_orderly_token_points2(cell_dim: Vec, token_dim: Vec, rotation: number): Vec[] {
  let dim = rotation == 0 ? token_dim : vec(token_dim.y, token_dim.x, token_dim.z);
  let pad = 15;
  let frame = 5;
  let x = Math.floor((cell_dim.x - frame * 2) / (dim.x + pad));
  let y = Math.floor((cell_dim.y - frame * 2) / (dim.y + pad));

  let rest_x = cell_dim.x - frame * 2 - (dim.x + pad) * x;
  let rest_y = cell_dim.y - frame * 2 - (dim.y + pad) * y;

  let inner_pad_x = rest_x / x;
  let inner_pad_y = rest_y / y;

  let points = [];
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      let px = frame + (i + 0.5) * (dim.x + pad + inner_pad_x);
      let py = frame + (y - j - 0.5) * (dim.y + pad + inner_pad_y);
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
  rotation: number = 0,
  token_points: Vec[] = [],
  restrictions: RestrictionMap = trivial_restriction
): BoardCell {
  return { id, grid_pos, pos, dim, orderly, rotation, token_points, restrictions };
}
