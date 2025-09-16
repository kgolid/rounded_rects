import p5 from 'p5';
import { Shape, Vec } from './interfaces';
import { vec } from './vector';
import { illuminanceOfShape } from './light';
import { color_set } from './colors';
import { lch_scale } from './lch_scale';

let sun = vec(-1400, -2200, 2500);

export function display_pnts(
  p: p5,
  pnts: Vec[],
  color_id: number,
  color_levels: number,
  bc: (_: Vec) => Vec,
  outline: boolean = false
) {
  let illuminance = get_illum(pnts);
  let palette = lch_scale(color_set[color_id].c, color_levels);

  let color = palette[Math.floor(illuminance * palette.length)];
  p.fill(color);
  p.stroke(outline ? color_set[color_id].s : color);
  p.strokeWeight(1);
  p.beginShape();
  for (let i = 0; i < pnts.length; i++) {
    let pnt = bc(pnts[i]);
    p.vertex(pnt.x, pnt.y);
  }
  p.endShape(p.CLOSE);
}

function get_illum(pnts: Vec[]) {
  let shape: Shape =
    pnts.length > 4
      ? {
          d: pnts[Math.floor(pnts.length * 0.875)],
          c: pnts[Math.floor(pnts.length * 0.625)],
          b: pnts[Math.floor(pnts.length * 0.375)],
          a: pnts[Math.floor(pnts.length * 0.125)],
        }
      : { a: pnts[3], b: pnts[2], c: pnts[1], d: pnts[0] };

  return illuminanceOfShape(sun, shape);
}

export function display_backdrop(p: p5, pnts: Vec[], color_id: number, bc: (_: Vec) => Vec) {
  let palette = color_set[color_id];
  let color = palette.s;

  p.fill(color);
  p.stroke(color);
  p.strokeWeight(5);
  p.beginShape();
  for (let i = 0; i < pnts.length; i++) {
    let pnt = bc(pnts[i]);
    p.vertex(pnt.x, pnt.y);
  }
  p.endShape(p.CLOSE);
}

export function display_shadow(p: p5, pnts: Vec[], opacity: number, bc: (_: Vec) => Vec) {
  p.fill(0, opacity);
  p.noStroke();
  p.beginShape();
  for (let i = 0; i < pnts.length; i++) {
    let pnt = bc(pnts[i]);
    p.vertex(pnt.x, pnt.y);
  }
  p.endShape(p.CLOSE);
}
