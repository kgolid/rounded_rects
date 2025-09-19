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

  cells.forEach(
    (t) =>
      (t.rotation = t.orderly
        ? decide_cell_wide_rotation(
            t,
            profiles.find((p) => t.restrictions.profile_id(p.id))
          )
        : (Math.random() * Math.PI) / 2)
  );
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

export function decide_cell_wide_rotation(cell: BoardCell, profile: PieceProfile): number {
  if (cell.dim.x - 10 < profile.dim.x || cell.dim.y - 10 < profile.dim.y) return Math.PI / 2;
  if (cell.dim.y - 10 < profile.dim.x || cell.dim.x - 10 < profile.dim.y) return 0;
  return pickAny([0, Math.PI / 2]);
}
