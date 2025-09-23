import P5 from 'p5';
import { mul, nullVector } from './vector';
import { display_cell, display_piece, display_piece_shadow } from './display';
import { get_base_change_function } from './bases';
import { board_cell, get_token_points } from './grid';
import { get_piece_color_ids, get_piece_profiles, get_piece_specs, get_pieces } from './pieces';
import { create_supergrid } from './partition';
import { fill_cells_with_restrictions } from './restrictions';

let sketch = function (p: P5) {
  p.setup = function () {
    p.createCanvas(1500, 2100);
    p.pixelDensity(4);
    p.background('#c9cdc1');
    p.smooth();
    p.strokeJoin(p.ROUND);
    p.translate(p.width / 2, p.height / 2);

    let bc = get_base_change_function(1, 0);

    p.strokeWeight(1);

    const number_of_profiles = 5;
    const number_of_colors = 5;

    const ref_dim = Math.max(p.width, p.height);

    let profiles = get_piece_profiles(number_of_profiles);
    let color_ids = get_piece_color_ids(number_of_colors);
    let specs = get_piece_specs(profiles, color_ids);

    let partition_cells = create_supergrid();
    let board_cells = partition_cells.map((pc) =>
      board_cell(pc.id, nullVector(), mul(pc.pos, ref_dim + 900), mul(pc.dim, ref_dim + 900), false)
    );

    fill_cells_with_restrictions(board_cells, specs, profiles);

    board_cells.forEach(
      (bc) =>
        (bc.token_points = get_token_points(
          bc.dim,
          profiles.filter((p) => bc.restrictions.profile_id(p.id)),
          bc.orderly,
          bc.rotation
        ))
    );

    board_cells.forEach((t) => display_cell(p, t, bc));

    let pieces = get_pieces(specs, board_cells);
    pieces.forEach((t) => (t.shadow ? display_piece_shadow(p, t, bc) : {}));
    pieces.forEach((t) => display_piece(p, t, bc));
  };

  p.draw = function () {};

  p.keyPressed = function () {
    if (p.keyCode === 80) p.saveCanvas('rounded-rects_' + Date.now(), 'jpeg'); // Press P to download image
  };
};

new P5(sketch);
