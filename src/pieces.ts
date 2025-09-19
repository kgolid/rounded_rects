import { color_set } from './colors';
import { BoardCell, Piece, PieceProfile, PieceSpec, RestrictionMap, Vec } from './interfaces';
import { my_shuffle, pickAny, random_partition } from './util';
import { add, mul, vec } from './vector';

export function get_pieces(piece_specs: PieceSpec[], cells: BoardCell[]) {
  let pieces: Piece[] = [];
  cells.forEach((c) => {
    let prob = Math.random();
    let number_of_pieces = Math.round(c.token_points.length * prob);

    let token_points = c.token_points.slice(0, number_of_pieces + 1);
    let suitable_piece_specs = piece_specs.filter((s) => spec_meets_restrictions(s, c.restrictions));

    token_points.forEach((tp) => {
      let spec = pickAny(suitable_piece_specs);

      let rotation_variance = c.orderly ? 0.04 : 0.2;
      let rotation = c.rotation + (Math.random() - 0.5) * Math.PI * rotation_variance;
      pieces.push({ spec, rotation, pos: add(tp, c.pos) });
    });

    if (token_points.length == 0 && c.dim.x < 300 && c.dim.y < 300 && c.id % 4 == 3) {
      let dim = vec(c.dim.x - 25, c.dim.y - 25, 10);
      let col = suitable_piece_specs[0].color_id;
      pieces.push({
        spec: { color_id: col, profile: { id: 1, dim: dim, corner_radius: 5, tapering: 1 } },
        rotation: 0,
        pos: add(c.pos, mul(c.dim, 0.5)),
      });
    }
  });

  pieces.sort((a, b) => b.pos.x + b.pos.y - (a.pos.x + a.pos.y));
  return pieces;
}

export function get_pieces2(
  number_of_pieces: number,
  profiles: PieceProfile[],
  color_ids: number[],
  cells: BoardCell[]
) {
  let token_points = cells.flatMap((c) =>
    c.token_points.map((tp) => ({ pos: add(tp, c.pos), restr: c.restrictions, orderly: c.orderly }))
  );
  my_shuffle(token_points);
  console.log('Token points: ', token_points.length);

  token_points = token_points.slice(0, number_of_pieces);
  token_points.sort((a, b) => b.pos.x + b.pos.y - (a.pos.x + a.pos.y));

  let piece_specs = get_piece_specs(profiles, color_ids);

  let pieces: Piece[] = [];
  token_points.forEach((tp) => {
    let suitable_piece_specs = piece_specs.filter((s) => spec_meets_restrictions(s, tp.restr));
    let spec = pickAny(suitable_piece_specs);

    let rotation_variance = tp.orderly ? 0.02 : 2;
    let rotation = (Math.random() - 0.5) * Math.PI * rotation_variance;
    pieces.push({ spec, rotation, pos: tp.pos });
  });

  return pieces;
}

function spec_meets_restrictions(spec: PieceSpec, restr: RestrictionMap) {
  return restr.color_id(spec.color_id) && restr.profile_id(spec.profile.id);
}

export function get_piece_specs(profiles: PieceProfile[], color_ids: number[]) {
  let number_of_groups = 2;
  let grouped_profiles = random_partition(profiles, number_of_groups);

  let grouped_colors = random_partition(color_ids, number_of_groups);

  let specs: PieceSpec[] = [];
  for (let i = 0; i < number_of_groups; i++) {
    let profiles = grouped_profiles[i];
    let colors = grouped_colors[i];

    profiles.forEach((pr) => colors.forEach((ci) => specs.push({ color_id: ci, profile: pr })));
  }

  return specs;
}

export function get_piece_profiles(n: number): PieceProfile[] {
  let profiles = [];

  for (let i = 0; i < n; i++) {
    profiles.push(get_random_piece_profile(i));
  }

  return profiles;
}

function get_random_piece_profile(id: number): PieceProfile {
  let width = pickAny([40, 50, 60, 120]);
  let length = pickAny([40, 50, 60, 120]);
  let height = 10 + Math.random() * 60;

  let dim = vec(length, width, height);
  let corner_radius = pickAny([0.05, 0.1, 0.2, 0.499]) * Math.min(length, width);
  let tapering = height < 30 ? 1 : pickAny([0.75, 0.9, 1, 1]);

  return { id, dim, corner_radius, tapering };
}

export function get_piece_color_ids(n: number): number[] {
  let colors = my_shuffle([...new Array(color_set.length)].map((_, i) => i));
  return colors.slice(0, n);
}
