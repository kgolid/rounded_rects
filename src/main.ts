import P5 from 'p5';
import { rounded_rect_points } from './shapes';
import { add, mul, sub, translateWithBase, vec } from './vector';
import { display_backdrop, display_pnts, display_shadow } from './display';
import { get_base_change_function, get_shadow_base_change_function } from './bases';
import { get_sides, get_sides2, get_silhouette } from './blocks';
import { color_set } from './colors';
import { get_grid_positions } from './grid';

let sketch = function (p: P5) {
  p.setup = function () {
    p.createCanvas(900, 1200);
    p.background(200, 210, 180);
    p.smooth();
    p.strokeJoin(p.ROUND);
    p.translate(p.width / 2, p.height / 2);

    let bc = get_base_change_function(1, 0);

    p.stroke(0, 50);
    p.strokeWeight(2);
    let grid = get_grid_positions(vec(p.width + 1400, p.height + 1400), vec(10, 10), bc);
    grid.forEach((g) => {
      p.line(g[0].x, g[0].y, g[1].x, g[1].y);
    });

    let padding = 180;

    for (let i = 0; i < 18; i++) {
      for (let j = 0; j < 18; j++) {
        if (Math.random() < 0.5) continue;
        let dim = vec(50 + Math.random() * 40, 50 + Math.random() * 40);
        let height = 20 + Math.random() * 30;
        let shadow_dir = vec(height / 2, -height, 0);
        let corner_radius = 5 + Math.random() * 20;
        let rotation = Math.random() * 2 - 1;
        let rect_pos = vec(800 - j * padding, 800 - i * padding);
        let rect_dim = vec(dim.x, dim.y, -height);

        let center = add(rect_pos, mul(rect_dim, 0.5));

        let pnts = rounded_rect_points(rect_pos, rect_dim, corner_radius, 2, rotation);

        let s_pnts = rounded_rect_points(
          sub(rect_pos, mul(shadow_dir, 0.96)),
          vec(dim.x, dim.y, 3),
          corner_radius,
          2,
          rotation
        );
        let sides = get_sides(pnts, vec(0, 0, -height), 1, center);
        let color_id = Math.floor(Math.random() * color_set.length);

        //s_sides.forEach((s) => display_shadow(p, s, 50, bc));
        //display_shadow(p, s_pnts, 50, bc);

        let s_silhouette = get_silhouette(s_pnts, shadow_dir, 1, center);
        display_shadow(p, s_silhouette, 50, bc);

        let backdrop = get_silhouette(pnts, vec(0, 0, -height), 1, center);
        display_backdrop(p, backdrop, color_id, bc);

        sides.forEach((s) => display_pnts(p, s, color_id, 1, bc));
        display_pnts(p, pnts, color_id, 5, bc);
      }
    }
  };

  p.draw = function () {};

  p.keyPressed = function () {
    if (p.keyCode === 80) p.saveCanvas('rounded-rects_' + Date.now(), 'jpeg'); // Press P to download image
  };
};

new P5(sketch);
