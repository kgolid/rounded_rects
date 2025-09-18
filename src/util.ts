export function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

export function reverse<T>(arr: T[]): T[] {
  return [...arr].reverse();
}

export function pickAny<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const random_int = (max: number): number => Math.floor(Math.random() * max);

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
