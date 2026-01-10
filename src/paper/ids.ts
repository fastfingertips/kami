export function createIdCounter(start = 1): () => number {
  let next = start;
  return () => next++;
}
