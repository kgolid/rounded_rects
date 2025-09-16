import * as vector from './vector';
import { Vec, Shape } from './interfaces';

export function angleBetweenPointAndShape(pnt: Vec, shape: Shape): number {
  const planeCenter = centerOfShape(shape);
  const planeNormal = normalOfShape(shape);
  const cellToPointVec = vector.sub(planeCenter, pnt);
  return vector.angleBetween(planeNormal, cellToPointVec);
}

//  Shape
//  C /\
//   /  \ B
// D \  /
//    \/ A

function normalOfShape(shape: Shape): Vec {
  const xvec = vector.sub(shape.b, shape.a);
  const yvec = vector.sub(shape.d, shape.a);
  return vector.crossProduct(xvec, yvec);
}

function centerOfShape(shape: Shape): Vec {
  const ab = vector.midpoint(shape.a, shape.b);
  const dc = vector.midpoint(shape.d, shape.c);
  return vector.midpoint(ab, dc);
}
