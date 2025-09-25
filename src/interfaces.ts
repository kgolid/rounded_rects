export type Vec = { x: number; y: number; z: number };

export interface Shape {
  a: Vec;
  b: Vec;
  c: Vec;
  d: Vec;
}

export type PartitionCell = {
  id: number;
  pos: Vec;
  dim: Vec;
  depth: number;
  terminal: boolean;
};

export type BoardCell = {
  id: number;
  pos: Vec;
  dim: Vec; // TODO: generalize to bounding box?
  token_points: Vec[];
  //restrictions: RestrictionMap;
  //rotation: number;
  //orderly: boolean;

  spec: BoardCellSpec;
};

export type BoardCellSpec = ScatterCellSpec | GridCellSpec | SingleCellSpec;

export type BaseCellSpec = {
  type: string;
  allowed_piece_specs: PieceSpec[];
  rotation: number;
};

export type SingleCellSpec = BaseCellSpec & {
  type: 'single';
  max_stack_size: number;
};

export type ScatterCellSpec = BaseCellSpec & {
  type: 'scatter';
  piece_dist: number;
};

export type GridCellSpec = BaseCellSpec & {
  type: 'grid';
  grid_dim: Vec;
  grid_layout: string; // space-around, space-between
  piece_distribution: string; // ltr, random, single
  indexing: string; // coordinate, linear
};

export type ColorEntry = {
  palette: number;
  base_color: number;
  spot_colors: number[];
};

export type RestrictionMap = {
  type: string;
  color_id: NumPredicate;
  profile_id: NumPredicate;
};

export type NumPredicate = (_: number) => boolean;

export type Piece = {
  spec: PieceSpec;
  rotation: number;
  pos: Vec;
  shadow: boolean;
};

export type PieceSpec = {
  color_id: number;
  profile: PieceProfile;
};

export type PieceProfile = {
  id: number;
  dim: Vec;
  corner_radius: number;
  tapering: number;
};
