import { ParameterList } from './interfaces';
import { createHash } from './util';

export const PARAMS: ParameterList = {
  master_seed: createHash(),
  board_seed: createHash(),
  spec_seed: createHash(),
  piece_seed: createHash(),

  scale: 1,
  piece_color_count: 2,
  piece_profile_count: 6,
  palette_id: 0,
};
