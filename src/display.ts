import p5 from 'p5';
import { BoardCell, Piece, Quad, Vec } from './interfaces';
import { add, lerp, mul, nullVector, quad, scale, sub, vec } from './vector';
import { illuminanceOfEdge, illuminanceOfQuad } from './light';
import { BG_COLOR_ID, get_color_set } from './colors';
import { lch_scale } from './lch_scale';
import { circle_points, rounded_rect_points } from './shapes';
import { get_sides, get_silhouette } from './blocks';
import { get_alpha, pad_number, random_int } from './util';
import { hatchParallelogram } from './hatch';
import { BASIS_ROTATION, BASIS_SQUISH } from './globals';
import { global_gradient } from './gradient';

export function display_piece_shadow(p: p5, piece: Piece, bc: (_: Vec) => Vec) {
  if (piece.spec == undefined) return;

  let pos = piece.pos;
  let profile = piece.spec.profile;
  let height = piece.spec.profile.dim.z;

  let shadow_dir = vec(-height / 3, height / 2);

  let pnts = rounded_rect_points(pos, profile.dim, profile.corner_radius, 1, piece.rotation);
  let s_pnts = pnts.map((t) => ({ ...t, z: pos.z - 3 }));
  let shadow_silhouette = get_silhouette(s_pnts, shadow_dir, profile.tapering, pos);

  display_shadow(p, shadow_silhouette, 100, bc);
}

export function display_piece(p: p5, piece: Piece, bc: (_: Vec) => Vec) {
  if (piece.spec == undefined) return;

  let pos = piece.pos;
  let profile = piece.spec.profile;
  let height = piece.spec.profile.dim.z;
  let color_id = piece.spec.color_id;

  let pnts = rounded_rect_points(pos, profile.dim, profile.corner_radius, 1, piece.rotation);
  let top_pnts = pnts.map((t) => scale({ ...t, z: t.z + height }, pos, profile.tapering));
  let sides = get_sides(pnts, vec(0, 0, height), profile.tapering, pos);

  sides.forEach((s) => display_backdrop(p, s, color_id, bc));
  display_backdrop(p, top_pnts, color_id, bc);

  sides.forEach((s) => display_pnts(p, s, color_id, 20, bc));
  display_pnts(p, top_pnts, color_id, 20, bc);
  display_face_edge(p, top_pnts, color_id, bc);
}

export function display_pnts(
  p: p5,
  pnts: Vec[],
  color_id: number,
  color_levels: number,
  bc: (_: Vec) => Vec,
  outline: boolean = false
) {
  let illuminance = get_illum(pnts);
  let palette = lch_scale(get_color_set()[color_id].c, color_levels);

  let color = palette[Math.floor(illuminance * palette.length)];
  p.fill(color);
  p.stroke(outline ? get_color_set()[color_id].s : color);
  p.strokeWeight(1);
  p.beginShape();
  for (let i = 0; i < pnts.length; i++) {
    let pnt = bc(pnts[i]);
    p.vertex(pnt.x, pnt.y);
  }
  p.endShape(p.CLOSE);
}

function get_illum(pnts: Vec[]) {
  let q: Quad =
    pnts.length > 4
      ? {
          d: pnts[Math.floor(pnts.length * 0.875)],
          c: pnts[Math.floor(pnts.length * 0.625)],
          b: pnts[Math.floor(pnts.length * 0.375)],
          a: pnts[Math.floor(pnts.length * 0.125)],
        }
      : { a: pnts[3], b: pnts[2], c: pnts[1], d: pnts[0] };

  return illuminanceOfQuad(q);
}

export function display_backdrop(p: p5, pnts: Vec[], color_id: number, bc: (_: Vec) => Vec) {
  let palette = get_color_set()[color_id];
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
  const flat_quad = quad(vec(100, 0, 0), vec(0, 100, 0), vec(-100, 0, 0), vec(0, -100, 0));

  for (let i = 0; i < pnts.length - 1; i++) {
    let l1 = pnts[i];
    let l2 = pnts[i + 1];
    if (l1.x - l1.y > l2.x - l2.y) continue;
    let c1 = quad(l1, l2, add(l2, vec(0, 0, 10)), add(l1, vec(0, 0, 10)));

    const colorset = get_color_set()[color_id];

    const scale = lch_scale(colorset.c, 20); // TODO: number of levels
    const illuminance = illuminanceOfEdge(l1, l2, flat_quad, c1);
    const col = scale[Math.floor(illuminance * scale.length)];

    p.strokeWeight(2);
    p.stroke(col);
    draw_line(p, l1, l2, bc);
  }
}

