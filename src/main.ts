import P5 from 'p5';
import { mul } from './vector';
import { display_cell, display_piece, display_piece_shadow } from './display';
import { get_base_change_function } from './bases';
import { board_cell, fill_with_cell_specs, get_token_points } from './grid';
import { get_piece_color_ids, get_piece_profiles, get_piece_specs, get_pieces } from './pieces';
import { create_supergrid } from './partition';
import { bg_col, BG_COLOR_ID, set_color_set } from './colors';
import { global_gradient } from './gradient';
import { palettes } from './color_catalogue';
import { PARAMS } from './params';
import { createHash } from './util';
import { reset } from './random';

let sketch = function (p: P5) {
  p.setup = function () {
    p.createCanvas(1000, 1400);
    p.pixelDensity(4);

    //p.background('#f2f5e5');
    p.background(bg_col);
    p.smooth();
    p.strokeJoin(p.ROUND);
    p.translate(p.width / 2, p.height / 2);

    let c_id = 0; //random_int(palettes.length);
    console.log('color id: ', c_id);
    let color_set = palettes[c_id].color_sets;
    //color_set = my_shuffle([...color_set]);
    set_color_set(color_set);

    p.drawingContext.fillStyle = global_gradient(p, BG_COLOR_ID);
    p.rect(-p.width / 2, -p.height / 2, p.width, p.height);

    let bc = get_base_change_function(1);

    p.strokeWeight(1);

    PARAMS.seed = createHash();
    reset();

    const number_of_profiles = 6;
    const number_of_colors = 2; //2 + random_int(4);

    console.log('number of colors: ', number_of_colors);

    const ref_dim = Math.max(p.width, p.height);

    let profiles = get_piece_profiles(number_of_profiles);
    let color_ids = get_piece_color_ids(number_of_colors);
    let piece_specs = get_piece_specs(profiles, color_ids);

    let partition_cells = create_supergrid();
    let board_cells = partition_cells.map((pc) =>
      //board_cell(pc.id, mul(pc.pos, p.width - 100), mul(pc.dim, p.width - 100), pc.leave_empty, null, [])
      board_cell(pc.id, mul(pc.pos, ref_dim * 1.6), mul(pc.dim, ref_dim * 1.6), pc.leave_empty, null)
    );

    fill_with_cell_specs(board_cells, piece_specs);

    board_cells.forEach((bc) => (bc.token_points = get_token_points(bc.dim, bc.spec)));
    board_cells.forEach((t) => display_cell(p, t, bc));

    let pieces = get_pieces(board_cells);
    pieces.forEach((t) => (t.shadow ? display_piece_shadow(p, t, bc) : {}));
    pieces.forEach((t) => display_piece(p, t, bc));
  };

  p.draw = function () {};

  p.keyPressed = function () {
    if (p.keyCode === 80) p.saveCanvas('rounded-rects_' + Date.now(), 'jpeg'); // Press P to download image
  };
};

new P5(sketch);
