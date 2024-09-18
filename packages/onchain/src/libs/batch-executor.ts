const DEFAULT_CHUNK_SIZE = 20;
export async function batchExecutor<I, O>(
  all: I[],
  executor: (input: I) => Promise<O>,
  chuckSize: number = DEFAULT_CHUNK_SIZE,
): Promise<O[]> {
  let results: O[] = [];
  for (let i = 0; i < all.length; i += chuckSize) {
    const chunk = all.slice(i, i + chuckSize);
    // PublicClient.multicall has type inference issue, need to revisit later
    const chuckResults = (await Promise.all(chunk.map(executor))) as O[];

    results = [...results, ...chuckResults];
  }

  return results;
}
