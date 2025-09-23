import { generate_cell_id } from './globals';
import { PartitionCell, Vec } from './interfaces';
import { my_shuffle, random_int } from './util';
import { add, nullVector, sub, vec } from './vector';

const min_dim = 0.08;
const slice_chance = 0.25;
const PAD_RATIO = 0.003; //0.008;
const terminal_chance: (d: number) => number = (d) => (d - 4) / 20;

export function create_supergrid() {
  let grid: PartitionCell[] = [cell(vec(-0.5, -0.5), vec(1, 1, 0), 0)];

  let splitted = divide_cells_repeatedly(grid, 0);
  return splitted;
}

function divide_cells_repeatedly(cells: PartitionCell[], iteration: number) {
  let chance = Math.sqrt((200 - iteration) / 50);

  if (Math.random() >= chance) {
    console.log('hit above ' + Math.round(chance * 100) / 100 + ' after ' + iteration + ' iterations.');
    return cells;
  }

  let cells_big_enough = cells.filter((c) => (c.dim.x > min_dim * 1.1 || c.dim.y > min_dim * 1.1) && !c.terminal);

  if (cells_big_enough.length == 0) {
    console.log('none big enough, after ' + iteration + ' iterations.');
    return cells;
  }

  let ids = new Set(cells_big_enough.map((c) => c.id));

  let pick_id = my_shuffle(Array.from(ids))[0];

  let picked_cells = cells
    .filter((c) => c.id == pick_id)
    .map((c) => pad_cell(c, c.depth < 9 ? PAD_RATIO / (1 + c.depth) : 0));
  let unpicked_cells = cells.filter((c) => c.id != pick_id);

  let divided_cells = divide_cell(picked_cells[0], iteration);

  let new_cells = picked_cells.flatMap((pc) =>
    divided_cells.map((dc) => cell(add(pc.pos, dc.pos), dc.dim, dc.depth, dc.terminal, dc.id))
  );

  // let picks_size = Math.ceil(ids.size / 2);
  // let picks = my_shuffle([...cells]).slice(0, picks_size);

  // picks.sort((c, d) => d.dim.x * d.dim.y - c.dim.x * c.dim.y);

  // let pick_id = picks[0].id;
  // let pick_index = cells.findIndex((t) => t.id == pick_id);

  // cells.splice(pick_index, 1, ...divide_cell(cells[pick_index]));

  return divide_cells_repeatedly([...unpicked_cells, ...new_cells], iteration + 1);
}

function divide_cell(c: PartitionCell, iteration: number): PartitionCell[] {
  let pad = 0; //(0.1 / (c.depth + 1)) ** 1.5;
  //if (iteration < 1) return split_cell(c, pad);

  let pick_slice = Math.random() < slice_chance;
  if (pick_slice) return slice_cell(c, pad);
  return split_cell(c, pad);
}

function slice_cell(c: PartitionCell, pad: number): PartitionCell[] {
  let max_x_cells = Math.min(5, Math.floor(c.dim.x / min_dim));
  let max_y_cells = Math.min(5, Math.floor(c.dim.y / min_dim));

  let x_cells = 1 + random_int(max_x_cells);
  let y_cells = 1 + random_int(max_y_cells);

  let depth_increase = Math.round(Math.log2(x_cells * y_cells));

  let cell_width = c.dim.x / x_cells;
  let cell_height = c.dim.y / y_cells;

  let depth = c.depth + depth_increase;
  let terminal = Math.random() < terminal_chance(depth);

  let id = generate_cell_id();
  let cells = [];
  for (let j = 0; j < y_cells; j++) {
    for (let i = 0; i < x_cells; i++) {
      let pos = vec(i * cell_width, j * cell_height, 0);
      let dim = vec(cell_width, cell_height, c.dim.z);

      let new_cell = cell(pos, dim, depth, terminal, id);
      cells.push(new_cell);
    }
  }

  console.log(c.id + ' -' + x_cells + ',' + y_cells + '-> ' + id);

  return cells;
}

function split_cell(c: PartitionCell, pad: number): PartitionCell[] {
  if (c.dim.x < min_dim) return split_cell_horisontally(c, pad);
  if (c.dim.y < min_dim) return split_cell_vertically(c, pad);

  let hw_ratio = c.dim.x / (c.dim.x + c.dim.y); // Big number means wide cell, small number means tall cell.
  let pick_horisontal = 0.5 > Math.random(); //hw_ratio;

  if (pick_horisontal) return split_cell_horisontally(c, pad);
  else return split_cell_vertically(c, pad);
}

function split_cell_horisontally(c: PartitionCell, pad: number): PartitionCell[] {
  let r1 = (Math.random() + Math.random() + Math.random()) / 3;
  let r = 0.1 + r1 * 0.8;

  let split_y = c.dim.y * r;

  let min_dim = Math.min(c.dim.x, c.dim.y) / 2;
  let h1 = min_dim * (1 + Math.random() ** 4);
  let h2 = min_dim * (1 + Math.random() ** 4);

  let depth = c.depth + 1;
  let terminal = Math.random() < terminal_chance(depth);

  let c1 = cell(nullVector(), vec(c.dim.x, split_y - pad, h1), depth, terminal);

  let c2 = cell(vec(0, split_y + pad, 0), vec(c.dim.x, c.dim.y - split_y - pad, h2), depth, terminal);

  console.log(c.id + ' -h-> ' + c1.id + ', ' + c2.id);

  return [c1, c2];
}

function split_cell_vertically(c: PartitionCell, pad: number): PartitionCell[] {
  let r1 = (Math.random() + Math.random() + Math.random()) / 3;
  let r = 0.1 + r1 * 0.8;

  let split_x = c.dim.x * r;

  let min_dim = Math.min(c.dim.x, c.dim.y) / 2;
  let h1 = min_dim * (1 + Math.random() ** 4);
  let h2 = min_dim * (1 + Math.random() ** 4);

  let depth = c.depth + 1;
  let terminal = Math.random() < terminal_chance(depth);

  let c1 = cell(nullVector(), vec(split_x - pad, c.dim.y, h1), depth, terminal);

  let c2 = cell(vec(split_x + pad, 0, 0), vec(c.dim.x - split_x - pad, c.dim.y, h2), depth, terminal);
  console.log(c.id + ' -v-> ' + c1.id + ', ' + c2.id);

  return [c1, c2];
}

function pad_cell(c: PartitionCell, pad: number) {
  return cell(add(c.pos, vec(pad, pad)), sub(c.dim, vec(pad * 2, pad * 2)), c.depth, c.terminal, c.id);
}

function cell(pos: Vec, dim: Vec, depth: number, terminal: boolean = false, id: number = -1): PartitionCell {
  if (id == -1) id = generate_cell_id();
  //let terminal = Math.random() < (depth - 5) / 15;

  return { pos, dim, id, depth, terminal };
}
