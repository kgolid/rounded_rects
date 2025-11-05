import { angleBetweenPointAndShape } from './geometry';
import { Quad, Shape, Vec } from './interfaces';
import { add, angleBetween, mul, normal_of_quad, normalize, sub } from './vector';

export function illuminanceOfQuad(sun: Vec, quad: Quad): number {
  const angle = angleBetweenPointAndShape(sun, quad);
  const illuminance = Math.max(0, -Math.cos(angle));
  return Math.pow(illuminance, Math.pow(2, 0));
}

export function illuminanceOfEdge(sun: Vec, edge_start: Vec, edge_end: Vec, q1: Quad, q2: Quad): number {
  const n1 = normalize(normal_of_quad(q1));
  const n2 = normalize(normal_of_quad(q2));

  const edge_normal = mul(add(n1, n2), 0.5);
  const edge_center = mul(add(edge_start, edge_end), 0.5);
  const edgeToSunVec = sub(edge_center, sun);
  const angle = angleBetween(edge_normal, edgeToSunVec);

  const illuminance = Math.max(0, -Math.cos(angle));

  return Math.max(0, Math.min(0.9999, Math.pow(illuminance, Math.pow(2, 0))));
}
