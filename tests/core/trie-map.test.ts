import {
  clear,
  create,
  entries,
  setWordValue,
  size,
  values,
} from '../../src/core/trie-map';
import { entries as keys } from '../../src/core/trie';
import { ALL_WORDS, ALL_WORDS_VALUES } from '../tests-constants';
import { isValidObjectInstance } from '../tests-util';

describe('core >> trie-map', () => {
  const instance = create();

  beforeAll(() => {
    expect(isValidObjectInstance(instance, 'trie-map')).toBe(true);
    expect(isValidObjectInstance(instance.root, 'trie-map-node')).toBe(true);
    expect(size(instance)).toBe(0);
    expect(instance.root.children.size).toBe(0);
  });

  afterEach(() => {
    expect(size(instance)).toBe(0);
    expect(instance.root.children.size).toBe(0);
  });

  it('Entries iterator', () => {
    ALL_WORDS_VALUES.forEach(([word, value]) =>
      setWordValue(instance, word, value)
    );

    let i = 0;
    for (const entry of entries(instance)) {
      expect(entry).toStrictEqual(ALL_WORDS_VALUES[i++]);
    }

    i = ALL_WORDS_VALUES.length - 1;
    for (const entry of entries(instance, true)) {
      expect(entry).toStrictEqual(ALL_WORDS_VALUES[i--]);
    }

    clear(instance);
  });

  it('Keys iterator', () => {
    ALL_WORDS_VALUES.forEach(([word, value]) =>
      setWordValue(instance, word, value)
    );

    let i = 0;
    for (const key of keys(instance)) {
      expect(key).toBe(ALL_WORDS_VALUES[i++][0]);
    }

    i = ALL_WORDS_VALUES.length - 1;
    for (const key of keys(instance, true)) {
      expect(key).toBe(ALL_WORDS_VALUES[i--][0]);
    }

    clear(instance);
  });

  it('Values iterator', () => {
    ALL_WORDS_VALUES.forEach(([word, value]) =>
      setWordValue(instance, word, value)
    );

    let i = 0;
    for (const value of values(instance)) {
      expect(value).toBe(ALL_WORDS_VALUES[i++][1]);
    }

    i = ALL_WORDS_VALUES.length - 1;
    for (const value of values(instance, true)) {
      expect(value).toBe(ALL_WORDS_VALUES[i--][1]);
    }

    clear(instance);
  });
});
