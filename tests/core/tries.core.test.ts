import * as trie from '../../src/core/trie';
import * as compressedTrie from '../../src/core/compressed-trie';
import { ALL_WORDS, WORDS_1, WORDS_2 } from '../tests-constants';
import { isValidObjectInstance } from '../tests-util';

describe.each([
  ['trie' as const, 'trie-node' as const, trie],
  ['compressed-trie' as const, 'compressed-trie-node' as const, compressedTrie],
])('Core >> %s', (instanceType, nodeInstanceType, trieNamespace) => {
  const { entries, includesWord } = trie;
  const { clear, create, addWord, getPrefixEntries, deleteWord, size } =
    trieNamespace;

  const instance = create();

  beforeAll(() => {
    expect(isValidObjectInstance(instance, instanceType)).toBe(true);
    expect(isValidObjectInstance(instance.root, nodeInstanceType)).toBe(true);
    expect(size(instance)).toBe(0);
    expect(instance.root.children.size).toBe(0);
  });

  afterEach(() => {
    expect(size(instance)).toBe(0);
    expect(instance.root.children.size).toBe(0);
  });

  it('Insert words and clear structure', () => {
    ALL_WORDS.forEach((word, i) => {
      expect(includesWord(instance, word)).toBe(false);
      expect(addWord(instance, word)).toBe(undefined);
      expect(includesWord(instance, word)).toBe(true);
      expect(size(instance)).toBe(i + 1);
    });

    // Confirm that all values ​​are included in the structure
    const iter = entries(instance);
    let i = 0;
    for (let word of iter) {
      expect(word).toBe(ALL_WORDS[i]);
      i++;
    }

    // Try to insert the same values
    ALL_WORDS.forEach((word, i) => {
      expect(includesWord(instance, word)).toBe(true);
      expect(addWord(instance, word)).toBe(undefined);
      expect(includesWord(instance, word)).toBe(true);
      expect(size(instance)).toBe(ALL_WORDS.length);
    });

    clear(instance);
  });

  it('Insert and delete words', () => {
    ALL_WORDS.forEach((word) => addWord(instance, word));

    // Try to remove values ​​that are not included
    expect(deleteWord(instance, 'gon')).toBe(false); // Valid prefix, invalid word
    expect(deleteWord(instance, 'invalid')).toBe(false); // Invalid prefix

    // Remove all values
    ALL_WORDS.forEach((word, i) => {
      expect(includesWord(instance, word)).toBe(true);
      expect(deleteWord(instance, word)).toBe(true);
      expect(includesWord(instance, word)).toBe(false);
      expect(size(instance)).toBe(ALL_WORDS.length - i - 1);

      const iter = entries(instance);
      let j = 0;
      for (let word of iter) {
        expect(word).toBe(ALL_WORDS[1 + i + j]);
        i++;
      }
    });
  });

  it('Insert and search words (1)', () => {
    WORDS_1.forEach((word) => addWord(instance, word));

    (
      [
        ['', []],
        ['!', []],
        ['z', []],
        ['a', ['apple']],
        ['ap', ['apple']],
        ['app', ['apple']],
        ['appl', ['apple']],
        ['apple', ['apple']],
        ['apple8', []],
        ['b', ['bed', 'bear']],
        ['be', ['bed', 'bear']],
        ['bed', ['bed']],
        ['bed4', []],
        ['bea', ['bear']],
        ['bear', ['bear']],
        ['bear7', []],
        ['t', ['test', 'testing']],
        ['te', ['test', 'testing']],
        ['tes', ['test', 'testing']],
        ['test', ['test', 'testing']],
        ['testi', ['testing']],
        ['testin', ['testing']],
        ['testing', ['testing']],
        ['testing2', []],
        ['g', ['get', 'go', 'gone']],
        ['ge', ['get']],
        ['get', ['get']],
        ['get3', []],
        ['go', ['go', 'gone']],
        ['gon', ['gone']],
        ['gone', ['gone']],
        ['gone6', []],
      ] as [string, string[]][]
    ).forEach(([search, expected]) => {
      const found = getPrefixEntries(instance, search);
      expect(found.length).toBe(expected.length);
      expect(expected.every((v) => found.includes(v))).toBe(true);
    });

    clear(instance);
  });

  it('Insert and search words (2)', () => {
    WORDS_2.forEach((word) => addWord(instance, word));

    (
      [
        ['', []],
        ['!', []],
        ['z', []],
        [
          'r',
          [
            'rom',
            'romane',
            'romanus',
            'romulus',
            'rubens',
            'ruber',
            'rubicon',
            'rubicundus',
          ],
        ],
        ['ro', ['rom', 'romane', 'romanus', 'romulus']],
        ['rom', ['rom', 'romane', 'romanus', 'romulus']],
        ['ru', ['rubens', 'ruber', 'rubicon', 'rubicundus']],
        ['rub', ['rubens', 'ruber', 'rubicon', 'rubicundus']],
        ['rube', ['rubens', 'ruber']],
        ['ruben', ['rubens']],
        ['rubens', ['rubens']],
        ['rubens_', []],
        ['ruber', ['ruber']],
        ['ruber_', []],
        ['rubi', ['rubicon', 'rubicundus']],
        ['rubic', ['rubicon', 'rubicundus']],
        ['rubico', ['rubicon']],
        ['rubicon', ['rubicon']],
        ['rubicon_', []],
        ['rubicu', ['rubicundus']],
        ['rubicun', ['rubicundus']],
        ['rubicund', ['rubicundus']],
        ['rubicundu', ['rubicundus']],
        ['rubicundus', ['rubicundus']],
        ['rubicundus_', []],
      ] as [string, string[]][]
    ).forEach(([search, expected]) => {
      const found = getPrefixEntries(instance, search);
      expect(found.length).toBe(expected.length);
      expect(expected.every((v) => found.includes(v))).toBe(true);
    });

    clear(instance);
  });

  it('Insert and search words (3)', () => {
    addWord(instance, 'cart');

    (
      [
        ['', []],
        ['c', ['cart']],
        ['ca', ['cart']],
        ['car', ['cart']],
        ['cart', ['cart']],
      ] as [string, string[]][]
    ).forEach(([search, expected]) => {
      const found = getPrefixEntries(instance, search);
      expect(found.length).toBe(expected.length);
      expect(expected.every((v) => found.includes(v))).toBe(true);
    });

    addWord(instance, 'cat');

    (
      [
        ['', []],
        ['c', ['cat', 'cart']],
        ['ca', ['cat', 'cart']],
        ['car', ['cart']],
        ['cart', ['cart']],
      ] as [string, string[]][]
    ).forEach(([search, expected]) => {
      const found = getPrefixEntries(instance, search);
      expect(found.length).toBe(expected.length);
      expect(expected.every((v) => found.includes(v))).toBe(true);
    });

    addWord(instance, 'car');

    (
      [
        ['', []],
        ['c', ['car', 'cat', 'cart']],
        ['ca', ['car', 'cat', 'cart']],
        ['car', ['car', 'cart']],
        ['cart', ['cart']],
      ] as [string, string[]][]
    ).forEach(([search, expected]) => {
      const found = getPrefixEntries(instance, search);
      expect(found.length).toBe(expected.length);
      expect(expected.every((v) => found.includes(v))).toBe(true);
    });

    clear(instance);
  });
});
