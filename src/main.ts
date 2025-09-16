import P5 from 'p5';
import { rounded_rect_points } from './shapes';
import { add, scale, vec } from './vector';
import { display_backdrop, display_cell, display_pnts, display_shadow } from './display';
import { get_base_change_function } from './bases';
import { get_sides, get_silhouette } from './blocks';
import { color_set } from './colors';
import { get_grid } from './grid';
import { my_shuffle } from './util';

let sketch = function (p: P5) {
  p.setup = function () {
    p.createCanvas(900, 1200);
    p.background(220, 230, 210);
    p.smooth();
    p.strokeJoin(p.ROUND);
    p.translate(p.width / 2, p.height / 2);

    let bc = get_base_change_function(1, 0);

    p.stroke(0, 50);
    p.strokeWeight(2);
    // let grid = get_grid_positions(vec(p.width + 1400, p.height + 1400), vec(15, 10), bc);
    // grid.forEach((g) => {
    //   p.line(g[0].x, g[0].y, g[1].x, g[1].y);
    // });

    let cells = get_grid(vec(p.width + 1400, p.height + 1400), vec(15, 10));
    cells.forEach((t) => display_cell(p, t, bc));

    let token_points = cells.flatMap((c) => c.token_points.map((tp) => add(tp, c.pos)));
    my_shuffle(token_points);
    console.log(token_points.length);

    token_points = token_points.slice(0, 200);

    token_points.sort((a, b) => b.x + b.y - (a.x + a.y));

    for (let i = 0; i < token_points.length; i++) {
      let pos = token_points[i];
      let dim = vec(30 + Math.random() * 30, 30 + Math.random() * 30);

      let height = 20 + Math.random() * 20;
      let rotation = (Math.random() - 0.5) * Math.PI * 2;
      let corner_radius = (Math.random() * Math.min(dim.x, dim.y)) / 2;
      let tapering = 0.95;

      //let color_indexes = [...new Array(color_set.length)].map((i => i)).filter();

      let color_id = Math.floor(Math.random() * color_set.length);

      let shadow_dir = vec(0, height);

      let pnts = rounded_rect_points(pos, dim, corner_radius, 1, rotation);

      let top_pnts = pnts.map((t) => scale({ ...t, z: height }, pos, tapering));
      let s_pnts = pnts.map((t) => scale({ ...t, z: -2 }, pos, 1.05));

      let sides = get_sides(pnts, vec(0, 0, height), tapering, pos);
      let backdrop_silhouette = get_silhouette(pnts, vec(0, 0, height), tapering, pos);
      let shadow_silhouette = get_silhouette(s_pnts, shadow_dir, tapering, pos);

      display_shadow(p, shadow_silhouette, 50, bc);

      //display_backdrop(p, backdrop_silhouette, color_id, bc);

      sides.forEach((s) => display_backdrop(p, s, color_id, bc));
      display_backdrop(p, top_pnts, color_id, bc);

      sides.forEach((s) => display_pnts(p, s, color_id, 10, bc));
      display_pnts(p, top_pnts, color_id, 5, bc);
    }
  };

  p.draw = function () {};

  p.keyPressed = function () {
    if (p.keyCode === 80) p.saveCanvas('rounded-rects_' + Date.now(), 'jpeg'); // Press P to download image
  };
};

new P5(sketch);
