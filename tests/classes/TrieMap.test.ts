import { CompressedTrieMap, TrieMap } from '../../src';
import {
  ALL_WORDS,
  ALL_WORDS_VALUES,
  WORDS_1,
  WORDS_2,
} from '../tests-constants';
import { isValidClassInstance } from '../tests-util';

describe.each([
  ['TrieMap' as const, TrieMap],
  ['CompressedTrieMap' as const, CompressedTrieMap],
])('Classes >> %s', (instanceType, TrieMapClass) => {
  it('Insert words and clear structure', () => {
    const instance = new TrieMapClass();

    expect(isValidClassInstance(instance, instanceType)).toBe(true);

    ALL_WORDS.forEach((word, i) => {
      const key = word;
      const value = `{{${word}}}`;
      expect(instance.has(key)).toBe(false);
      expect(instance.get(key)).toBe(undefined);
      expect(instance.set(key, value)).toBe(undefined);
      expect(instance.has(key)).toBe(true);
      expect(instance.get(key)).toBe(value);
      expect(instance.size).toBe(i + 1);
    });

    // Confirm that all values ​​are included in the structure.
    let i = 0;
    for (let entry of instance) {
      expect(entry).toStrictEqual([ALL_WORDS[i], `{{${ALL_WORDS[i]}}}`]);
      i++;
    }

    // Try to insert the same values.
    ALL_WORDS.forEach((word) => {
      const key = word;
      const value = `{{${word}}}`;
      expect(instance.has(key)).toBe(true);
      expect(instance.get(key)).toBe(value);
      expect(instance.set(key, value)).toBe(undefined);
      expect(instance.has(key)).toBe(true);
      expect(instance.get(key)).toBe(value);
      expect(instance.size).toBe(ALL_WORDS.length);
    });

    instance.clear();

    expect(instance.size).toBe(0);
  });

  it('Insert and delete words', () => {
    const instance = new TrieMapClass(ALL_WORDS.map((w) => [w, `{{${w}}}`]));

    expect(isValidClassInstance(instance, instanceType)).toBe(true);

    // Try to remove values ​​that are not included.
    expect(instance.delete('gon')).toBe(false); // Valid prefix, invalid word.
    expect(instance.delete('invalid')).toBe(false); // Invalid prefix.

    // Remove all values.
    ALL_WORDS.forEach((word, i) => {
      expect(instance.has(word)).toBe(true);
      expect(instance.get(word)).toBe(`{{${word}}}`);
      expect(instance.delete(word)).toBe(true);
      expect(instance.has(word)).toBe(false);
      expect(instance.get(word)).toBe(undefined);
      expect(instance.size).toBe(ALL_WORDS.length - i - 1);

      let j = 0;
      for (let [k, v] of instance) {
        expect(k).toBe(ALL_WORDS[i + j + 1]);
        expect(v).toBe(`{{${k}}}`);
        j++;
      }
    });

    expect(instance.size).toBe(0);
  });

  it('Insert and update words values', () => {
    const instance = new TrieMapClass(ALL_WORDS.map((w) => [w, `{{${w}}}`]));

    ALL_WORDS.forEach((word, i) => {
      expect(instance.get(word)).toBe(`{{${word}}}`);
      instance.set(word, `UPDATED_VALUE[${word}]`);
      expect(instance.get(word)).toBe(`UPDATED_VALUE[${word}]`);
    });

    instance.clear();

    expect(instance.size).toBe(0);
  });

  it('Insert and search words (1)', () => {
    const instance = new TrieMapClass(WORDS_1.map((w) => [w, `{{${w}}}`]));

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
    ).forEach(([search, expected]) => {
      const found = instance.find(search);
      expect(found.length).toBe(expected.length);
      expect(
        found.every(([k, v]) => expected.includes(k) && v === `{{${k}}}`)
      ).toBe(true);
    });

    instance.clear();
  });

  it('Insert and search words (2)', () => {
    const instance = new TrieMapClass(WORDS_2.map((w) => [w, `{{${w}}}`]));

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
    ).forEach(([search, expected]) => {
      const found = instance.find(search);
      expect(found.length).toBe(expected.length);
      expect(
        found.every(([k, v]) => expected.includes(k) && v === `{{${k}}}`)
      ).toBe(true);
    });

    instance.clear();
  });

  it('Insert and search words (3)', () => {
    const instance = new TrieMapClass(['cart'].map((w) => [w, `{{${w}}}`]));

    (
      [
        // ['', []],  // @todo: Is not allowed to search empty strings
        ['c', ['cart']],
        ['ca', ['cart']],
        ['car', ['cart']],
        ['cart', ['cart']],
      ] as [string, string[]][]
    ).forEach(([search, expected]) => {
      const found = instance.find(search);
      expect(found.length).toBe(expected.length);
      expect(
        found.every(([k, v]) => expected.includes(k) && v === `{{${k}}}`)
      ).toBe(true);
    });

    instance.set('cat', '{{cat}}');

    (
      [
        // ['', []],  // @todo: Is not allowed to search empty strings
        ['c', ['cat', 'cart']],
        ['ca', ['cat', 'cart']],
        ['car', ['cart']],
        ['cart', ['cart']],
      ] as [string, string[]][]
    ).forEach(([search, expected]) => {
      const found = instance.find(search);
      expect(found.length).toBe(expected.length);
      expect(
        found.every(([k, v]) => expected.includes(k) && v === `{{${k}}}`)
      ).toBe(true);
    });

    instance.set('car', '{{car}}');

    (
      [
        // ['', []],  // @todo: Is not allowed to search empty strings
        ['c', ['car', 'cat', 'cart']],
        ['ca', ['car', 'cat', 'cart']],
        ['car', ['car', 'cart']],
        ['cart', ['cart']],
      ] as [string, string[]][]
    ).forEach(([search, expected]) => {
      const found = instance.find(search);
      expect(found.length).toBe(expected.length);
      expect(
        found.every(([k, v]) => expected.includes(k) && v === `{{${k}}}`)
      ).toBe(true);
    });

    instance.clear();
  });

  it('Symbol iterator', () => {
    const instance = new TrieMapClass(ALL_WORDS_VALUES);

    expect([...instance]).toStrictEqual(ALL_WORDS_VALUES);

    let i = 0;
    for (const entry of instance[Symbol.iterator]()) {
      expect(entry).toStrictEqual(ALL_WORDS_VALUES[i++]);
    }

    i = ALL_WORDS.length - 1;
    for (const entry of instance[Symbol.iterator](true)) {
      expect(entry).toStrictEqual(ALL_WORDS_VALUES[i--]);
    }

    instance.clear();
  });

  it('Entries iterator', () => {
    const instance = new TrieMapClass(ALL_WORDS_VALUES);

    let i = 0;
    for (const entry of instance.entries()) {
      expect(entry).toStrictEqual(ALL_WORDS_VALUES[i++]);
    }

    i = ALL_WORDS_VALUES.length - 1;
    for (const entry of instance.entries(true)) {
      expect(entry).toStrictEqual(ALL_WORDS_VALUES[i--]);
    }

    instance.clear();
  });

  it('Keys iterator', () => {
    const instance = new TrieMapClass(ALL_WORDS_VALUES);

    let i = 0;
    for (const key of instance.keys()) {
      expect(key).toStrictEqual(ALL_WORDS_VALUES[i++][0]);
    }

    i = ALL_WORDS_VALUES.length - 1;
    for (const key of instance.keys(true)) {
      expect(key).toStrictEqual(ALL_WORDS_VALUES[i--][0]);
    }

    instance.clear();
  });

  it('Values iterator', () => {
    const instance = new TrieMapClass(ALL_WORDS_VALUES);

    let i = 0;
    for (const value of instance.values()) {
      expect(value).toStrictEqual(ALL_WORDS_VALUES[i++][1]);
    }

    i = ALL_WORDS_VALUES.length - 1;
    for (const value of instance.values(true)) {
      expect(value).toStrictEqual(ALL_WORDS_VALUES[i--][1]);
    }

    instance.clear();
  });

  it('For-of iterator', () => {
    const instance = new TrieMapClass(ALL_WORDS_VALUES);

    let i = 0;
    for (const entry of instance) {
      expect(entry).toStrictEqual(ALL_WORDS_VALUES[i++]);
    }

    instance.clear();
  });

  it('For-each iterator', () => {
    const instance = new TrieMapClass(ALL_WORDS_VALUES);

    let i = 0;
    instance.forEach((value, word) => {
      expect(word).toStrictEqual(ALL_WORDS_VALUES[i][0]);
      expect(value).toStrictEqual(ALL_WORDS_VALUES[i][1]);
      i++;
    });

    instance.clear();
  });

  it('Invalid string arguments', () => {
    const instance = new TrieMapClass();

    const ANY_VALUE = 'ANY_VALUE';

    expect(() => instance.set('', ANY_VALUE)).toThrow(TypeError);
    expect(() => instance.set('', ANY_VALUE)).toThrow(
      'The "word" value should not be empty'
    );

    expect(() => instance.find('')).toThrow(TypeError);
    expect(() => instance.find('')).toThrow(
      'The "prefix" value should not be empty'
    );

    const invalidWords = [null, undefined, 9, {}, [], () => {}] as string[];

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
      expect(() => instance.get(w)).toThrow(TypeError);
      expect(() => instance.get(w)).toThrow(
        `The "word" value must be a string. Current value: "${w}"`
      );
    });

    invalidWords.forEach((w) => {
      expect(() => instance.has(w)).toThrow(TypeError);
      expect(() => instance.has(w)).toThrow(
        `The "word" value must be a string. Current value: "${w}"`
      );
    });

    invalidWords.forEach((w) => {
      expect(() => instance.set(w, 'ANY')).toThrow(TypeError);
      expect(() => instance.set(w, 'ANY')).toThrow(
        `The "word" value must be a string. Current value: "${w}"`
      );
    });
  });

  it('Invalid boolean arguments', () => {
    const instance = new TrieMapClass();

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

    invalidReversed.forEach((r) => {
      expect(() => instance.keys(r)).toThrow(TypeError);
      expect(() => instance.keys(r)).toThrow(
        `The "reversed" value must be a boolean. Current value: "${r}"`
      );
    });

    invalidReversed.forEach((r) => {
      expect(() => instance.values(r)).toThrow(TypeError);
      expect(() => instance.values(r)).toThrow(
        `The "reversed" value must be a boolean. Current value: "${r}"`
      );
    });
  });

  it('Invalid function arguments', () => {
    const instance = new TrieMapClass();

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
