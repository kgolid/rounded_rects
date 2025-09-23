import { color_set } from './colors';
import { BoardCell, Piece, PieceProfile, PieceSpec, RestrictionMap, Vec } from './interfaces';
import { my_shuffle, pickAny, random_int, random_partition } from './util';
import { add, mul, vec } from './vector';

export function get_pieces(piece_specs: PieceSpec[], cells: BoardCell[]) {
  let pieces: Piece[] = [];
  cells.forEach((c) => {
    let prob = 0.2 + Math.random();
    let number_of_pieces = Math.round(c.token_points.length * prob);

    let token_points = c.token_points.slice(0, number_of_pieces);
    let suitable_piece_specs = piece_specs.filter((s) => spec_meets_restrictions(s, c.restrictions));

    token_points.forEach((tp) => {
      let spec = pickAny(suitable_piece_specs);

      let rotation_variance = c.orderly ? 0.04 : 0.2;
      let rotation = c.rotation + (Math.random() - 0.5) * Math.PI * rotation_variance;
      pieces.push({ spec, rotation, pos: add(tp, c.pos), shadow: true });
    });

    if (c.token_points.length == 0 && c.dim.x < 300 && c.dim.y < 300 && c.id % 4 == 3) {
      let dim = vec(c.dim.x - 25, c.dim.y - 25, 8);
      let col = suitable_piece_specs[0].color_id;
      let spec = { color_id: col, profile: { id: 1, dim: dim, corner_radius: 5, tapering: 1 } };
      let stack_height = 1 + random_int(4);
      for (let i = 0; i < stack_height; i++) {
        pieces.push({
          spec,
          rotation: i == 0 ? 0 : (Math.random() - 0.5) * Math.PI * 0.03,
          pos: vec(c.pos.x + c.dim.x / 2, c.pos.y + c.dim.y / 2, i * 14), //add(c.pos, mul(c.dim, 0.5)),
          shadow: i == 0,
        });
      }
    }
  });

  pieces.sort((a, b) => b.pos.x + b.pos.y - (a.pos.x + a.pos.y));
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
  let width = pickAny([40, 45, 50, 60, 120]);
  let length = pickAny([40, 45, 50, 60, 120]);
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
