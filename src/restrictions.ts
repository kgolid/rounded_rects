import { BoardCell, PieceProfile, RestrictionMap } from './interfaces';
import { pickAny } from './util';

const always_true = (_: number) => true;

export const trivial_restriction: RestrictionMap = { type: 'trivial', color_id: always_true, profile_id: always_true };

export function fill_cells_with_restrictions(cells: BoardCell[], profiles: PieceProfile[], color_ids: number[]) {
  let ids = new Set(cells.map((c) => c.id));

  let restriction_map = new Map<number, RestrictionMap>();
  ids.forEach((id) => restriction_map.set(id, random_restriction(profiles, color_ids)));
  cells.forEach((c) => (c.restrictions = restriction_map.get(c.id)));

  let orderly_map = new Map<number, boolean>();
  ids.forEach((id) => orderly_map.set(id, Math.random() < 0.4));
  cells.forEach((c) => (c.orderly = orderly_map.get(c.id)));
}

export function random_restriction(profiles: PieceProfile[], color_ids: number[]): RestrictionMap {
  let chosen_color_id = pickAny(color_ids);
  let chosen_profile_id = pickAny(profiles).id;

  let is_color_restriction = Math.random() < 0.5;
  let type = is_color_restriction ? 'color' : 'profile';

  let color_predicate = is_color_restriction ? (t: number) => t == chosen_color_id : always_true;
  let profile_predicate = is_color_restriction ? always_true : (t: number) => t == chosen_profile_id;

  return { type, color_id: color_predicate, profile_id: profile_predicate };
}
