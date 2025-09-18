import P5 from 'p5';
import { rounded_rect_points } from './shapes';
import { add, mul, nullVector, scale, vec } from './vector';
import { display_backdrop, display_cell, display_face_edge, display_pnts, display_shadow } from './display';
import { get_base_change_function } from './bases';
import { get_sides, get_silhouette } from './blocks';
import { board_cell, get_grid, get_token_points } from './grid';
import { get_piece_color_ids, get_piece_profiles, get_pieces, get_pieces2 } from './pieces';
import { create_supergrid } from './partition';
import { fill_cells_with_restrictions } from './restrictions';

let sketch = function (p: P5) {
  p.setup = function () {
    p.createCanvas(1500, 2100);
    p.background(220, 230, 210);
    p.smooth();
    p.strokeJoin(p.ROUND);
    p.translate(p.width / 2, p.height / 2);

    let bc = get_base_change_function(1, 0);

    p.strokeWeight(1);

    const number_of_profiles = 5;
    const number_of_colors = 5;
    const number_of_pieces = 250;

    const ref_dim = Math.max(p.width, p.height);

    let profiles = get_piece_profiles(number_of_profiles);
    let color_ids = get_piece_color_ids(number_of_colors);

    let partition_cells = create_supergrid();
    let board_cells = partition_cells.map((pc) =>
      board_cell(pc.id, nullVector(), mul(pc.pos, ref_dim + 700), mul(pc.dim, ref_dim + 700), Math.random() < 0.5)
    );

    fill_cells_with_restrictions(board_cells, profiles, color_ids);

    board_cells.forEach(
      (bc) =>
        (bc.token_points = get_token_points(
          bc.dim,
          profiles.filter((p) => bc.restrictions.profile_id(p.id)),
          bc.orderly
        ))
    );

    board_cells.forEach((t) => display_cell(p, t, bc));
    console.log(partition_cells);

    //let cells = get_grid(grid_dim, number_of_cells, profiles, color_ids);
    //cells.forEach((t) => display_cell(p, t, bc));

    //let pieces = get_pieces2(number_of_pieces, profiles, color_ids, board_cells);
    let pieces = get_pieces(profiles, color_ids, board_cells);
    console.log(board_cells);
    console.log(pieces.length);

    for (let i = 0; i < pieces.length; i++) {
      let piece = pieces[i];
      if (piece.spec == undefined) continue;

      let pos = piece.pos;
      let profile = piece.spec.profile;
      let height = piece.spec.profile.dim.z;
      let color_id = piece.spec.color_id;

      let shadow_dir = vec(-height / 3, height / 2);

      let pnts = rounded_rect_points(pos, profile.dim, profile.corner_radius, 1, piece.rotation);

      let top_pnts = pnts.map((t) => scale({ ...t, z: height }, pos, profile.tapering));
      let s_pnts = pnts.map((t) => scale({ ...t, z: -3 }, pos, 1.05));

      let sides = get_sides(pnts, vec(0, 0, height), profile.tapering, pos);
      let shadow_silhouette = get_silhouette(s_pnts, shadow_dir, profile.tapering, pos);

      display_shadow(p, shadow_silhouette, 50, bc);

      sides.forEach((s) => display_backdrop(p, s, color_id, bc));
      display_backdrop(p, top_pnts, color_id, bc);

      sides.forEach((s) => display_pnts(p, s, color_id, 10, bc));
      display_pnts(p, top_pnts, color_id, 10, bc);
      display_face_edge(p, top_pnts, color_id, bc);
    }
  };

  p.draw = function () {};

  p.keyPressed = function () {
    if (p.keyCode === 80) p.saveCanvas('rounded-rects_' + Date.now(), 'jpeg'); // Press P to download image
  };
};

new P5(sketch);
