import { CIRCLE_RADIUS } from '../globals';

const CUTOFF_DELTA = CIRCLE_RADIUS / 2;

export function execute_binary_search(
  predicate: (n: number) => boolean,
  delta: (iteration: number) => number,
  initial: number
) {
  if (!predicate(initial)) {
    return -1;
  }

  return search(predicate, delta, initial, 0);
}

function search(
  predicate: (n: number) => boolean,
  delta: (iteration: number) => number,
  current: number,
  iteration: number
): number {
  let next_delta = delta(iteration);

  if (Math.abs(next_delta) < CUTOFF_DELTA) return current;

  let next = predicate(current) ? current + next_delta : current - next_delta;

  return search(predicate, delta, next, iteration + 1);
}
