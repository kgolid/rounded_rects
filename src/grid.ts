import { color_set } from './colors';
import { Cell, RestrictionMap, Vec } from './interfaces';
import { random_int } from './util';
import { mul, vec } from './vector';
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

export function get_grid(grid_dim: Vec, cell_num: Vec) {
  let pos = mul(grid_dim, -1 / 2);
  let cell_dim = vec(grid_dim.x / cell_num.x, grid_dim.y / cell_num.y);

  let cells: Cell[] = [];
  for (let j = 0; j < cell_num.y; j++) {
    for (let i = 0; i < cell_num.x; i++) {
      let cell_pos = vec(pos.x + cell_dim.x * i, pos.y + cell_dim.y * j);
      let cell = get_cell(cell_pos, cell_dim);
      cells.push(cell);
    }
  }

  return cells;
}

function get_cell(pos: Vec, dim: Vec): Cell {
  let token_points = get_token_points(dim);
  let col_idx = random_int(color_set.length);
  let col_idx2 = random_int(color_set.length);
  let restrictions: RestrictionMap = { color: (t: number) => t == col_idx || t == col_idx2 };
  return { pos, dim, token_points, restrictions };
}

function get_token_points(cell_dim: Vec) {
  let pad = 50;
  const sampling = new PoissonDiskSampling({
    shape: [cell_dim.x - pad * 2, cell_dim.y - pad * 2],
    minDistance: 70,
    tries: 50,
  });
  return sampling.fill().map((d: number[]) => vec(d[0] + pad, d[1] + pad, 0));
}
