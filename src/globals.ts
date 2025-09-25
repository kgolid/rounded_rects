let cell_count = 0;
export const generate_cell_id = () => {
  cell_count++;
  return cell_count;
};

export const PIECE_MARGIN = 15;
export const CELL_PAD = 15;
