import { Vec } from './interfaces';
import { add, lerp, mul, rotate_around, vec } from './vector';

export function rounded_rect_points(
  pos: Vec,
  dim: Vec,
  corner_radius: number,
  point_distance: number,
  rotation: number = 0
): Vec[] {
  let outer_south = pos.y + dim.y / 2;
  let outer_north = pos.y - dim.y / 2;
  let outer_east = pos.x + dim.x / 2;
  let outer_west = pos.x - dim.x / 2;

  let inner_south = pos.y + dim.y / 2 - corner_radius;
  let inner_north = pos.y - dim.y / 2 + corner_radius;
  let inner_east = pos.x + dim.x / 2 - corner_radius;
  let inner_west = pos.x - dim.x / 2 + corner_radius;

  let se_corner = vec(inner_east, inner_south);
  let sw_corner = vec(inner_west, inner_south);
  let nw_corner = vec(inner_west, inner_north);
  let ne_corner = vec(inner_east, inner_north);

  let corner_points = number_of_corner_points_from_dist(point_distance, corner_radius);
  let h_straight_points = Math.floor((dim.x - 2 * corner_radius) / point_distance);
  let v_straight_points = Math.floor((dim.y - 2 * corner_radius) / point_distance);

  let se_points = quarter_circle_points(corner_radius, se_corner, 0, corner_points);
  let sw_points = quarter_circle_points(corner_radius, sw_corner, 1, corner_points);
  let nw_points = quarter_circle_points(corner_radius, nw_corner, 2, corner_points);
  let ne_points = quarter_circle_points(corner_radius, ne_corner, 3, corner_points);

  let s_points = points_on_line(vec(inner_east, outer_south), vec(inner_west, outer_south), h_straight_points);
  let w_points = points_on_line(vec(outer_west, inner_south), vec(outer_west, inner_north), v_straight_points);
  let n_points = points_on_line(vec(inner_west, outer_north), vec(inner_east, outer_north), h_straight_points);
  let e_points = points_on_line(vec(outer_east, inner_north), vec(outer_east, inner_south), v_straight_points);

  let points = [
    ...e_points,
    ...se_points,
    ...s_points,
    ...sw_points,
    ...w_points,
    ...nw_points,
    ...n_points,
    ...ne_points,
  ];

  points = points.map((t) => rotate_around(t, pos, rotation));

  return points.map((v) => ({ ...v, z: -dim.z }));
}

export function points_on_line(from: Vec, to: Vec, number_of_points: number) {
  return [...new Array(number_of_points)].map((_, i) => lerp(from, to, i / number_of_points));
}

export function quarter_circle_points(radius: number, center_point: Vec, quartile: number, number_of_points: number) {
  return [...new Array(number_of_points)].map((_, i) =>
    point_on_circle_from_index(i, radius, center_point, quartile, number_of_points)
  );
}

function point_on_circle_from_index(
  index: number,
  radius: number,
  center_point: Vec,
  quartile: number,
  number_of_points: number
) {
  let ratio = index / number_of_points;
  let radian = (ratio + quartile) * (Math.PI / 2);

  return vec(Math.cos(radian) * radius + center_point.x, Math.sin(radian) * radius + center_point.y);
}

function number_of_corner_points_from_dist(dist: number, radius: number) {
  let corner_length = (Math.PI * radius * 2) / 4;
  return Math.floor(corner_length / dist);
}
