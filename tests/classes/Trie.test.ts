import { CompressedTrie, Trie } from '../../src';
import { ALL_WORDS, WORDS_1, WORDS_2 } from '../tests-constants';
import { isValidClassInstance } from '../tests-util';

describe.each([
  ['Trie' as const, Trie],
  ['CompressedTrie' as const, CompressedTrie],
])('Classes >> %s', (instanceType, TrieClass) => {
  it('Insert words and clear structure', () => {
    const instance = new TrieClass();

    expect(isValidClassInstance(instance, instanceType)).toBe(true);

    ALL_WORDS.forEach((word, i) => {
      expect(instance.has(word)).toBe(false);
      expect(instance.add(word)).toBe(undefined);
      expect(instance.has(word)).toBe(true);
      expect(instance.size).toBe(i + 1);
    });

    // Confirm that all values ​​are included in the structure.
    let i = 0;
    for (let word of instance) {
      expect(word).toBe(ALL_WORDS[i]);
      i++;
    }

    // Try to insert the same values.
    ALL_WORDS.forEach((word) => {
      expect(instance.has(word)).toBe(true);
      expect(instance.add(word)).toBe(undefined);
      expect(instance.has(word)).toBe(true);
      expect(instance.size).toBe(ALL_WORDS.length);
    });

    instance.clear();

    expect(instance.size).toBe(0);
  });

  it('Insert and delete words', () => {
    const instance = new TrieClass(ALL_WORDS);

    expect(isValidClassInstance(instance, instanceType)).toBe(true);

    // Try to remove values ​​that are not included.
    expect(instance.delete('gon')).toBe(false); // Valid prefix, invalid word.
    expect(instance.delete('invalid')).toBe(false); // Invalid prefix.

    // Remove all values.
    ALL_WORDS.forEach((word, i) => {
      expect(instance.has(word)).toBe(true);
      expect(instance.delete(word)).toBe(true);
      expect(instance.has(word)).toBe(false);
      expect(instance.size).toBe(ALL_WORDS.length - i - 1);

      let j = 0;
      for (let k of instance) {
        expect(k).toBe(ALL_WORDS[i + j + 1]);
        j++;
      }
    });

    expect(instance.size).toBe(0);
  });

  it('Insert and search words [1]', () => {
    const instance = new TrieClass(WORDS_1);

    (
      [
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
      expect(instance.find(search).every((w) => expected.includes(w))).toBe(
        true
      )
    );

    instance.clear();
  });

  it('Insert and search words [2]', () => {
    const instance = new TrieClass(WORDS_2);

    (
      [
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
      expect(instance.find(search).every((w) => expected.includes(w))).toBe(
        true
      )
    );

    instance.clear();
  });

  it('Symbol iterator', () => {
    const instance = new TrieClass(ALL_WORDS);

    expect([...instance]).toStrictEqual(ALL_WORDS);

    let i = 0;
    for (let entry of instance[Symbol.iterator]()) {
      expect(entry).toBe(ALL_WORDS[i++]);
    }

    i = ALL_WORDS.length - 1;
    for (let entry of instance[Symbol.iterator](true)) {
      expect(entry).toBe(ALL_WORDS[i--]);
    }

    instance.clear();
  });

  it('Entries iterator', () => {
    const instance = new TrieClass(ALL_WORDS);

    let i = 0;
    for (const entry of instance.entries()) {
      expect(entry).toStrictEqual(ALL_WORDS[i++]);
    }

    i = ALL_WORDS.length - 1;
    for (const entry of instance.entries(true)) {
      expect(entry).toStrictEqual(ALL_WORDS[i--]);
    }

    instance.clear();
  });

  it('For-of iterator', () => {
    const instance = new TrieClass(ALL_WORDS);

    let i = 0;
    for (const entry of instance) {
      expect(entry).toBe(ALL_WORDS[i++]);
    }

    instance.clear();
  });

  it('For-each iterator', () => {
    const instance = new TrieClass(ALL_WORDS);

    let i = 0;
    instance.forEach((entry) => expect(entry).toBe(ALL_WORDS[i++]));

    instance.clear();
  });

  it('Invalid string arguments', () => {
    const instance = new TrieClass();

    expect(() => instance.add('')).toThrow(TypeError);
    expect(() => instance.add('')).toThrow(
      `The "word" value should not be empty.`
    );

    expect(() => instance.find('')).toThrow(TypeError);
    expect(() => instance.find('')).toThrow(
      `The "prefix" value should not be empty.`
    );

    const invalidWords = [null, undefined, 9, {}, [], () => {}] as string[];

    invalidWords.forEach((w) => {
      expect(() => instance.add(w)).toThrow(TypeError);
      expect(() => instance.add(w)).toThrow(
        `The "word" value must be a string. Current value: "${w}"`
      );
    });

    invalidWords.forEach((w) => {
      expect(() => instance.delete(w)).toThrow(TypeError);
      expect(() => instance.delete(w)).toThrow(
        `The "word" value must be a string. Current value: "${w}"`
      );
    });

    invalidWords.forEach((w) => {
      expect(() => instance.find(w)).toThrow(TypeError);
      expect(() => instance.find(w)).toThrow(
        `The "prefix" value must be a string. Current value: "${w}"`
      );
    });

    invalidWords.forEach((w) => {
      expect(() => instance.has(w)).toThrow(TypeError);
      expect(() => instance.has(w)).toThrow(
        `The "word" value must be a string. Current value: "${w}"`
      );
    });
  });

  it('Invalid boolean arguments', () => {
    const instance = new TrieClass();

    const invalidReversed = [null, 'w', 9, {}, [], () => {}] as boolean[];

    invalidReversed.forEach((r) => {
      expect(() => instance[Symbol.iterator](r)).toThrow(TypeError);
      expect(() => instance[Symbol.iterator](r)).toThrow(
        `The "reversed" value must be a boolean. Current value: "${r}"`
      );
    });

    invalidReversed.forEach((r) => {
      expect(() => instance.entries(r)).toThrow(TypeError);
      expect(() => instance.entries(r)).toThrow(
        `The "reversed" value must be a boolean. Current value: "${r}"`
      );
    });
  });

  it('Invalid function arguments', () => {
    const instance = new TrieClass();

    const invalidReversed = [undefined, null, 'w', 9, {}, []] as Array<
      () => any
    >;

    invalidReversed.forEach((f) => {
      expect(() => instance.forEach(f)).toThrow(TypeError);
      expect(() => instance.forEach(f)).toThrow(
        `The "callback" value must be a function. Current value: "${f}"`
      );
    });
  });
});
