import { BoardCell, PieceProfile, PieceSpec, RestrictionMap, Vec } from './interfaces';
import { flip, pickAny } from './util';

const always_true = (_: number) => true;

export const trivial_restriction: RestrictionMap = {
  type: 'trivial',
  profile_id: always_true,
  color_id: always_true,
};

// export function fill_cells_with_restrictions(cells: BoardCell[], specs: PieceSpec[], profiles: PieceProfile[]) {
//   let ids = new Set(cells.map((c) => c.id));

//   let restriction_map = new Map<number, RestrictionMap>();
//   ids.forEach((id) => restriction_map.set(id, random_restriction(specs)));
//   cells.forEach((c) => (c.restrictions = restriction_map.get(c.id)));

//   let orderly_map = new Map<number, boolean>();
//   ids.forEach((id) => orderly_map.set(id, rng() < 0.7));
//   cells.forEach((c) => (c.orderly = orderly_map.get(c.id)));

//   cells.forEach(
//     (t) =>
//       (t.rotation = t.orderly
//         ? decide_cell_wide_rotation(
//             t.dim,
//             profiles.find((p) => t.restrictions.profile_id(p.id))
//           )
//         : (rng() * Math.PI) / 2)
//   );
// }

export function random_restriction(specs: PieceSpec[]): RestrictionMap {
  let chosen_spec = pickAny(specs);
  let chosen_color_id = chosen_spec.color_id;
  let chosen_profile_id = chosen_spec.profile.id;

  let is_spec_restriction = flip();
  let type = is_spec_restriction ? 'spec' : 'profile';

  let profile_predicate = (t: number) => t == chosen_profile_id;
  let color_predicate = is_spec_restriction ? (t: number) => t == chosen_color_id : always_true;

  return { type, color_id: color_predicate, profile_id: profile_predicate };
}

export function profile_from_restriction(r: RestrictionMap, ps: PieceSpec[]) {
  return ps.find((t) => r.color_id(t.color_id));
}

export function decide_cell_wide_rotation(cell_dim: Vec, profile: PieceProfile): number {
  if (cell_dim.x - 30 < profile.dim.x + 15 || cell_dim.y - 30 < profile.dim.y + 15) return Math.PI / 2;
  if (cell_dim.y - 30 < profile.dim.x + 15 || cell_dim.x - 30 < profile.dim.y + 15) return 0;
  return pickAny([0, Math.PI / 2]);
}
