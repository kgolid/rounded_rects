import { Vec } from './interfaces';
import { mul, vec } from './vector';

export function get_grid_positions(dim: Vec, line_num: Vec, bc: (_: Vec) => Vec) {
  let array = [];

  let pos = mul(dim, -1 / 2);
  let line_dist = vec(dim.x / line_num.x, dim.y / line_num.y);

  for (let i = 0; i < line_num.x; i++) {
    const start = vec(pos.x, pos.y + i * line_dist.y);
    const end = vec(pos.x + dim.x, pos.y + i * line_dist.y);
    array.push([bc(start), bc(end)]);
  }

  for (let i = 0; i < line_num.y; i++) {
    const start = vec(pos.x + i * line_dist.x, pos.y);
    const end = vec(pos.y + i * line_dist.x, pos.y + dim.y);
    array.push([bc(start), bc(end)]);
  }

  return array;
}
