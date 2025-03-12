import {
  clear,
  create,
  includesWord as includes,
  addWord as add,
  getPrefixEntries as find,
  deleteWord,
  size,
  entries,
} from '../../src/core/trie';
import { ALL_WORDS, WORDS_1, WORDS_2 } from '../tests-constants';
import { isValidObjectInstance } from '../tests-util';

describe('core >> trie', () => {
  const instance = create();

  beforeAll(() => {
    expect(isValidObjectInstance(instance, 'trie')).toBe(true);
    expect(isValidObjectInstance(instance.root, 'trie-node')).toBe(true);
    expect(size(instance)).toBe(0);
    expect(instance.root.children.size).toBe(0);
  });

  afterEach(() => {
    expect(size(instance)).toBe(0);
    expect(instance.root.children.size).toBe(0);
  });

  it('Insert words and clear structure', () => {
    ALL_WORDS.forEach((word, i) => {
      expect(includes(instance, word)).toBe(false);
      expect(add(instance, word)).toBe(undefined);
      expect(includes(instance, word)).toBe(true);
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
      expect(includes(instance, word)).toBe(true);
      expect(add(instance, word)).toBe(undefined);
      expect(includes(instance, word)).toBe(true);
      expect(size(instance)).toBe(ALL_WORDS.length);
    });

    clear(instance);
  });

  it('Insert and delete words', () => {
    ALL_WORDS.forEach((word) => add(instance, word));

    // Try to deleteWord values ​​that are not included
    expect(deleteWord(instance, 'gon')).toBe(false); // Valid prefix, invalid word
    expect(deleteWord(instance, 'invalid')).toBe(false); // Invalid prefix

    // Remove all values
    ALL_WORDS.forEach((word, i) => {
      expect(includes(instance, word)).toBe(true);
      expect(deleteWord(instance, word)).toBe(true);
      expect(includes(instance, word)).toBe(false);
      expect(size(instance)).toBe(ALL_WORDS.length - i - 1);

      const iter = entries(instance);
      let j = 0;
      for (let word of iter) {
        expect(word).toBe(ALL_WORDS[1 + i + j]);
        i++;
      }
    });
  });

  it('Insert and search words [1]', () => {
    WORDS_1.forEach((word) => add(instance, word));

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
    ).forEach(([search, expected]) =>
      expect(find(instance, search).every((w) => expected.includes(w))).toBe(
        true
      )
    );

    clear(instance);
  });

  it('Insert and search words [2]', () => {
    WORDS_2.forEach((word) => add(instance, word));

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
    ).forEach(([search, expected]) =>
      expect(find(instance, search).every((v) => expected.includes(v))).toBe(
        true
      )
    );

    clear(instance);
  });
});
