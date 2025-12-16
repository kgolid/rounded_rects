import { rng } from './random';

export function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

export function reverse<T>(arr: T[]): T[] {
  return [...arr].reverse();
}

export function pickAny<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export const random_int = (max: number): number => Math.floor(rng() * max);

export const flip = (chance: number = 0.5): boolean => rng() < chance;

export const nmod = function (x: number, n: number) {
  return ((x % n) + n) % n;
};

export function my_shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = random_int(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createHash(rng: () => number = Math.random): string {
  let alpha = '01234567890abcdef';
  let h = '';
  for (let i = 0; i < 64; i++) {
    h += alpha.charAt(Math.floor(rng() * alpha.length));
  }
  console.log(h);
  return h;
}

export function random_partition<T>(arr: T[], parts: number): T[][] {
  let partition_map = [...new Array(arr.length)].map((_, i) => (i < parts ? i : random_int(parts)));
  let shuffled_map = my_shuffle(partition_map);

  let partition: T[][] = [...new Array(parts)].map((_): T[] => []);
  shuffled_map.forEach((x, i) => partition[x].push(arr[i]));

  return partition;
}

export function random_subset<T>(arr: T[]): T[] {
  let pick = 1 + random_int(2 ** arr.length - 1);
  let selector = pick.toString(2).padStart(arr.length, '0');
  return arr.filter((_, i) => selector.charAt(i) == '1');
}

export function get_alpha(i: number) {
  let a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return a.charAt(i);
}

export function pad_number(n: number, l: number) {
  let ns: string = '' + n;
  let zeroes = l - ns.length;

  if (zeroes <= 0) return ns;

  return [...new Array(zeroes)].map((_) => '0').join('') + ns;
}
