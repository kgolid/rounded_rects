const KAPPA = 24389 / 27;
const EPSILON = 216 / 24389;
const CBRT_EPSILON = 6 / 29;

export function lch_scale(hexes: string[], steps: number): string[] {
  let lchs = hexes.map(rgb_from_hex).map(lch_from_rgb);
  let c_scale = colors_scale(lchs, steps);
  return c_scale.map(rgb_from_lch).map(hex_from_rgb);
}

function colors_scale(cs: number[][], steps: number): number[][] {
  let scale = [cs[0]];
  for (let i = 0; i < cs.length - 1; i++) {
    let c_scale = color_scale(cs[i], cs[i + 1], steps);
    scale = scale.concat(c_scale.slice(1));
  }
  return scale;
}

function color_scale(ca: number[], cb: number[], steps: number): number[][] {
  let scale = [];
  for (let i = 0; i <= steps; i++) {
    let r = i / steps;
    scale.push(color_lerp(ca, cb, r));
  }
  return scale;
}

function color_lerp(ca: number[], cb: number[], r: number) {
  let c0 = lerp(ca[0], cb[0], r);
  let c1 = lerp(ca[1], cb[1], r);
  let c2 = hue_lerp(ca[2], cb[2], r);
  return [c0, c1, c2];
}

function lerp(a: number, b: number, r: number) {
  return a + (b - a) * r;
}

function hue_lerp(a: number, b: number, r: number) {
  if (a - b > 180) return angle_modulo(lerp(a, b + 360, r));
  if (b - a > 180) return angle_modulo(lerp(a + 360, b, r));
  return lerp(a, b, r);
}

function angle_modulo(phi: number) {
  return nmod(phi + 180, 360) - 180;
}

function nmod(x: number, n: number) {
  return ((x % n) + n) % n;
}

export function rgb_from_lch(lch: number[]) {
  return rgb_from_xyz(xyz_from_lab(lab_from_lch(lch)));
}

function lab_from_lch(lch: number[]) {
  let h_rad = (lch[2] * (Math.PI * 2)) / 360;

  return [lch[0], lch[1] * Math.cos(h_rad), lch[1] * Math.sin(h_rad)];
}

function xyz_from_lab(lab: number[]) {
  let fy = (lab[0] + 16.0) / 116.0;
  let fx = lab[1] / 500.0 + fy;
  let fz = fy - lab[2] / 200.0;

  let x = f_inv(fx) * 0.9504492182750991;
  let y = lab[0] > 8 ? Math.pow(fy, 3) : lab[0] / KAPPA;
  let z = f_inv(fz) * 1.0889166484304715;

  return [x, y, z];
}

function rgb_from_xyz(xyz: number[]) {
  let x = xyz[0];
  let y = xyz[1];
  let z = xyz[2];

  let r = x * 3.240812398895283 - y * 1.5373084456298136 - z * 0.4985865229069666;
  let g = x * -0.9692430170086407 + y * 1.8759663029085742 + z * 0.04155503085668564;
  let b = x * 0.055638398436112804 - y * 0.20400746093241362 + z * 1.0571295702861434;

  return [gamma_compression(r), gamma_compression(g), gamma_compression(b)];
}

export function lch_from_rgb(rgb: number[]) {
  return lch_from_lab(lab_from_xyz(xyz_from_rgb(rgb)));
}

function lch_from_lab(lab: number[]) {
  return [
    lab[0],
    Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]),
    (Math.atan2(lab[2], lab[1]) * 360) / (Math.PI * 2),
  ];
}

function lab_from_xyz(xyz: number[]): number[] {
  let fx = f(xyz[0] / 0.9504492182750991);
  let fy = f(xyz[1]);
  let fz = f(xyz[2] / 1.0889166484304715);

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function xyz_from_rgb(rgb: number[]): number[] {
  let r = gamma_expansion(rgb[0]);
  let g = gamma_expansion(rgb[1]);
  let b = gamma_expansion(rgb[2]);

  return [
    r * 0.4124108464885388 + g * 0.3575845678529519 + b * 0.18045380393360833,
    r * 0.21264934272065283 + g * 0.7151691357059038 + b * 0.07218152157344333,
    r * 0.019331758429150258 + g * 0.11919485595098397 + b * 0.9503900340503373,
  ];
}

export function hex_from_rgb(rgb: number[]) {
  return '#' + hex_from_component(rgb[0]) + hex_from_component(rgb[1]) + hex_from_component(rgb[2]);
}

export function rgb_from_hex(hex: string): number[] {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
}

function hex_from_component(c: number) {
  var hex = Math.round(c).toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function f(val: number) {
  if (val > EPSILON) return Math.pow(val, 1 / 3);
  return (KAPPA * val + 16) / 116;
}

function f_inv(val: number) {
  if (val > CBRT_EPSILON) return Math.pow(val, 3);
  return (val * 116 - 16) / KAPPA;
}

function gamma_expansion(val: number) {
  if (val <= 10) return val / 3294.6;
  return Math.pow((val + 14.025) / 269.025, 2.4);
}

function gamma_compression(linear: number) {
  let val =
    linear <= 0.00313066844250060782371
      ? 3294.6 * linear
      : 269.025 * Math.pow(linear, 5 / 12) - 14.025;
  return Math.round(Math.min(255, Math.max(0, val)));
}
