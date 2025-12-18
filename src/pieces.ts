import { get_color_set } from './colors';
import { BoardCell, Piece, PieceProfile, PieceSpec } from './interfaces';
import { rng } from './random';
import { my_shuffle, pickAny, random_int, random_partition } from './util';
import { add, vec } from './vector';

export function get_pieces(cells: BoardCell[]) {
  let pieces: Piece[] = [];
  cells.forEach((c) => {
    let density = 0.25 + rng();
    let number_of_pieces = Math.round(c.token_points.length * density);

    let token_points = [...c.token_points];

    if (c.spec.type == 'grid' && (c.spec.piece_distribution == 'random' || c.spec.piece_distribution == 'single'))
      token_points = my_shuffle(token_points);

    if (c.spec.type == 'grid' && c.spec.grid_layout == 'space-between' && c.spec.piece_distribution == 'single')
      number_of_pieces = 1;

    token_points = token_points.slice(0, number_of_pieces);
    let suitable_piece_specs = c.spec.allowed_piece_specs;

    token_points.forEach((tp) => {
      let spec = c.spec.type == 'scatter' ? tp.spec : pickAny(suitable_piece_specs);
      let rotation = c.spec.type == 'scatter' ? tp.rotation : c.spec.rotation + (rng() - 0.5) * Math.PI * 0.04;

      pieces.push({ spec, rotation, pos: add(tp.pos, c.pos), shadow: true });
    });

    if (c.spec.type == 'empty' && c.spec.has_stack && !c.leave_empty) {
      let dim = vec(c.dim.x - 25, c.dim.y - 25, 8);
      let col = c.spec.color_id;
      let spec = { color_id: col, profile: { id: 1, dim: dim, corner_radius: 5, tapering: 1 }, group: 0 };
      let stack_height = random_int(4);

      for (let i = 0; i < stack_height; i++) {
        pieces.push({
          spec,
          rotation: i == 0 ? 0 : (rng() - 0.5) * Math.PI * 0.03,
          pos: vec(c.pos.x + c.dim.x / 2, c.pos.y + c.dim.y / 2, i * 14), //add(c.pos, mul(c.dim, 0.5)),
          shadow: i == 0,
        });
      }
    }
  });

  pieces.sort((a, b) => b.pos.x + b.pos.y - (a.pos.x + a.pos.y));
  return pieces;
}

export function get_piece_specs(profiles: PieceProfile[], color_ids: number[]) {
  let number_of_groups = 2;
  let grouped_profiles = random_partition(profiles, number_of_groups);

  let grouped_colors = random_partition(color_ids, number_of_groups); // [color_ids.slice(0, 2), color_ids.slice(2)];
  console.log(grouped_colors);

  let specs: PieceSpec[] = [];
  for (let i = 0; i < number_of_groups; i++) {
    let profiles = grouped_profiles[i];
    let colors = grouped_colors[i];

    profiles.forEach((pr) => colors.forEach((ci) => specs.push({ color_id: ci, profile: pr, group: i })));
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
  let width = pickAny([40, 50, 60, 80, 120]);
  let length = pickAny([40, 50, 60, 80, 120]);
  let height = Math.min(80, Math.max(15, pickAny([0.1, 0.2, 0.4, 0.6, 0.8, 1]) * Math.min(length, width)));

  let dim = vec(length, width, height);
  let corner_radius = pickAny([0.1, 0.2, 0.499]) * Math.min(length, width);
  let tapering = height < 30 ? 1 : pickAny([0.8, 0.9, 1, 1]);

  return { id, dim, corner_radius, tapering };
}

export function get_piece_color_ids(n: number): number[] {
  let colors = my_shuffle([...new Array(n)].map((_, i) => i % get_color_set().length));
  return colors;
}
