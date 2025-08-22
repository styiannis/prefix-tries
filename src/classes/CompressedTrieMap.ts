import {
  clear,
  create,
  deleteWord,
  getPrefixEntries,
  getWordValue,
  includesWord,
  setWordValue,
  size,
} from '../core/compressed-trie-map';
import { entries, values } from '../core/trie-map';
import { entries as keys } from '../core/trie';
import { ITrieMap } from '../types';
import { AbstractTrieMap } from './abstract';
import {
  validateBoolean,
  validateFunction,
  validateNonEmptyString,
} from './validators';

/**
 * A memory-optimized trie-map implementation that extends `AbstractTrieMap`.
 * Associates values with string keys (words) while preserving key-value lookup efficiency.
 *
 * @template V - The type of values stored in the compressed-trie-map.
 * @example
 * ```typescript
 * const trieMap = new CompressedTrieMap();
 *
 * trieMap.set('apple', 1);
 * trieMap.set('lemon', 2);
 *
 * console.log(trieMap.has('apple')); // true
 * console.log([...trieMap]); // [['apple', 1], ['lemon', 2]]
 * ```
 */
export class CompressedTrieMap<V = unknown> extends AbstractTrieMap<V> {
  /** Private field holding the internal compressed-trie-map data structure */
  readonly #compressedTrieMap: ITrieMap<V>;

  /**
   * Creates a new `CompressedTrieMap` instance.
   *
   * @param [initialWordValues] - Optional array of `[word, value]` pairs to initialize the compressed-trie-map with.
   * @throws `TypeError` if `initialWordValues` is defined and contains an invalid word (empty string or non-string value).
   * @example
   * ```typescript
   * // Empty trie-map
   * const trieMap1 = new CompressedTrieMap();
   *
   * // Trie-map with initial entries
   * const trieMap2 = new CompressedTrieMap([
   *   ['apple', 1],
   *   ['lemon', 2]
   * ]);
   * ```
   */
  constructor(
    initialWordValues?:
      | Array<[string, V]>
      | Array<Readonly<[string, V]>>
      | ReadonlyArray<[string, V]>
      | ReadonlyArray<Readonly<[string, V]>>
  ) {
    super();

    this.#compressedTrieMap = create<ITrieMap<V>>();

    if (undefined !== initialWordValues) {
      initialWordValues.forEach(([word, value]) => this.set(word, value));
    }
  }

