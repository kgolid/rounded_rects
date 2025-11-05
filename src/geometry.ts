import * as vector from './vector';
import { Vec, Shape, Quad } from './interfaces';

export function angleBetweenPointAndShape(pnt: Vec, qaud: Quad): number {
  const planeCenter = centerOfShape(qaud);
  const planeNormal = normalOfShape(qaud);
  const cellToPointVec = vector.sub(planeCenter, pnt);
  return vector.angleBetween(planeNormal, cellToPointVec);
}

//  Shape
//  C /\
//   /  \ B
// D \  /
//    \/ A

function normalOfShape(quad: Quad): Vec {
  const xvec = vector.sub(quad.b, quad.a);
  const yvec = vector.sub(quad.d, quad.a);
  return vector.crossProduct(xvec, yvec);
}

function centerOfShape(quad: Quad): Vec {
  const ab = vector.midpoint(quad.a, quad.b);
  const dc = vector.midpoint(quad.d, quad.c);
  return vector.midpoint(ab, dc);
}
