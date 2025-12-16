import P5 from 'p5';
import { display_cell, display_piece, display_piece_shadow } from './display';
import { get_base_change_function } from './bases';
import { board_cell, board_cell_from_partition_cell, fill_with_cell_specs, get_token_points } from './grid';
import { get_piece_color_ids, get_piece_profiles, get_piece_specs, get_pieces } from './pieces';
import { create_supergrid } from './partition';
import { bg_col, BG_COLOR_ID, set_color_set } from './colors';
import { global_gradient } from './gradient';
import { palettes } from './color_catalogue';
import { PARAMS } from './params';
import { createHash } from './util';
import { BoardCell, Piece } from './interfaces';
import { reset_rng } from './random';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1400;

let board_cells: BoardCell[];
let pieces: Piece[];

let sketch = function (p: P5) {
  p.setup = function () {
    p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    p.pixelDensity(4);
    p.background(bg_col); // p.background('#f2f5e5');
    p.smooth();
    p.strokeJoin(p.ROUND);

    reset_canvas(p);
    create_new_board();
    draw_board(p);
  };

  p.draw = function () {};

  p.keyPressed = function () {
    if (p.keyCode === 80) p.saveCanvas('rounded-rects_' + Date.now(), 'jpeg'); // Press P to download image
    if (p.keyCode === 82) {
      // R
      reset_canvas(p);
      create_new_board();
      draw_board(p);
    } else if (p.keyCode === 84) {
      // T
      reset_canvas(p);
      create_new_pieces();
      draw_board(p);
    } else if (p.keyCode === 85) {
      // U
      reset_canvas(p);
      create_pieces();
      draw_board(p);
    }
  };
};

new P5(sketch);

function reset_canvas(p: P5) {
  p.translate(p.width / 2, p.height / 2);
  draw_background(p, 0);

  PARAMS.seed = createHash();
  reset_rng();
}

function create_new_board() {
  create_board_cells();
  fill_board_cells();
  create_pieces();
}

function create_new_pieces() {
  fill_board_cells();
  create_pieces();
}

function create_board_cells() {
  const dim = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT) * 1.6;
  board_cells = create_supergrid().map((pc) => board_cell_from_partition_cell(pc, dim));
}

function fill_board_cells() {
  let profiles = get_piece_profiles(PARAMS.piece_profile_count);
  let color_ids = get_piece_color_ids(PARAMS.piece_color_count);

  let piece_specs = get_piece_specs(profiles, color_ids);
  fill_with_cell_specs(board_cells, piece_specs);
  board_cells.forEach((c) => (c.token_points = get_token_points(c.dim, c.spec)));
}

function create_pieces() {
  pieces = get_pieces(board_cells);
}

// --- DRAW ---

function draw_background(p: P5, palette_id: number) {
  console.log('color id: ', palette_id);
  let color_set = palettes[palette_id].color_sets;
  //color_set = my_shuffle([...color_set]);
  set_color_set(color_set);

  p.drawingContext.fillStyle = global_gradient(p, BG_COLOR_ID);
  p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
}

function draw_board(p: P5) {
  let bc = get_base_change_function(1);
  board_cells.forEach((t) => display_cell(p, t, bc));
  pieces.forEach((t) => (t.shadow ? display_piece_shadow(p, t, bc) : {}));
  pieces.forEach((t) => display_piece(p, t, bc));
}
