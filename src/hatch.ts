import p5 from 'p5';
import { Quad, Shape, Vec } from './interfaces';
import { vec } from './vector';

export function hatchRect(
  p: p5,
  pos: Vec,
  dim: Vec,
  spacing: number,
  angle: number,
  bc: (_: Vec) => Vec,
  offset: number = 0
) {
  const ctx = p.drawingContext;

  // Save canvas state and clip to the axis-aligned rectangle
  ctx.save();
  ctx.beginPath();
  ctx.shape;
  ctx.rect(pos.x, pos.y, dim.x, dim.y);
  ctx.clip();

  // Move to rect center and rotate so we can draw vertical lines
  // that become angled by `angle` in screen space.
  p.translate(pos.x + dim.y / 2, pos.y + dim.y / 2);
  p.rotate(angle);

  // Draw enough lines to cover the rectangle’s diagonal comfortably
  const L = Math.hypot(dim.x, dim.y) * 1.5; // generous span
  // Start so that offset is honored but we still cover both sides
  const start = -L + (offset % spacing);

  for (let s = start; s <= L; s += spacing) {
    let p0 = bc(vec(s, -L));
    let p1 = bc(vec(s, L));
    p.line(p0.x, p0.y, p1.x, p1.y);
  }

  // Undo our transform + clipping
  ctx.restore();
}

export function hatchParallelogram(p: p5, q: Quad, spacing: number, angle: number, offset = 0) {
  if (spacing <= 0) return;

  const pts = [q.a, q.b, q.c, q.d];
  const ctx = p.drawingContext;

  // Polygon clip to the parallelogram
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < 4; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.clip();

  // Centroid (average of vertices is fine for a parallelogram)
  const cx = (q.a.x + q.b.x + q.c.x + q.d.x) / 4;
  const cy = (q.a.y + q.b.y + q.c.y + q.d.y) / 4;

  // Work in a rotated frame where our hatch lines are vertical.
  p.push();
  p.translate(cx, cy);
  p.rotate(angle);

  // To know how far to sweep and how long lines should be,
  // compute the parallelogram’s extents in this rotated frame.
  const cosA = Math.cos(angle),
    sinA = Math.sin(angle);

  // Rotating points by -angle around the centroid to read their coords in the rotated frame
  const xr = [],
    yr = [];
  for (const p of pts) {
    const dx = p.x - cx,
      dy = p.y - cy;
    const xPrime = cosA * dx + sinA * dy; // R(-a) applied
    const yPrime = -sinA * dx + cosA * dy;
    xr.push(xPrime);
    yr.push(yPrime);
  }
  const minX = Math.min(...xr),
    maxX = Math.max(...xr);
  const minY = Math.min(...yr),
    maxY = Math.max(...yr);

  // Choose first line so that x ≡ offset (mod spacing) in this rotated frame
  const norm = (v: number, m: number) => ((v % m) + m) % m;
  const first = minX + norm(offset - minX, spacing);

  // Draw vertical lines across the whole rotated-height, clipped to the polygon
  for (let x = first; x <= maxX; x += spacing) {
    p.line(x, minY - 1, x, maxY + 1);
  }

  p.pop();
  ctx.restore();
}
