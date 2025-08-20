import { deleteWord, entries as keys, includesWord } from '../core/trie';
import {
  clear,
  create,
  entries,
  getPrefixEntries,
  getWordValue,
  setWordValue,
  size,
  values,
} from '../core/trie-map';
import { ITrieMap } from '../types';
import { AbstractTrieMap } from './abstract';
import {
  validateBoolean,
  validateFunction,
  validateNonEmptyString,
} from './validators';

/**
 * A trie-based map implementation that extends `AbstractTrieMap`.
 * Associates values with string keys (words) while preserving key lookup efficiency.
 *
 * @template V - The type of values stored in the trie-map.
 * @example
 * ```typescript
 * const trieMap = new TrieMap();
 *
 * trieMap.set('apple', 1);
 * trieMap.set('lemon', 2);
 *
 * console.log(trieMap.has('apple')); // true
 * console.log([...trieMap]); // [['apple', 1], ['lemon', 2]]
 * ```
 */
export class TrieMap<V = unknown> extends AbstractTrieMap<V> {
  /** Private field holding the internal trie-map data structure */
  readonly #trieMap: ITrieMap<V>;

  /**
   * Creates a new `TrieMap` instance.
   *
   * @param [initialWordValues] - Optional array of `[word, value]` pairs to initialize the trie-map with.
   * @throws `TypeError` if `initialWordValues` is defined and contains an invalid word (empty string or non-string value).
   * @example
   * ```typescript
   * // Empty trie-map
   * const trieMap1 = new TrieMap();
   *
   * // Trie-map with initial entries
   * const trieMap2 = new TrieMap([
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

    this.#trieMap = create<ITrieMap<V>>();

    if (undefined !== initialWordValues) {
      initialWordValues.forEach(([word, value]) => this.set(word, value));
    }
  }

  /**
   * Gets the number of entries stored in the trie-map.
   *
   * @returns The total count of word-value pairs.
   * @example
   * ```typescript
   * const trieMap = new TrieMap([
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
    return size(this.#trieMap);
  }

  /**
   * Makes the `TrieMap` iterable.
   *
   * Entries are yielded in their insertion order by default.
   *
   * @param [reversed = false] - Optional `boolean` to reverse iteration order.
   * @returns An iterator for the trie-map's entries.
   * @throws `TypeError` if `reversed` is not a boolean value.
   * @example
   * ```typescript
   * const trieMap = new TrieMap([
   *  ['apple', 1],
   *  ['lemon', 2],
   *  ['orange', 3],
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
   * Removes all entries from the trie-map, resetting it to an empty state.
   *
   * @example
   * ```typescript
   * const trieMap = new TrieMap([
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
    return clear(this.#trieMap);
  }

  /**
   * Removes an entry from the trie-map.
   *
   * @param word - The key of the entry to remove.
   * @returns `true` if the entry was found and removed, `false` if not found.
   * @throws `TypeError` if `word` is not a string or is empty.
   * @example
   * ```typescript
   * const trieMap = new TrieMap([
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
    return deleteWord(this.#trieMap, word);
  }

  /**
   * Returns an iterator of all entries in the trie-map.
   *
   * Entries are yielded in their insertion order by default.
   *
   * @param [reversed = false] - Optional `boolean` to reverse iteration order.
   * @returns An iterator of the trie-map's entries.
   * @throws `TypeError` if `reversed` is not a boolean value.
   * @example
   * ```typescript
   * const trieMap = new TrieMap([
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
    return entries(this.#trieMap, reversed);
  }

  /**
   * Finds all entries whose keys start with the given prefix.
   *
   * @param prefix - The prefix to search for.
   * @returns An array of matching `[word, value]` pairs.
   * @throws `TypeError` if `prefix` is not a string or is empty.
   * @example
   * ```typescript
   * const trieMap = new TrieMap([
   *   ['car', 1],
   *   ['cat', 2],
   *   ['cart', 3]
   * ]);
   *
   * console.log(trieMap.find('car'));
   * // [['car', 1], ['cart', 3]]
   *
   * console.log(trieMap.find('ca'));
   * // [['car', 1], ['cart', 3], ['cat', 2]]
   * ```
   */
  find(prefix: string) {
    validateNonEmptyString(prefix, 'prefix');
    return getPrefixEntries(this.#trieMap, prefix);
  }

  /**
   * Executes a callback for each entry in the trie-map.
   *
   * @throws `TypeError` if `callback` is not a function.
   * @example
   * ```typescript
   * const trieMap = new TrieMap([
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
     * @param trieMap - The trie-map instance being traversed.
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
   * const trieMap = new TrieMap([
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
    return getWordValue(this.#trieMap, word);
  }

  /**
   * Checks if an entry with the specified key exists in the trie-map.
   *
   * @param word - The key to check.
   * @returns `true` if an entry with the key exists, `false` otherwise.
   * @throws `TypeError` if `word` is not a string or is empty.
   * @example
   * ```typescript
   * const trieMap = new TrieMap([['apple', 1]]);
   *
   * console.log(trieMap.has('apple')); // true
   * console.log(trieMap.has('ap')); // false
   * console.log(trieMap.has('lemon')); // false
   * ```
   */
  has(word: string) {
    validateNonEmptyString(word, 'word');
    return includesWord(this.#trieMap, word);
  }

  /**
   * Returns an iterator of all keys in the trie-map.
   *
   * Keys are yielded in their entries' insertion order.
   *
   * @param [reversed = false] - Optional `boolean` to reverse iteration order.
   * @returns An iterator of the trie-map's keys.
   * @throws `TypeError` if `reversed` is not a boolean value.
   * @example
   * ```typescript
   * const trieMap = new TrieMap([
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
    return keys(this.#trieMap, reversed);
  }

  /**
   * Adds or updates an entry in the trie-map.
   *
   * If the key already exists, its value is updated but its position
   * in iteration order remains unchanged.
   *
   * @param word - The key for the entry.
   * @param value - The value to associate with the key.
   * @throws `TypeError` if `word` is not a string or is empty.
   * @example
   * ```typescript
   * const trieMap = new TrieMap();
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
    return setWordValue(this.#trieMap, word, value);
  }

  /**
   * Returns an iterator of all values in the trie-map.
   *
   * Values are yielded in their corresponding entries' insertion order.
   *
   * @param [reversed = false] - Optional `boolean` to reverse iteration order.
   * @returns An iterator of the trie-map's values.
   * @throws `TypeError` if `reversed` is not a boolean value.
   * @example
   * ```typescript
   * const trieMap = new TrieMap([
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
    return values(this.#trieMap, reversed);
  }
}
