export type Vec = { x: number; y: number; z: number };

export interface Shape {
  a: Vec;
  b: Vec;
  c: Vec;
  d: Vec;
}

export type Cell = {
  pos: Vec;
  dim: Vec; // TODO: generalize to bounding box?
  token_points: Vec[];
  restrictions: RestrictionMap;
};

export type RestrictionMap = {
  color: (_: number) => boolean;
};
