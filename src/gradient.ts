import p5 from 'p5';
import { Vec } from './interfaces';
import { illuminanceOfQuad } from './light';
import { quad, vec } from './vector';
import { lch_scale } from './lch_scale';
import { get_color_set } from './colors';

export function global_gradient(p: p5, color_id: number) {
  let gradient = p.drawingContext.createLinearGradient(0, -p.height / 2, 0, p.height / 2);

  let range = 1500;

  let upper_col = get_col(vec(range, range), color_id);
  let middle_col = get_col(vec(0, 0), color_id);
  let lower_col = get_col(vec(-range, -range), color_id);

  gradient.addColorStop(0, upper_col);
  gradient.addColorStop(0.5, middle_col);
  gradient.addColorStop(1, lower_col);

  return gradient;
}

function get_col(pos: Vec, color_id: number) {
  let q = quad(
    vec(pos.x - 5, pos.y - 5),
    vec(pos.x + 5, pos.y - 5),
    vec(pos.x + 5, pos.y + 5),
    vec(pos.x - 5, pos.y + 5)
  );
  let illuminance = illuminanceOfQuad(q);
  let palette = lch_scale(get_color_set()[color_id].c, 20);

  return palette[Math.floor(illuminance * palette.length)];
}
