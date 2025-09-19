import p5 from 'p5';
import { BoardCell, Shape, Vec } from './interfaces';
import { add, shape, sub, vec } from './vector';
import { illuminanceOfEdge, illuminanceOfShape } from './light';
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

export function display_face_edge(p: p5, pnts: Vec[], color_id: number, bc: (_: Vec) => Vec) {
  const flat_quad = shape(vec(100, 0, 0), vec(0, 100, 0), vec(-100, 0, 0), vec(0, -100, 0));

  for (let i = 0; i < pnts.length - 1; i++) {
    let l1 = pnts[i];
    let l2 = pnts[i + 1];
    if (l1.x - l1.y > l2.x - l2.y) continue;
    let c1 = shape(l1, l2, add(l2, vec(0, 0, 10)), add(l1, vec(0, 0, 10)));

    const colorset = color_set[color_id];

    const scale = lch_scale(colorset.c, 10); // TODO: number of levels
    const illuminance = illuminanceOfEdge(sun, l1, l2, flat_quad, c1);
    const col = scale[Math.floor(illuminance * scale.length)];

    p.strokeWeight(2);
    p.stroke(col);
    draw_line(p, l1, l2, bc);
  }
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

function draw_line(p: p5, l1: Vec, l2: Vec, bc: (pnt: Vec) => Vec) {
  const p1 = bc(l1);
  const p2 = bc(l2);
  p.line(p1.x, p1.y, p2.x, p2.y);
}

export function display_cell(p: p5, cell: BoardCell, bc: (_: Vec) => Vec) {
  let dim = sub(cell.dim, vec(8, 8));
  let pnts = [
    cell.pos,
    vec(cell.pos.x, cell.pos.y + dim.y),
    vec(cell.pos.x + dim.x, cell.pos.y + dim.y),
    vec(cell.pos.x + dim.x, cell.pos.y),
  ];

  // let illuminance = get_illum(pnts);
  // let palette = lch_scale(color_set[1].c, 5);

  // let color = palette[Math.floor(illuminance * palette.length)];
  //p.fill(230, 240, 220);
  p.noFill();
  p.stroke(0, 20);
  p.strokeWeight(2);

  p.beginShape();
  for (let i = 0; i < pnts.length; i++) {
    let pnt = bc(pnts[i]);
    p.vertex(pnt.x, pnt.y);
  }
  p.endShape(p.CLOSE);

  if (cell.token_points.length == 0) {
    let s = shape(bc(pnts[0]), bc(pnts[1]), bc(pnts[2]), bc(pnts[3]));
    p.strokeWeight(2);
    hatchParallelogram(p, s, 6, Math.PI / 5);

    //p.line(bc(pnts[0]).x, bc(pnts[0]).y, bc(pnts[2]).x, bc(pnts[2]).y);
    //p.line(bc(pnts[1]).x, bc(pnts[1]).y, bc(pnts[3]).x, bc(pnts[3]).y);
  } else {
    let tpos = bc(add(pnts[0], vec(10, 10)));
    p.push();
    p.fill('#9aa297');
    p.noStroke();
    p.translate(tpos.x, tpos.y);
    p.scale(1, Math.cos(Math.PI / 3) / Math.sin(Math.PI / 3));
    p.rotate(-Math.PI / 4);
    p.textSize(18);
    p.textStyle(p.BOLD);
    p.text('C-' + cell.id + '-' + random_int(100), 0, 0);
    p.pop();
  }
}
