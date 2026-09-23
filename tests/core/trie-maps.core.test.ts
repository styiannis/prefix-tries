import * as trieMap from '../../src/core/trie-map';
import * as compressedTrieMap from '../../src/core/compressed-trie-map';
import { entries as keys } from '../../src/core/trie';
import { ALL_WORDS_VALUES } from '../constants';
import { isValidObjectInstance } from '../util/isValidObjectInstance';

describe.each([
  ['trie-map' as const, 'trie-map-node' as const, trieMap],
  [
    'compressed-trie-map' as const,
    'compressed-trie-map-node' as const,
    compressedTrieMap,
  ],
])('Core >> %s', (instanceType, nodeInstanceType, trieMapNamespace) => {
  const { entries, values } = trieMap;
  const { clear, create, setWordValue, size } = trieMapNamespace;

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

  it('Entries iterator', () => {
    ALL_WORDS_VALUES.forEach(([word, value]) =>
      setWordValue(instance, word, value)
    );

    let i = 0;
    for (const entry of entries(instance)) {
      expect(entry).toStrictEqual(ALL_WORDS_VALUES[i++]);
    }
    expect(i).toBe(ALL_WORDS_VALUES.length);

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
      expect(key).toBe(ALL_WORDS_VALUES[i++]?.[0]);
    }
    expect(i).toBe(ALL_WORDS_VALUES.length);

    i = ALL_WORDS_VALUES.length - 1;
    for (const key of keys(instance, true)) {
      expect(key).toBe(ALL_WORDS_VALUES[i--]?.[0]);
    }

    clear(instance);
  });

  it('Values iterator', () => {
    ALL_WORDS_VALUES.forEach(([word, value]) =>
      setWordValue(instance, word, value)
    );

    let i = 0;
    for (const value of values(instance)) {
      expect(value).toBe(ALL_WORDS_VALUES[i++]?.[1]);
    }
    expect(i).toBe(ALL_WORDS_VALUES.length);

    i = ALL_WORDS_VALUES.length - 1;
    for (const value of values(instance, true)) {
      expect(value).toBe(ALL_WORDS_VALUES[i--]?.[1]);
    }

    clear(instance);
  });
});

describe('Core >> compressed-trie-map >> merge on delete', () => {
  const { entries, getWordValue } = trieMap;
  const { create, deleteWord, setWordValue } = compressedTrieMap;

  it('Deleting a word merges its node with a single remaining child', () => {
    const instance = create();

    (
      [
        ['a', 1],
        ['abc', 2],
        ['abd', 3],
      ] as [string, number][]
    ).forEach(([word, value]) => setWordValue(instance, word, value));

    expect(deleteWord(instance, 'a')).toBe(true);

    expect([...instance.root.children.keys()]).toEqual(['ab']);

    const node = instance.root.children.get('ab');
    expect(node?.parent).toBe(instance.root);
    expect([...(node?.children.keys() ?? [])]).toEqual(['c', 'd']);
    node?.children.forEach((child) => expect(child.parent).toBe(node));

    expect([...entries(instance)]).toEqual([
      ['abc', 2],
      ['abd', 3],
    ]);
  });

  it('Deleting every prefix of a word leaves the word as a single node', () => {
    const instance = create();

    const word = 'abcdefghij';
    const prefixes = [...word].map((_, i) => word.substring(0, i + 1));

    prefixes.forEach((prefix, i) => setWordValue(instance, prefix, i));
    prefixes.slice(0, -1).forEach((prefix) => deleteWord(instance, prefix));

    expect([...instance.root.children.keys()]).toEqual([word]);
    expect(instance.root.children.get(word)?.children.size).toBe(0);
    expect(getWordValue(instance, word)).toBe(word.length - 1);
  });
});
