/**
 * Abstract base class for implementing trie-based map data structures.
 * Provides the core interface for associating values with string keys efficiently.
 *
 * A trie-map combines the prefix-matching capabilities of tries with key-value storage,
 * similar to how a `Map` associates values with keys, but optimized for string-based keys.
 *
 * @template V - The type of values stored in the trie-map.
 * @example
 * ```typescript
 * class MyTrieMap extends AbstractTrieMap {
 *   // Implement abstract methods
 * }
 * ```
 */
export abstract class AbstractTrieMap<V = unknown> {
  /**
   * Gets the number of entries stored in the trie-map.
   *
   * @returns The total count of word-value pairs.
   */
  abstract get size(): number;

  /**
   * Makes the `AbstractTrieMap` iterable.
   *
   * @param reversed - If `true`, entries are yielded in reverse insertion order.
   * @returns An iterator for the trie-map's entries.
   */
  abstract [Symbol.iterator](
    reversed: boolean
  ): Generator<[string, V], void, void>;

  /**
   * Removes all entries from the trie-map, resetting it to an empty state.
   */
  abstract clear(): void;

  /**
   * Removes an entry from the trie-map.
   *
   * @param word - The key of the entry to remove.
   * @returns `true` if the entry was found and removed, `false` if not found.
   */
  abstract delete(word: string): boolean;

  /**
   * Returns an iterator for the entries in the trie-map.
   *
   * @param reversed - If `true`, entries are yielded in reverse order.
   * @returns An iterator of the trie's entries.
   */
  abstract entries(reversed: boolean): Generator<[string, V], void, void>;

  /**
   * Finds all entries whose keys start with the given prefix.
   *
   * @param prefix - The prefix to search for.
   * @returns An array of matching `[word, value]` pairs.
   */
  abstract find(prefix: string): [string, V][];

  /**
   * Executes a callback function for each entry in the trie-map.
   */
  abstract forEach(
    /**
     * @param value - The value of the current entry.
     * @param word - The word of the current entry.
     * @param trieMap - The trie-map instance being traversed.
     */
    callback: (value: V, word: string, trieMap: typeof this) => void,
    /** @param [thisArg] - Optional value to use as `this` in the callback. */
    thisArg?: any
  ): void;

  /**
   * Retrieves the value associated with a given key.
   *
   * @param word - The key to look up.
   * @returns The associated value if found, `undefined` otherwise.
   */
  abstract get(word: string): V | undefined;

  /**
   * Checks if an entry with the specified key exists in the trie-map.
   *
   * @param word - The key to check.
   * @returns `true` if an entry with the key exists, `false` otherwise.
   */
  abstract has(word: string): boolean;

  /**
   * Returns an iterator for the keys of the entries in the trie-map.
   *
   * @param reversed - If `true`, keys are yielded in reverse order.
   * @returns An iterator of the trie-map's entries keys.
   */
  abstract keys(reversed: boolean): Generator<string, void, void>;

  /**
   * Adds or updates an entry in the trie-map.
   *
   * @param word - The key for the entry.
   * @param value - The value to associate with the key.
   */
  abstract set(word: string, value: V): void;

  /**
   * Returns an iterator for the values of the entries in the trie-map.
   *
   * @param reversed - If `true`, values are yielded in reverse order.
   * @returns An iterator of the trie-map's entries values.
   */
  abstract values(reversed: boolean): Generator<V, void, void>;
}
