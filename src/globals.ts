let cell_count = 0;
export const generate_cell_id = () => {
  cell_count++;
  return cell_count;
};

export const PIECE_MARGIN = 15;
export const CELL_PAD = 15;

export const BASIS_ROTATION = 0;
export const BASIS_SQUISH = 1 / Math.sqrt(2);

// --- PACKING ---

export const CIRCLE_DIST = 15;
export const CIRCLE_RADIUS = 12;
export const CIRCLE_INSET = 0;
export const ANGLE_TRIES = 25;
export const SPIN_TRIES = 20;

export const MIN_RECT_DIM = 20;
export const MAX_RECT_DIM = 100;

export const INITIAL_RADIUS = 300;
