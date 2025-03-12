/**
 * Abstract base class for implementing trie (prefix tree) data structures.
 * Provides the core interface for storing and retrieving strings efficiently.
 *
 * A trie is a tree-like data structure that enables fast string operations
 * by storing characters as nodes, where all descendants share a common prefix.
 *
 * @example
 * ```typescript
 * class MyTrie extends AbstractTrie {
 *   // Implement abstract methods
 * }
 * ```
 */
export abstract class AbstractTrie {
  /**
   * Gets the number of words stored in the trie.
   *
   * @returns The total count of words.
   */
  abstract get size(): number;

  /**
   * Makes the `AbstractTrie` iterable.
   *
   * @param reversed - If `true`, words are yielded in reverse insertion order.
   * @returns An iterator for the trie's entries.
   */
  abstract [Symbol.iterator](reversed: boolean): Generator<string, void, void>;

  /**
   * Adds a word to the trie. If the word already exists, it will not
   * create duplicates and the original insertion order is preserved.
   *
   * @param word - The word to add.
   */
  abstract add(word: string): void;

  /**
   * Removes all words from the trie, resetting it to an empty state.
   */
  abstract clear(): void;

  /**
   * Removes a word from the trie.
   *
   * @param word - The word to remove.
   * @returns `true` if the word was found and removed, `false` if not found.
   */
  abstract delete(word: string): boolean;

  /**
   * Returns an iterator for the words in the trie.
   *
   * @param reversed - If `true`, words are yielded in reverse insertion order.
   * @returns An iterator of the trie's entries.
   */
  abstract entries(reversed: boolean): Generator<string, void, void>;

  /**
   * Finds all words that start with the given prefix.
   *
   * @param prefix - The prefix to search for.
   * @returns An array of matching words.
   */
  abstract find(prefix: string): Array<string>;

  /**
   * Executes a callback function for each word in the trie.
   */
  abstract forEach(
    /**
     * @param word - The word of the current entry.
     * @param trie - The trie instance being traversed.
     */
    callback: (word: string, trie: typeof this) => void,
    /** @param [thisArg] - Optional value to use as `this` in the callback. */
    thisArg?: any
  ): void;

  /**
   * Checks if a word exists in the trie.
   *
   * @param word - The word to check.
   * @returns `true` if the exact word exists, `false` otherwise.
   */
  abstract has(word: string): boolean;
}