  /**
   * Gets the number of entries stored in the compressed-trie-map.
   *
   * @returns The total count of word-value pairs.
   * @example
   * ```typescript
   * const trieMap = new CompressedTrieMap([
   *   ['apple', 1],
   *   ['lemon', 2]
   * ]);
   * console.log(trieMap.size); // 2
   *
   * trieMap.set('orange', 3);
   * console.log(trieMap.size); // 3
   * ```
   */
  get size() {
    return size(this.#compressedTrieMap);
  }

  /**
   * Makes the `CompressedTrieMap` iterable.
   *
   * Entries are yielded in their insertion order by default.
   *
   * @param [reversed = false] - Optional `boolean` to reverse iteration order.
   * @returns An iterator for the compressed-trie-map's entries.
   * @throws `TypeError` if `reversed` is not a boolean value.
   * @example
   * ```typescript
   * const trieMap = new CompressedTrieMap([
   *   ['apple', 1],
   *   ['lemon', 2],
   *   ['orange', 3]
   * ]);
   *
   * // Forward iteration
   * for (const [word, value] of trieMap) {
   *   console.log(`${word}: ${value}`);
   * }
   * // Output:
   * // apple: 1
   * // lemon: 2
   * // orange: 2
   *
   * // Reverse iteration
   * for (const [word, value] of trieMap[Symbol.iterator](true)) {
   *   console.log(`${word}: ${value}`);
   * }
   * // Output:
   * // orange: 2
   * // lemon: 2
   * // apple: 1
   * ```
   */
  [Symbol.iterator](reversed = false) {
    return this.entries(reversed);
  }

  /**
   * Removes all entries from the compressed-trie-map, resetting it to an empty state.
   *
   * @example
   * ```typescript
   * const trieMap = new CompressedTrieMap([
   *   ['apple', 1],
   *   ['lemon', 2]
   * ]);
   * console.log(trieMap.size); // 2
   *
   * trieMap.clear();
   * console.log(trieMap.size); // 0
   * ```
   */
  clear() {
    return clear(this.#compressedTrieMap);
  }

  /**
   * Removes an entry from the compressed-trie-map.
   *
   * @param word - The key of the entry to remove.
   * @returns `true` if the entry was found and removed, `false` if not found.
   * @throws `TypeError` if `word` is not a string or is empty.
   * @example
   * ```typescript
   * const trieMap = new CompressedTrieMap([
   *   ['apple', 1],
   *   ['lemon', 2]
   * ]);
   *
   * console.log(trieMap.delete('apple')); // true
   * console.log(trieMap.delete('unknown')); // false
   *
   * console.log(trieMap.size); // 1
   * ```
   */
  delete(word: string) {
    validateNonEmptyString(word, 'word');
    return deleteWord(this.#compressedTrieMap, word);
  }

  /**
   * Returns an iterator of all entries in the compressed-trie-map.
   *
   * Entries are yielded in their insertion order by default.
   *
   * @param [reversed = false] - Optional `boolean` to reverse iteration order.
   * @returns An iterator of the compressed-trie-map's entries.
   * @throws `TypeError` if `reversed` is not a boolean value.
   * @example
   * ```typescript
   * const trieMap = new CompressedTrieMap([
   *   ['apple', 1],
   *   ['lemon', 2],
   *   ['orange', 3]
   * ]);
   *
   * // Forward order
   * for (const [word, value] of trieMap.entries()) {
   *   console.log(`${word}: ${value}`);
   * }
   * // Output:
   * // apple: 1
   * // lemon: 2
   * // orange: 3
   *
   * // Reverse iteration
   * for (const [word, value] of trieMap.entries(true)) {
   *   console.log(`${word}: ${value}`);
   * }
   * // Output:
   * // orange: 3
   * // lemon: 2
   * // apple: 1
   * ```
   */
  entries(reversed = false) {
    if (undefined !== reversed) {
      validateBoolean(reversed, 'reversed');
    }
    return entries(this.#compressedTrieMap, reversed);
  }

  /**
   * Finds all entries whose keys start with the given prefix.
   *
   * @param prefix - The prefix to search for.
   * @returns An array of matching `[word, value]` pairs.
   * @throws `TypeError` if `prefix` is not a string or is empty.
   * @example
   * ```typescript
   * const trieMap = new CompressedTrieMap([
   *   ['cart', 1],
   *   ['cat', 2],
   *   ['car', 3],
   * ]);
   *
   * console.log(trieMap.find('car'));
   * // [['car', 3], ['cart', 1]]
   *
   * console.log(trieMap.find('ca'));
   * // [['cat', 2], ['car', 3], ['cart', 1]]
   * ```
   */
  find(prefix: string) {
    validateNonEmptyString(prefix, 'prefix');
    return getPrefixEntries(this.#compressedTrieMap, prefix);
  }

  /**
   * Executes a callback for each entry in the compressed-trie-map.
   *
   * @throws `TypeError` if `callback` is not a function.
   * @example
   * ```typescript
   * const trieMap = new CompressedTrieMap([
   *   ['apple', 1],
   *   ['lemon', 2]
   * ]);
   *
   * const result = [];
   * trieMap.forEach((value, word) => {
   *   result.push(`${word.toUpperCase()}:${value}`);
   * });
   *
   * console.log(result);
   * // ['APPLE:1', 'LEMON:2']
   * ```
   */
  forEach(
    /**
     * @param value - The value of the current entry.
     * @param word - The word of the current entry.
     * @param trieMap - The compressed-trie-map instance being traversed.
     */
    callback: (value: V, word: string, trieMap: typeof this) => void,
    /** @param [thisArg] - Optional value to use as `this` in the callback. */
    thisArg?: any
  ) {
    validateFunction(callback, 'callback');
    for (const entry of this.entries()) {
      callback.call(thisArg, entry[1], entry[0], this);
    }
  }

  /**
   * Retrieves the value associated with a given key.
   *
   * @param word - The key to look up.
   * @returns The associated value if found, `undefined` otherwise.
   * @throws `TypeError` if `word` is not a string or is empty.
   * @example
   * ```typescript
   * const trieMap = new CompressedTrieMap([
   *   ['apple', 1],
   *   ['lemon', 2]
   * ]);
   *
   * console.log(trieMap.get('apple')); // 1
   * console.log(trieMap.get('unknown')); // undefined
   * ```
   */
  get(word: string) {
    validateNonEmptyString(word, 'word');
    return getWordValue(this.#compressedTrieMap, word);
  }

  /**
   * Checks if an entry with the specified key exists in the compressed-trie-map.
   *
   * @param word - The key to check.
   * @returns `true` if an entry with the key exists, `false` otherwise.
   * @throws `TypeError` if `word` is not a string or is empty.
   * @example
   * ```typescript
   * const trieMap = new CompressedTrieMap([['apple', 1]]);
   *
   * console.log(trieMap.has('apple')); // true
   * console.log(trieMap.has('ap')); // false
   * console.log(trieMap.has('lemon')); // false
   * ```
   */
  has(word: string) {
    validateNonEmptyString(word, 'word');
    return includesWord(this.#compressedTrieMap, word);
  }

  /**
   * Returns an iterator of all keys in the compressed-trie-map.
   *
   * Keys are yielded in their entries' insertion order.
   *
   * @param [reversed = false] - Optional `boolean` to reverse iteration order.
   * @returns An iterator of the compressed-trie-map's keys.
   * @throws `TypeError` if `reversed` is not a boolean value.
   * @example
   * ```typescript
   * const trieMap = new CompressedTrieMap([
   *   ['apple', 1],
   *   ['lemon', 2],
   *   ['orange', 3]
   * ]);
   *
   * // Forward order
   * for (const key of trieMap.keys()) {
   *   console.log(key);
   * }
   * // Output:
   * // apple
   * // lemon
   * // orange
   *
   * // Reverse order
   * for (const key of trieMap.keys(true)) {
   *   console.log(key);
   * }
   * // Output:
   * // orange
   * // lemon
   * // apple
   * ```
   */
  keys(reversed = false) {
    if (undefined !== reversed) {
      validateBoolean(reversed, 'reversed');
    }
    return keys(this.#compressedTrieMap, reversed);
  }

  /**
   * Adds or updates an entry in the compressed-trie-map.
   *
   * If the key already exists, its value is updated but its position
   * in iteration order remains unchanged.
   *
   * @param word - The key for the entry.
   * @param value - The value to associate with the key.
   * @throws `TypeError` if `word` is not a string or is empty.
   * @example
   * ```typescript
   * const trieMap = new CompressedTrieMap();
   *
   * trieMap.set('apple', 1);
   * trieMap.set('lemon', 2);
   *
   * trieMap.set('apple', 3); // Updating existing entry
   *
   * console.log(trieMap.get('apple')); // 3
   * ```
   */
  set(word: string, value: V) {
    validateNonEmptyString(word, 'word');
    return setWordValue(this.#compressedTrieMap, word, value);
  }

  /**
   * Returns an iterator of all values in the compressed-trie-map.
   *
   * Values are yielded in their corresponding entries' insertion order.
   *
   * @param [reversed = false] - Optional `boolean` to reverse iteration order.
   * @returns An iterator of the compressed-trie-map's values.
   * @throws `TypeError` if `reversed` is not a boolean value.
   * @example
   * ```typescript
   * const trieMap = new CompressedTrieMap([
   *   ['apple', 1],
   *   ['lemon', 2],
   *   ['orange', 3]
   * ]);
   *
   * // Forward order
   * for (const value of trieMap.values()) {
   *   console.log(value);
   * }
   * // Output:
   * // 1
   * // 2
   * // 3
   *
   * // Reverse order
   * for (const value of trieMap.values(true)) {
   *   console.log(value);
   * }
   * // Output:
   * // 3
   * // 2
   * // 1
   * ```
   */
  values(reversed = false) {
    if (undefined !== reversed) {
      validateBoolean(reversed, 'reversed');
    }
    return values(this.#compressedTrieMap, reversed);
  }
}