export function display_shadow(p: p5, pnts: Vec[], opacity: number, bc: (_: Vec) => Vec) {
  //p.fill(0, opacity);
  //p.fill(cell_stroke_col);
  p.fill(get_color_set()[BG_COLOR_ID].s);
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
  let pad = nullVector(); //vec(8, 8);
  let dim = sub(cell.dim, pad);
  let pos = add({ ...cell.pos, z: dim.z / 10 }, mul(pad, 0.5));
  let pnts = [
    pos,
    vec(pos.x, pos.y + dim.y, pos.z),
    vec(pos.x + dim.x, pos.y + dim.y, pos.z),
    vec(pos.x + dim.x, pos.y, pos.z),
  ];

  p.stroke(get_color_set()[BG_COLOR_ID].s);
  //p.stroke(cell_stroke_col);
  p.strokeWeight(2);

  //p.fill(bg_col);

  p.drawingContext.fillStyle = global_gradient(p, BG_COLOR_ID);

  p.beginShape();
  for (let i = 0; i < pnts.length; i++) {
    let pnt = bc(pnts[i]);
    p.vertex(pnt.x, pnt.y);
  }
  p.endShape(p.CLOSE);

  if (
    cell.spec &&
    cell.spec.type == 'grid' &&
    cell.spec.grid_layout == 'space-between' &&
    (cell.spec.grid_dim.x > 1 || cell.spec.grid_dim.y > 1) &&
    cell.token_points.length > 0
  ) {
    let gd = cell.spec.grid_dim;

    for (let i = 0; i < gd.x; i++) {
      let p0 = bc(lerp(pnts[1], pnts[2], i / gd.x));
      let p1 = bc(lerp(pnts[0], pnts[3], i / gd.x));
      p.line(p0.x, p0.y, p1.x, p1.y);
    }

    for (let i = 0; i < gd.y; i++) {
      let p0 = bc(lerp(pnts[0], pnts[1], i / gd.y));
      let p1 = bc(lerp(pnts[3], pnts[2], i / gd.y));
      p.line(p0.x, p0.y, p1.x, p1.y);
    }

    let num = random_int(100);
    for (let i = 0; i < gd.x; i++) {
      let px = lerp(pnts[0], pnts[3], (i + 0.5) / gd.x);
      for (let j = 0; j < gd.y; j++) {
        let py = lerp(pnts[0], pnts[1], (j + 0.5) / gd.y);
        let tpos = bc(add(vec(px.x, py.y, px.z), vec(0, 0)));

        let alpha = get_alpha(gd.x - 1 - (i % 26));
        let coordinate_label = '' + num + '-' + alpha + '' + (j + 1);
        let linear_label = '' + num + '-' + ((gd.x - 1 - i) * gd.y + j);

        let label = cell.spec.indexing == 'coordinate' ? coordinate_label : linear_label;

        display_text(p, tpos, label, 16, true);
      }
    }
  } else if (cell.spec.type == 'empty') {
    let s = quad(bc(pnts[0]), bc(pnts[1]), bc(pnts[2]), bc(pnts[3]));
    p.strokeWeight(2);
    hatchParallelogram(p, s, 6, BASIS_ROTATION * (Math.PI / 12));

    if (cell.leave_empty) {
      let tpos = add(pnts[0], vec(10, 10));
      display_text(p, bc(tpos), 'G-' + cell.id, 18, false);
    } else if (cell.spec.show_index) {
      let px = lerp(pnts[0], pnts[3], 0.5);
      let py = lerp(pnts[0], pnts[1], 0.5);
      let tpos = add(vec(px.x, py.y, px.z), vec(0, 0));
      //p.fill(bg_col);

      let circle_pnts = circle_points(tpos, 25, 2);

      p.beginShape();
      for (let i = 0; i < circle_pnts.length; i++) {
        let pnt = bc(circle_pnts[i]);
        p.vertex(pnt.x, pnt.y);
      }
      p.endShape(p.CLOSE);

      //p.ellipse(tpos.x, tpos.y, 50, 50);

      display_text(p, bc(tpos), pad_number(random_int(100), 2), 26, true);
    }

    //p.line(bc(pnts[0]).x, bc(pnts[0]).y, bc(pnts[2]).x, bc(pnts[2]).y);
    //p.line(bc(pnts[1]).x, bc(pnts[1]).y, bc(pnts[3]).x, bc(pnts[3]).y);
  } else {
    let tpos = bc(add(pnts[0], vec(10, 10)));
    let num = pad_number(random_int(100), 2);
    let label = 'C-' + cell.id + '-' + num;
    if (cell.spec.type == 'grid' && cell.spec.grid_layout == 'space-between') label = 'C-' + cell.id;

    display_text(p, tpos, label, 18, false);
  }
}

function display_text(p: p5, pos: Vec, text: string, size: number, centered: boolean, invert: boolean = false) {
  let bg_color = global_gradient(p, BG_COLOR_ID);
  let stroke_color = get_color_set()[BG_COLOR_ID].s;

  p.push();
  p.noStroke();
  p.translate(pos.x, pos.y);
  p.scale(1, BASIS_SQUISH); //p.scale(1, Math.cos(Math.PI / 3) / Math.sin(Math.PI / 3));
  p.rotate(-Math.PI / 4 + BASIS_ROTATION * (Math.PI / 12));
  p.textSize(size);
  if (centered) p.textAlign(p.CENTER, p.CENTER);
  p.textStyle(p.BOLD);
  p.strokeWeight(10);

  p.drawingContext.fillStyle = stroke_color;
  p.drawingContext.strokeStyle = bg_color;

  p.translate(-pos.x, -pos.y);
  // p.fill(invert ? bg_col : cell_stroke_col);
  // p.stroke(invert ? cell_stroke_col : bg_col);
  p.drawingContext.strokeText(text, pos.x, pos.y);
  p.drawingContext.fillText(text, pos.x, pos.y);
  p.noStroke();
  //p.drawingContext.fillText(text, 0, 0);
  p.pop();
}
