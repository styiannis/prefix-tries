import {
  addWord,
  clear,
  create,
  deleteWord,
  getPrefixEntries,
  includesWord,
  size,
} from '../core/compressed-trie';
import { entries } from '../core/trie';
import { ITrie } from '../types';
import { AbstractTrie } from './abstract';
import {
  validateBoolean,
  validateFunction,
  validateNonEmptyString,
} from './validators';

/**
 * A memory-optimized trie (radix tree) implementation that extends `AbstractTrie`.
 *
 * @example
 * ```typescript
 * const trie = new CompressedTrie();
 *
 * trie.add('apple');
 * trie.add('lemon');
 *
 * console.log(trie.has('apple')); // true
 * console.log([...trie]); // ['apple', 'lemon']
 * ```
 */
export class CompressedTrie extends AbstractTrie {
  /** Private field holding the internal compressed-trie data structure */
  #compressedTrie: ITrie;

  /**
   * Creates a new `CompressedTrie` instance.
   *
   * @param [initialWords] - Optional array of `[word, value]` pairs to initialize the compressed-trie with.
   * @throws `TypeError` if `initialWords` is defined and contains an invalid word (empty string or non-string value).
   * @example
   * ```typescript
   * // Empty trie
   * const trie1 = new CompressedTrie();
   *
   * // Trie with initial words
   * const trie2 = new CompressedTrie(['apple', 'lemon']);
   * ```
   */
  constructor(initialWords?: Array<string> | ReadonlyArray<string>) {
    super();

    this.#compressedTrie = create();

    if (undefined !== initialWords) {
      initialWords.forEach((word) => this.add(word));
    }
  }

  /**
   * Gets the number of words stored in the compressed-trie.
   *
   * @returns The total count of words.
   * @example
   * ```typescript
   * const trie = new CompressedTrie(['apple', 'lemon']);
   * console.log(trie.size); // 2
   *
   * trie.add('orange');
   * console.log(trie.size); // 3
   * ```
   */
  get size() {
    return size(this.#compressedTrie);
  }

  /**
   * Makes the `CompressedTrie` iterable.
   *
   * Words are yielded in their insertion order by default.
   *
   * @param [reversed = false] - Optional `boolean` to reverse iteration order.
   * @returns An iterator for the compressed-trie's entries.
   * @throws `TypeError` if `reversed` is not a boolean value.
   * @example
   * ```typescript
   * const trie = new CompressedTrie(['apple', 'lemon', 'orange']);
   *
   * // Forward iteration
   * for (const word of trie) {
   *   console.log(word);
   * }
   * // Output:
   * // apple
   * // lemon
   * // orange
   *
   * // Reverse iteration
   * for (const word of trie[Symbol.iterator](true)) {
   *   console.log(word);
   * }
   * // Output:
   * // orange
   * // lemon
   * // apple
   * ```
   */
  [Symbol.iterator](reversed = false) {
    return this.entries(reversed);
  }

  /**
   * Adds a word to the compressed-trie. If the word already exists, it will not
   * create duplicates and the original insertion order is preserved.
   *
   * @param word - The word to add.
   * @throws `TypeError` if `word` is not a string or is empty.
   * @example
   * ```typescript
   * const trie = new CompressedTrie();
   *
   * trie.add('apple');
   * trie.add('lemon');
   *
   * trie.add('apple'); // Won't add duplicate
   *
   * console.log(trie.size); // 2
   * ```
   */
  add(word: string) {
    validateNonEmptyString(word, 'word');
    return addWord(this.#compressedTrie, word);
  }

  /**
   * Removes all words from the trie, resetting it to an empty state.
   *
   * @example
   * ```typescript
   * const trie = new CompressedTrie(['apple', 'lemon']);
   * console.log(trie.size); // 2
   *
   * trie.clear();
   * console.log(trie.size); // 0
   * ```
   */
  clear() {
    return clear(this.#compressedTrie);
  }

  /**
   * Removes a word from the compressed-trie.
   *
   * @param word - The word to remove.
   * @returns `true` if the word was found and removed, `false` if not found.
   * @throws `TypeError` if `word` is not a string or is empty.
   * @example
   * ```typescript
   * const trie = new CompressedTrie(['apple', 'lemon']);
   *
   * console.log(trie.delete('apple')); // true
   * console.log(trie.delete('unknown')); // false
   *
   * console.log(trie.size); // 1
   * ```
   */
  delete(word: string) {
    validateNonEmptyString(word, 'word');
    return deleteWord(this.#compressedTrie, word);
  }

  /**
   * Returns an iterator of all words in the compressed-trie.
   *
   * Words are yielded in their insertion order by default.
   *
   * @param [reversed = false] - Optional `boolean` to reverse iteration order.
   * @returns An iterator of the compressed-trie's entries.
   * @throws `TypeError` if `reversed` is not a boolean value.
   * @example
   * ```typescript
   * const trie = new CompressedTrie(['apple', 'lemon', 'orange']);
   *
   * // Forward order
   * for (const word of trie.entries()) {
   *   console.log(word);
   * }
   * // Output:
   * // apple
   * // lemon
   * // orange
   *
   * // Reverse order
   * for (const word of trie.entries(true)) {
   *   console.log(word);
   * }
   * // Output:
   * // orange
   * // lemon
   * // apple
   * ```
   */
  entries(reversed = false) {
    if (undefined !== reversed) {
      validateBoolean(reversed, 'reversed');
    }
    return entries(this.#compressedTrie, reversed);
  }

  /**
   * Finds all words that start with the given prefix.
   *
   * @param prefix - The prefix to search for.
   * @returns An array of matching words.
   * @throws `TypeError` if `prefix` is not a string or is empty.
   * @example
   * ```typescript
   * const trie = new CompressedTrie(['car', 'cat', 'cart']);
   *
   * console.log(trie.find('car'));
   * // ['car', 'cart']
   *
   * console.log(trie.find('ca'));
   * // ['car', 'cart', 'cat']
   * ```
   */
  find(prefix: string) {
    validateNonEmptyString(prefix, 'prefix');
    return getPrefixEntries(this.#compressedTrie, prefix);
  }

  /**
   * Executes a callback function for each entry in the compressed-trie.
   *
   * @throws `TypeError` if `callback` is not a function.
   * @example
   * ```typescript
   * const trie = new CompressedTrie(['apple', 'lemon']);
   *
   * const result = [];
   * trie.forEach((word) => {
   *   result.push(word.toUpperCase());
   * });
   *
   * console.log(result);
   * // ['APPLE', 'LEMON']
   * ```
   */
  forEach(
    /**
     * @param word - The word of the current entry.
     * @param trie - The compressed-trie instance being traversed.
     */
    callback: (word: string, trie: typeof this) => void,
    /** @param [thisArg] - Optional value to use as `this` in the callback. */
    thisArg?: any
  ) {
    validateFunction(callback, 'callback');
    for (const word of this.entries()) {
      callback.call(thisArg, word, this);
    }
  }

  /**
   * Checks if a word exists in the compressed-trie.
   *
   * @param word - The word to check.
   * @returns `true` if the exact word exists, `false` otherwise.
   * @throws `TypeError` if `word` is not a string or is empty.
   * @example
   * ```typescript
   * const trie = new CompressedTrie(['apple']);
   *
   * console.log(trie.has('apple')); // true
   * console.log(trie.has('ap')); // false
   * console.log(trie.has('lemon')); // false
   * ```
   */
  has(word: string) {
    validateNonEmptyString(word, 'word');
    return includesWord(this.#compressedTrie, word);
  }
}
