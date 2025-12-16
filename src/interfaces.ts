export type Vec = { x: number; y: number; z: number };

export interface Quad {
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
  reflected: boolean;
  terminal: boolean;
  leave_empty: boolean;
  is_padded: boolean;
};

export type BoardCell = {
  id: number;
  pos: Vec;
  dim: Vec; // TODO: generalize to bounding box?
  token_points: TokenPoint[];
  leave_empty: boolean;

  spec: BoardCellSpec;
};

export type BoardCellSpec = EmptyCellSpec | ScatterCellSpec | GridCellSpec | SingleCellSpec;

export type BaseCellSpec = {
  type: string;
  allowed_piece_specs: PieceSpec[];
  rotation: number;
};

export type EmptyCellSpec = BaseCellSpec & {
  type: 'empty';
  show_index: boolean;
  has_stack: boolean;
  color_id: number;
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
  group: number;
};

export type PieceProfile = {
  id: number;
  dim: Vec;
  corner_radius: number;
  tapering: number;
};

export type TokenPoint = {
  pos: Vec;
  spec: PieceSpec;
  rotation: number;
};

// --- PACKING ---

export type Circle = {
  pos: Vec;
  radius: number;
};

export type Shape = {
  quad: Quad;
  inner_boundary: Circle[];
  outer_boundary: Circle;
};

export type TokenShape = {
  shape: Shape;

  spec_id: number;
  pos: Vec;
  rotation: number;
};

export type Rect = {
  spec_id: number;
  dim: Vec;
  rotation: number;
};
