import { palettes } from './color_catalogue';

// 11
// 18

let color_set = palettes[0].color_sets;

export function get_color_set() {
  return color_set; //palettes[color_set_id].color_sets;
}

export function set_color_set(cs: { c: string[]; s: string }[]) {
  color_set = cs;
}

export const bg_col = '#fcdfcd'; //'#c9cdc1'; // '#ece9dd'; //'#c9cdc1';
export const cell_stroke_col = '#cb7a83'; //'#9aa297'; //('#8fc5d6ff'); //'#9aa297';
export const cell_stroke_col2 = '#f19791ff'; //('#8fc5d6ff'); //'#9aa297';

export const BG_COLOR_ID = 0;
