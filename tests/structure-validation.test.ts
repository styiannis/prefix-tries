import * as compressedTrie from '../src/core/compressed-trie';
import * as trie from '../src/core/trie';
import { ITrie } from '../src/types';
import { WORDS_1, WORDS_2 } from './tests-constants';

/* ----------------------------------------- */
/* ---------- // Helper functions ---------- */
/* ----------------------------------------- */

function confirmStructure(
  instance: ITrie,
  expectedNodesData: [string[], boolean, number][]
) {
  expectedNodesData.forEach(
    ([nodePrefixes, isNodeEndOfWord, nodeChildrengetSize]) => {
      let node: typeof instance.root | undefined = instance.root;

      for (let i = 0; node && i < nodePrefixes.length; i++) {
        node = node.children.get(nodePrefixes[i]);
      }

      expect(node?.listNode).not.toBe(undefined);

      if (node?.listNode) {
        expect(!!node.listNode).toBe(isNodeEndOfWord);

        if (node.listNode) {
          expect(node.listNode).toBe(node.listNode.trieNode.listNode);
        }

        expect(node.children.size).toBe(nodeChildrengetSize);

        node.children.forEach((n) => expect(n.parent === node).toBe(true));
      }
    }
  );
}

function insertWordAndConfirmStructure(
  instance: ITrie,
  insert: (_instance: typeof instance, _word: string) => void,
  word: string,
  expectedTreeStructure: [string[], boolean, number][]
) {
  expect(insert(instance, word)).toBe(undefined);
  confirmStructure(instance, expectedTreeStructure);
}

function deleteWordAndConfirmStructure(
  instance: ITrie,
  remove: (_instance: ITrie, _word: string) => boolean,
  word: string,
  expectedTreeStructure: [string[], boolean, number][]
) {
  expect(remove(instance, word)).toBe(true);
  confirmStructure(instance, expectedTreeStructure);
}

/* ----------------------------------------- */
/* ---------- Helper functions // ---------- */
/* ----------------------------------------- */

describe('core >> trie', () => {
  const { clear, create, addWord, deleteWord, size } = trie;

  const instance = create();

  beforeAll(() => {
    confirmStructure(instance, [[[], false, 0]]);
  });

  afterEach(() => {
    expect(size(instance)).toBe(0);
    expect(instance.root.children.size).toBe(0);
  });

  it('Structure validation after each word addition (1)', () => {
    const expectedStructure: [string[], boolean, number][][] = [
      [
        [[], false, 1],
        [['t'], false, 1],
        [['t', 'e'], false, 1],
        [['t', 'e', 's'], false, 1],
        [['t', 'e', 's', 't'], true, 0],
      ],
      [
        [[], false, 1],
        [['t'], false, 1],
        [['t', 'e'], false, 1],
        [['t', 'e', 's'], false, 1],
        [['t', 'e', 's', 't'], true, 1],
        [['t', 'e', 's', 't', 'i'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n', 'g'], true, 0],
      ],
      [
        [[], false, 2],
        [['t'], false, 1],
        [['t', 'e'], false, 1],
        [['t', 'e', 's'], false, 1],
        [['t', 'e', 's', 't'], true, 1],
        [['t', 'e', 's', 't', 'i'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n', 'g'], true, 0],
        [['g'], false, 1],
        [['g', 'o'], false, 1],
        [['g', 'o', 'n'], false, 1],
        [['g', 'o', 'n', 'e'], true, 0],
      ],
      [
        [[], false, 3],
        [['t'], false, 1],
        [['t', 'e'], false, 1],
        [['t', 'e', 's'], false, 1],
        [['t', 'e', 's', 't'], true, 1],
        [['t', 'e', 's', 't', 'i'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n', 'g'], true, 0],
        [['g'], false, 1],
        [['g', 'o'], false, 1],
        [['g', 'o', 'n'], false, 1],
        [['g', 'o', 'n', 'e'], true, 0],
        [['b'], false, 1],
        [['b', 'e'], false, 1],
        [['b', 'e', 'd'], true, 0],
      ],
      [
        [[], false, 3],
        [['t'], false, 1],
        [['t', 'e'], false, 1],
        [['t', 'e', 's'], false, 1],
        [['t', 'e', 's', 't'], true, 1],
        [['t', 'e', 's', 't', 'i'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n', 'g'], true, 0],
        [['g'], false, 1],
        [['g', 'o'], false, 1],
        [['g', 'o', 'n'], false, 1],
        [['g', 'o', 'n', 'e'], true, 0],
        [['b'], false, 1],
        [['b', 'e'], false, 2],
        [['b', 'e', 'd'], true, 0],
        [['b', 'e', 'a'], false, 1],
        [['b', 'e', 'a', 'r'], true, 0],
      ],
      [
        [[], false, 3],
        [['t'], false, 1],
        [['t', 'e'], false, 1],
        [['t', 'e', 's'], false, 1],
        [['t', 'e', 's', 't'], true, 1],
        [['t', 'e', 's', 't', 'i'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n', 'g'], true, 0],
        [['g'], false, 2],
        [['g', 'o'], false, 1],
        [['g', 'o', 'n'], false, 1],
        [['g', 'o', 'n', 'e'], true, 0],
        [['g', 'e'], false, 1],
        [['g', 'e', 't'], true, 0],
        [['b'], false, 1],
        [['b', 'e'], false, 2],
        [['b', 'e', 'd'], true, 0],
        [['b', 'e', 'a'], false, 1],
        [['b', 'e', 'a', 'r'], true, 0],
      ],
      [
        [[], false, 4],
        [['t'], false, 1],
        [['t', 'e'], false, 1],
        [['t', 'e', 's'], false, 1],
        [['t', 'e', 's', 't'], true, 1],
        [['t', 'e', 's', 't', 'i'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n', 'g'], true, 0],
        [['g'], false, 2],
        [['g', 'o'], false, 1],
        [['g', 'o', 'n'], false, 1],
        [['g', 'o', 'n', 'e'], true, 0],
        [['g', 'e'], false, 1],
        [['g', 'e', 't'], true, 0],
        [['b'], false, 1],
        [['b', 'e'], false, 2],
        [['b', 'e', 'd'], true, 0],
        [['b', 'e', 'a'], false, 1],
        [['b', 'e', 'a', 'r'], true, 0],
        [['a'], false, 1],
        [['a', 'p'], false, 1],
        [['a', 'p', 'p'], false, 1],
        [['a', 'p', 'p', 'l'], false, 1],
        [['a', 'p', 'p', 'l', 'e'], true, 0],
      ],
      [
        [[], false, 4],
        [['t'], false, 1],
        [['t', 'e'], false, 1],
        [['t', 'e', 's'], false, 1],
        [['t', 'e', 's', 't'], true, 1],
        [['t', 'e', 's', 't', 'i'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n', 'g'], true, 0],
        [['g'], false, 2],
        [['g', 'o'], true, 1],
        [['g', 'o', 'n'], false, 1],
        [['g', 'o', 'n', 'e'], true, 0],
        [['g', 'e'], false, 1],
        [['g', 'e', 't'], true, 0],
        [['b'], false, 1],
        [['b', 'e'], false, 2],
        [['b', 'e', 'd'], true, 0],
        [['b', 'e', 'a'], false, 1],
        [['b', 'e', 'a', 'r'], true, 0],
        [['a'], false, 1],
        [['a', 'p'], false, 1],
        [['a', 'p', 'p'], false, 1],
        [['a', 'p', 'p', 'l'], false, 1],
        [['a', 'p', 'p', 'l', 'e'], true, 0],
      ],
    ];

    for (let i = 0; i < WORDS_1.length; i++) {
      insertWordAndConfirmStructure(
        instance,
        addWord,
        WORDS_1[i],
        expectedStructure[i]
      );
    }

    clear(instance);
  });

  it('Structure validation after each word addition (2)', () => {
    const expectedStructure: [string[], boolean, number][][] = [
      [
        [[], false, 1],
        [['r'], false, 1],
        [['r', 'o'], false, 1],
        [['r', 'o', 'm'], false, 1],
        [['r', 'o', 'm', 'a'], false, 1],
        [['r', 'o', 'm', 'a', 'n'], false, 1],
        [['r', 'o', 'm', 'a', 'n', 'e'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 1],
        [['r', 'o'], false, 1],
        [['r', 'o', 'm'], false, 1],
        [['r', 'o', 'm', 'a'], false, 1],
        [['r', 'o', 'm', 'a', 'n'], false, 2],
        [['r', 'o', 'm', 'a', 'n', 'e'], true, 0],
        [['r', 'o', 'm', 'a', 'n', 'u'], false, 1],
        [['r', 'o', 'm', 'a', 'n', 'u', 's'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 1],
        [['r', 'o'], false, 1],
        [['r', 'o', 'm'], false, 2],
        [['r', 'o', 'm', 'a'], false, 1],
        [['r', 'o', 'm', 'a', 'n'], false, 2],
        [['r', 'o', 'm', 'a', 'n', 'e'], true, 0],
        [['r', 'o', 'm', 'a', 'n', 'u'], false, 1],
        [['r', 'o', 'm', 'a', 'n', 'u', 's'], true, 0],
        [['r', 'o', 'm', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u', 's'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 1],
        [['r', 'o'], false, 1],
        [['r', 'o', 'm'], true, 2],
        [['r', 'o', 'm', 'a'], false, 1],
        [['r', 'o', 'm', 'a', 'n'], false, 2],
        [['r', 'o', 'm', 'a', 'n', 'e'], true, 0],
        [['r', 'o', 'm', 'a', 'n', 'u'], false, 1],
        [['r', 'o', 'm', 'a', 'n', 'u', 's'], true, 0],
        [['r', 'o', 'm', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u', 's'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 2],
        [['r', 'o'], false, 1],
        [['r', 'o', 'm'], true, 2],
        [['r', 'o', 'm', 'a'], false, 1],
        [['r', 'o', 'm', 'a', 'n'], false, 2],
        [['r', 'o', 'm', 'a', 'n', 'e'], true, 0],
        [['r', 'o', 'm', 'a', 'n', 'u'], false, 1],
        [['r', 'o', 'm', 'a', 'n', 'u', 's'], true, 0],
        [['r', 'o', 'm', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u', 's'], true, 0],
        [['r', 'u'], false, 1],
        [['r', 'u', 'b'], false, 1],
        [['r', 'u', 'b', 'e'], false, 1],
        [['r', 'u', 'b', 'e', 'n'], false, 1],
        [['r', 'u', 'b', 'e', 'n', 's'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 2],
        [['r', 'o'], false, 1],
        [['r', 'o', 'm'], true, 2],
        [['r', 'o', 'm', 'a'], false, 1],
        [['r', 'o', 'm', 'a', 'n'], false, 2],
        [['r', 'o', 'm', 'a', 'n', 'e'], true, 0],
        [['r', 'o', 'm', 'a', 'n', 'u'], false, 1],
        [['r', 'o', 'm', 'a', 'n', 'u', 's'], true, 0],
        [['r', 'o', 'm', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u', 's'], true, 0],
        [['r', 'u'], false, 1],
        [['r', 'u', 'b'], false, 1],
        [['r', 'u', 'b', 'e'], false, 2],
        [['r', 'u', 'b', 'e', 'n'], false, 1],
        [['r', 'u', 'b', 'e', 'n', 's'], true, 0],
        [['r', 'u', 'b', 'e', 'r'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 2],
        [['r', 'o'], false, 1],
        [['r', 'o', 'm'], true, 2],
        [['r', 'o', 'm', 'a'], false, 1],
        [['r', 'o', 'm', 'a', 'n'], false, 2],
        [['r', 'o', 'm', 'a', 'n', 'e'], true, 0],
        [['r', 'o', 'm', 'a', 'n', 'u'], false, 1],
        [['r', 'o', 'm', 'a', 'n', 'u', 's'], true, 0],
        [['r', 'o', 'm', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u', 's'], true, 0],
        [['r', 'u'], false, 1],
        [['r', 'u', 'b'], false, 2],
        [['r', 'u', 'b', 'e'], false, 2],
        [['r', 'u', 'b', 'e', 'n'], false, 1],
        [['r', 'u', 'b', 'e', 'n', 's'], true, 0],
        [['r', 'u', 'b', 'e', 'r'], true, 0],
        [['r', 'u', 'b', 'i'], false, 1],
        [['r', 'u', 'b', 'i', 'c'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'o'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'o', 'n'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 2],
        [['r', 'o'], false, 1],
        [['r', 'o', 'm'], true, 2],
        [['r', 'o', 'm', 'a'], false, 1],
        [['r', 'o', 'm', 'a', 'n'], false, 2],
        [['r', 'o', 'm', 'a', 'n', 'e'], true, 0],
        [['r', 'o', 'm', 'a', 'n', 'u'], false, 1],
        [['r', 'o', 'm', 'a', 'n', 'u', 's'], true, 0],
        [['r', 'o', 'm', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u', 's'], true, 0],
        [['r', 'u'], false, 1],
        [['r', 'u', 'b'], false, 2],
        [['r', 'u', 'b', 'e'], false, 2],
        [['r', 'u', 'b', 'e', 'n'], false, 1],
        [['r', 'u', 'b', 'e', 'n', 's'], true, 0],
        [['r', 'u', 'b', 'e', 'r'], true, 0],
        [['r', 'u', 'b', 'i'], false, 1],
        [['r', 'u', 'b', 'i', 'c'], false, 2],
        [['r', 'u', 'b', 'i', 'c', 'o'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'o', 'n'], true, 0],
        [['r', 'u', 'b', 'i', 'c', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u', 's'], true, 0],
      ],
    ];

    for (let i = 0; i < WORDS_2.length; i++) {
      insertWordAndConfirmStructure(
        instance,
        addWord,
        WORDS_2[i],
        expectedStructure[i]
      );
    }

    clear(instance);
  });

  it('Structure validation after each word removal (1)', () => {
    WORDS_1.forEach((word) => expect(addWord(instance, word)).toBe(undefined));

    // Confirm structure before any removal.
    confirmStructure(instance, [
      [[], false, 4],
      [['t'], false, 1],
      [['t', 'e'], false, 1],
      [['t', 'e', 's'], false, 1],
      [['t', 'e', 's', 't'], true, 1],
      [['t', 'e', 's', 't', 'i'], false, 1],
      [['t', 'e', 's', 't', 'i', 'n'], false, 1],
      [['t', 'e', 's', 't', 'i', 'n', 'g'], true, 0],
      [['g'], false, 2],
      [['g', 'o'], true, 1],
      [['g', 'o', 'n'], false, 1],
      [['g', 'o', 'n', 'e'], true, 0],
      [['g', 'e'], false, 1],
      [['g', 'e', 't'], true, 0],
      [['b'], false, 1],
      [['b', 'e'], false, 2],
      [['b', 'e', 'd'], true, 0],
      [['b', 'e', 'a'], false, 1],
      [['b', 'e', 'a', 'r'], true, 0],
      [['a'], false, 1],
      [['a', 'p'], false, 1],
      [['a', 'p', 'p'], false, 1],
      [['a', 'p', 'p', 'l'], false, 1],
      [['a', 'p', 'p', 'l', 'e'], true, 0],
    ]);

    const expectedStructure: [string[], boolean, number][][] = [
      [
        [[], false, 4],
        [['t'], false, 1],
        [['t', 'e'], false, 1],
        [['t', 'e', 's'], false, 1],
        [['t', 'e', 's', 't'], false, 1],
        [['t', 'e', 's', 't', 'i'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n'], false, 1],
        [['t', 'e', 's', 't', 'i', 'n', 'g'], true, 0],
        [['g'], false, 2],
        [['g', 'o'], true, 1],
        [['g', 'o', 'n'], false, 1],
        [['g', 'o', 'n', 'e'], true, 0],
        [['g', 'e'], false, 1],
        [['g', 'e', 't'], true, 0],
        [['b'], false, 1],
        [['b', 'e'], false, 2],
        [['b', 'e', 'd'], true, 0],
        [['b', 'e', 'a'], false, 1],
        [['b', 'e', 'a', 'r'], true, 0],
        [['a'], false, 1],
        [['a', 'p'], false, 1],
        [['a', 'p', 'p'], false, 1],
        [['a', 'p', 'p', 'l'], false, 1],
        [['a', 'p', 'p', 'l', 'e'], true, 0],
      ],
      [
        [[], false, 3],
        [['g'], false, 2],
        [['g', 'o'], true, 1],
        [['g', 'o', 'n'], false, 1],
        [['g', 'o', 'n', 'e'], true, 0],
        [['g', 'e'], false, 1],
        [['g', 'e', 't'], true, 0],
        [['b'], false, 1],
        [['b', 'e'], false, 2],
        [['b', 'e', 'd'], true, 0],
        [['b', 'e', 'a'], false, 1],
        [['b', 'e', 'a', 'r'], true, 0],
        [['a'], false, 1],
        [['a', 'p'], false, 1],
        [['a', 'p', 'p'], false, 1],
        [['a', 'p', 'p', 'l'], false, 1],
        [['a', 'p', 'p', 'l', 'e'], true, 0],
      ],
      [
        [[], false, 3],
        [['g'], false, 2],
        [['g', 'o'], true, 0],
        [['g', 'e'], false, 1],
        [['g', 'e', 't'], true, 0],
        [['b'], false, 1],
        [['b', 'e'], false, 2],
        [['b', 'e', 'd'], true, 0],
        [['b', 'e', 'a'], false, 1],
        [['b', 'e', 'a', 'r'], true, 0],
        [['a'], false, 1],
        [['a', 'p'], false, 1],
        [['a', 'p', 'p'], false, 1],
        [['a', 'p', 'p', 'l'], false, 1],
        [['a', 'p', 'p', 'l', 'e'], true, 0],
      ],
      [
        [[], false, 3],
        [['g'], false, 2],
        [['g', 'o'], true, 0],
        [['g', 'e'], false, 1],
        [['g', 'e', 't'], true, 0],
        [['b'], false, 1],
        [['b', 'e'], false, 1],
        [['b', 'e', 'a'], false, 1],
        [['b', 'e', 'a', 'r'], true, 0],
        [['a'], false, 1],
        [['a', 'p'], false, 1],
        [['a', 'p', 'p'], false, 1],
        [['a', 'p', 'p', 'l'], false, 1],
        [['a', 'p', 'p', 'l', 'e'], true, 0],
      ],
      [
        [[], false, 2],
        [['g'], false, 2],
        [['g', 'o'], true, 0],
        [['g', 'e'], false, 1],
        [['g', 'e', 't'], true, 0],
        [['a'], false, 1],
        [['a', 'p'], false, 1],
        [['a', 'p', 'p'], false, 1],
        [['a', 'p', 'p', 'l'], false, 1],
        [['a', 'p', 'p', 'l', 'e'], true, 0],
      ],
      [
        [[], false, 2],
        [['g'], false, 1],
        [['g', 'o'], true, 0],
        [['a'], false, 1],
        [['a', 'p'], false, 1],
        [['a', 'p', 'p'], false, 1],
        [['a', 'p', 'p', 'l'], false, 1],
        [['a', 'p', 'p', 'l', 'e'], true, 0],
      ],
      [
        [[], false, 1],
        [['g'], false, 1],
        [['g', 'o'], true, 0],
      ],
      [[[], false, 0]],
    ];

    for (let i = 0; i < expectedStructure.length; i++) {
      deleteWordAndConfirmStructure(
        instance,
        deleteWord,
        WORDS_1[i],
        expectedStructure[i]
      );
    }
  });

  it('Structure validation after each word removal (2)', () => {
    WORDS_2.forEach((word) => expect(addWord(instance, word)).toBe(undefined));

    // Confirm structure before any removal.
    confirmStructure(instance, [
      [[], false, 1],
      [['r'], false, 2],
      [['r', 'o'], false, 1],
      [['r', 'o', 'm'], true, 2],
      [['r', 'o', 'm', 'a'], false, 1],
      [['r', 'o', 'm', 'a', 'n'], false, 2],
      [['r', 'o', 'm', 'a', 'n', 'e'], true, 0],
      [['r', 'o', 'm', 'a', 'n', 'u'], false, 1],
      [['r', 'o', 'm', 'a', 'n', 'u', 's'], true, 0],
      [['r', 'o', 'm', 'u'], false, 1],
      [['r', 'o', 'm', 'u', 'l'], false, 1],
      [['r', 'o', 'm', 'u', 'l', 'u'], false, 1],
      [['r', 'o', 'm', 'u', 'l', 'u', 's'], true, 0],
      [['r', 'u'], false, 1],
      [['r', 'u', 'b'], false, 2],
      [['r', 'u', 'b', 'e'], false, 2],
      [['r', 'u', 'b', 'e', 'n'], false, 1],
      [['r', 'u', 'b', 'e', 'n', 's'], true, 0],
      [['r', 'u', 'b', 'e', 'r'], true, 0],
      [['r', 'u', 'b', 'i'], false, 1],
      [['r', 'u', 'b', 'i', 'c'], false, 2],
      [['r', 'u', 'b', 'i', 'c', 'o'], false, 1],
      [['r', 'u', 'b', 'i', 'c', 'o', 'n'], true, 0],
      [['r', 'u', 'b', 'i', 'c', 'u'], false, 1],
      [['r', 'u', 'b', 'i', 'c', 'u', 'n'], false, 1],
      [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd'], false, 1],
      [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u'], false, 1],
      [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u', 's'], true, 0],
    ]);

    const expectedStructure: [string[], boolean, number][][] = [
      [
        [[], false, 1],
        [['r'], false, 2],
        [['r', 'o'], false, 1],
        [['r', 'o', 'm'], true, 2],
        [['r', 'o', 'm', 'a'], false, 1],
        [['r', 'o', 'm', 'a', 'n'], false, 1],
        [['r', 'o', 'm', 'a', 'n', 'u'], false, 1],
        [['r', 'o', 'm', 'a', 'n', 'u', 's'], true, 0],
        [['r', 'o', 'm', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u', 's'], true, 0],
        [['r', 'u'], false, 1],
        [['r', 'u', 'b'], false, 2],
        [['r', 'u', 'b', 'e'], false, 2],
        [['r', 'u', 'b', 'e', 'n'], false, 1],
        [['r', 'u', 'b', 'e', 'n', 's'], true, 0],
        [['r', 'u', 'b', 'e', 'r'], true, 0],
        [['r', 'u', 'b', 'i'], false, 1],
        [['r', 'u', 'b', 'i', 'c'], false, 2],
        [['r', 'u', 'b', 'i', 'c', 'o'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'o', 'n'], true, 0],
        [['r', 'u', 'b', 'i', 'c', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u', 's'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 2],
        [['r', 'o'], false, 1],
        [['r', 'o', 'm'], true, 1],
        [['r', 'o', 'm', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u'], false, 1],
        [['r', 'o', 'm', 'u', 'l', 'u', 's'], true, 0],
        [['r', 'u'], false, 1],
        [['r', 'u', 'b'], false, 2],
        [['r', 'u', 'b', 'e'], false, 2],
        [['r', 'u', 'b', 'e', 'n'], false, 1],
        [['r', 'u', 'b', 'e', 'n', 's'], true, 0],
        [['r', 'u', 'b', 'e', 'r'], true, 0],
        [['r', 'u', 'b', 'i'], false, 1],
        [['r', 'u', 'b', 'i', 'c'], false, 2],
        [['r', 'u', 'b', 'i', 'c', 'o'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'o', 'n'], true, 0],
        [['r', 'u', 'b', 'i', 'c', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u', 's'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 2],
        [['r', 'o'], false, 1],
        [['r', 'o', 'm'], true, 0],
        [['r', 'u'], false, 1],
        [['r', 'u', 'b'], false, 2],
        [['r', 'u', 'b', 'e'], false, 2],
        [['r', 'u', 'b', 'e', 'n'], false, 1],
        [['r', 'u', 'b', 'e', 'n', 's'], true, 0],
        [['r', 'u', 'b', 'e', 'r'], true, 0],
        [['r', 'u', 'b', 'i'], false, 1],
        [['r', 'u', 'b', 'i', 'c'], false, 2],
        [['r', 'u', 'b', 'i', 'c', 'o'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'o', 'n'], true, 0],
        [['r', 'u', 'b', 'i', 'c', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u', 's'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 1],
        [['r', 'u'], false, 1],
        [['r', 'u', 'b'], false, 2],
        [['r', 'u', 'b', 'e'], false, 2],
        [['r', 'u', 'b', 'e', 'n'], false, 1],
        [['r', 'u', 'b', 'e', 'n', 's'], true, 0],
        [['r', 'u', 'b', 'e', 'r'], true, 0],
        [['r', 'u', 'b', 'i'], false, 1],
        [['r', 'u', 'b', 'i', 'c'], false, 2],
        [['r', 'u', 'b', 'i', 'c', 'o'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'o', 'n'], true, 0],
        [['r', 'u', 'b', 'i', 'c', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u', 's'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 1],
        [['r', 'u'], false, 1],
        [['r', 'u', 'b'], false, 2],
        [['r', 'u', 'b', 'e'], false, 1],
        [['r', 'u', 'b', 'e', 'r'], true, 0],
        [['r', 'u', 'b', 'i'], false, 1],
        [['r', 'u', 'b', 'i', 'c'], false, 2],
        [['r', 'u', 'b', 'i', 'c', 'o'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'o', 'n'], true, 0],
        [['r', 'u', 'b', 'i', 'c', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u', 's'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 1],
        [['r', 'u'], false, 1],
        [['r', 'u', 'b'], false, 1],
        [['r', 'u', 'b', 'i'], false, 1],
        [['r', 'u', 'b', 'i', 'c'], false, 2],
        [['r', 'u', 'b', 'i', 'c', 'o'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'o', 'n'], true, 0],
        [['r', 'u', 'b', 'i', 'c', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u', 's'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 1],
        [['r', 'u'], false, 1],
        [['r', 'u', 'b'], false, 1],
        [['r', 'u', 'b', 'i'], false, 1],
        [['r', 'u', 'b', 'i', 'c'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u'], false, 1],
        [['r', 'u', 'b', 'i', 'c', 'u', 'n', 'd', 'u', 's'], true, 0],
      ],
      [[[], false, 0]],
    ];

    for (let i = 0; i < WORDS_2.length; i++) {
      deleteWordAndConfirmStructure(
        instance,
        deleteWord,
        WORDS_2[i],
        expectedStructure[i]
      );
    }
  });
});

describe('core >> compressed-trie', () => {
  const { clear, create, addWord, deleteWord, size } = compressedTrie;

  const instance = create();

  beforeAll(() => {
    confirmStructure(instance, [[[], false, 0]]);
  });

  afterEach(() => {
    expect(size(instance)).toBe(0);
    expect(instance.root.children.size).toBe(0);
  });

  it('Structure validation after each word addition (1)', () => {
    const expectedStructure: [string[], boolean, number][][] = [
      [
        [[], false, 1],
        [['test'], true, 0],
      ],
      [
        [[], false, 1],
        [['test'], true, 1],
        [['test', 'ing'], true, 0],
      ],
      [
        [[], false, 2],
        [['test'], true, 1],
        [['test', 'ing'], true, 0],
        [['gone'], true, 0],
      ],
      [
        [[], false, 3],
        [['test'], true, 1],
        [['test', 'ing'], true, 0],
        [['gone'], true, 0],
        [['bed'], true, 0],
      ],
      [
        [[], false, 3],
        [['test'], true, 1],
        [['test', 'ing'], true, 0],
        [['gone'], true, 0],
        [['be'], false, 2],
        [['be', 'd'], true, 0],
        [['be', 'ar'], true, 0],
      ],
      [
        [[], false, 3],
        [['test'], true, 1],
        [['test', 'ing'], true, 0],
        [['g'], false, 2],
        [['g', 'one'], true, 0],
        [['g', 'et'], true, 0],
        [['be'], false, 2],
        [['be', 'd'], true, 0],
        [['be', 'ar'], true, 0],
      ],
      [
        [[], false, 4],
        [['test'], true, 1],
        [['test', 'ing'], true, 0],
        [['g'], false, 2],
        [['g', 'one'], true, 0],
        [['g', 'et'], true, 0],
        [['be'], false, 2],
        [['be', 'd'], true, 0],
        [['be', 'ar'], true, 0],
        [['apple'], true, 0],
      ],
      [
        [[], false, 4],
        [['test'], true, 1],
        [['test', 'ing'], true, 0],
        [['g'], false, 2],
        [['g', 'o'], true, 1],
        [['g', 'o', 'ne'], true, 0],
        [['g', 'et'], true, 0],
        [['be'], false, 2],
        [['be', 'd'], true, 0],
        [['be', 'ar'], true, 0],
        [['apple'], true, 0],
      ],
    ];

    for (let i = 0; i < WORDS_1.length; i++) {
      insertWordAndConfirmStructure(
        instance,
        addWord,
        WORDS_1[i],
        expectedStructure[i]
      );
    }

    clear(instance);
  });

  it('Structure validation after each word addition (2)', () => {
    const expectedStructure: [string[], boolean, number][][] = [
      [
        [[], false, 1],
        [['romane'], true, 0],
      ],
      [
        [[], false, 1],
        [['roman'], false, 2],
        [['roman', 'e'], true, 0],
        [['roman', 'us'], true, 0],
      ],
      [
        [[], false, 1],
        [['rom'], false, 2],
        [['rom', 'ulus'], true, 0],
        [['rom', 'an'], false, 2],
        [['rom', 'an', 'e'], true, 0],
        [['rom', 'an', 'us'], true, 0],
      ],
      [
        [[], false, 1],
        [['rom'], true, 2],
        [['rom', 'ulus'], true, 0],
        [['rom', 'an'], false, 2],
        [['rom', 'an', 'e'], true, 0],
        [['rom', 'an', 'us'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 2],
        [['r', 'ubens'], true, 0],
        [['r', 'om'], true, 2],
        [['r', 'om', 'ulus'], true, 0],
        [['r', 'om', 'an'], false, 2],
        [['r', 'om', 'an', 'e'], true, 0],
        [['r', 'om', 'an', 'us'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 2],
        [['r', 'ube'], false, 2],
        [['r', 'ube', 'ns'], true, 0],
        [['r', 'ube', 'r'], true, 0],
        [['r', 'om'], true, 2],
        [['r', 'om', 'ulus'], true, 0],
        [['r', 'om', 'an'], false, 2],
        [['r', 'om', 'an', 'e'], true, 0],
        [['r', 'om', 'an', 'us'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 2],
        [['r', 'ub'], false, 2],
        [['r', 'ub', 'icon'], true, 0],
        [['r', 'ub', 'e'], false, 2],
        [['r', 'ub', 'e', 'ns'], true, 0],
        [['r', 'ub', 'e', 'r'], true, 0],
        [['r', 'om'], true, 2],
        [['r', 'om', 'ulus'], true, 0],
        [['r', 'om', 'an'], false, 2],
        [['r', 'om', 'an', 'e'], true, 0],
        [['r', 'om', 'an', 'us'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 2],
        [['r', 'ub'], false, 2],
        [['r', 'ub', 'ic'], false, 2],
        [['r', 'ub', 'ic', 'on'], true, 0],
        [['r', 'ub', 'ic', 'undus'], true, 0],
        [['r', 'ub', 'e'], false, 2],
        [['r', 'ub', 'e', 'ns'], true, 0],
        [['r', 'ub', 'e', 'r'], true, 0],
        [['r', 'om'], true, 2],
        [['r', 'om', 'ulus'], true, 0],
        [['r', 'om', 'an'], false, 2],
        [['r', 'om', 'an', 'e'], true, 0],
        [['r', 'om', 'an', 'us'], true, 0],
      ],
    ];

    for (let i = 0; i < WORDS_2.length; i++) {
      insertWordAndConfirmStructure(
        instance,
        addWord,
        WORDS_2[i],
        expectedStructure[i]
      );
    }

    clear(instance);
  });

  it('Structure validation after each word removal (1)', () => {
    WORDS_1.forEach((word) => expect(addWord(instance, word)).toBe(undefined));

    // Confirm structure before any removal.
    confirmStructure(instance, [
      [[], false, 4],
      [['test'], true, 1],
      [['test', 'ing'], true, 0],
      [['g'], false, 2],
      [['g', 'o'], true, 1],
      [['g', 'o', 'ne'], true, 0],
      [['g', 'et'], true, 0],
      [['be'], false, 2],
      [['be', 'd'], true, 0],
      [['be', 'ar'], true, 0],
      [['apple'], true, 0],
    ]);

    const expectedStructure: [string[], boolean, number][][] = [
      [
        [[], false, 4],
        [['test'], false, 1],
        [['test', 'ing'], true, 0],
        [['g'], false, 2],
        [['g', 'o'], true, 1],
        [['g', 'o', 'ne'], true, 0],
        [['g', 'et'], true, 0],
        [['be'], false, 2],
        [['be', 'd'], true, 0],
        [['be', 'ar'], true, 0],
        [['apple'], true, 0],
      ],
      [
        [[], false, 3],
        [['g'], false, 2],
        [['g', 'o'], true, 1],
        [['g', 'o', 'ne'], true, 0],
        [['g', 'et'], true, 0],
        [['be'], false, 2],
        [['be', 'd'], true, 0],
        [['be', 'ar'], true, 0],
        [['apple'], true, 0],
      ],
      [
        [[], false, 3],
        [['g'], false, 2],
        [['g', 'o'], true, 0],
        [['g', 'et'], true, 0],
        [['be'], false, 2],
        [['be', 'd'], true, 0],
        [['be', 'ar'], true, 0],
        [['apple'], true, 0],
      ],
      [
        [[], false, 3],
        [['g'], false, 2],
        [['g', 'o'], true, 0],
        [['g', 'et'], true, 0],
        [['bear'], true, 0],
        [['apple'], true, 0],
      ],
      [
        [[], false, 2],
        [['g'], false, 2],
        [['g', 'o'], true, 0],
        [['g', 'et'], true, 0],
        [['apple'], true, 0],
      ],
      [
        [[], false, 2],
        [['go'], true, 0],
        [['apple'], true, 0],
      ],
      [
        [[], false, 1],
        [['go'], true, 0],
      ],
      [[[], false, 0]],
    ];

    for (let i = 0; i < expectedStructure.length; i++) {
      deleteWordAndConfirmStructure(
        instance,
        deleteWord,
        WORDS_1[i],
        expectedStructure[i]
      );
    }
  });

  it('Structure validation after each word removal (2)', () => {
    WORDS_2.forEach((word) => expect(addWord(instance, word)).toBe(undefined));

    // Confirm structure before any removal.
    confirmStructure(instance, [
      [[], false, 1],
      [['r'], false, 2],
      [['r', 'ub'], false, 2],
      [['r', 'ub', 'ic'], false, 2],
      [['r', 'ub', 'ic', 'on'], true, 0],
      [['r', 'ub', 'ic', 'undus'], true, 0],
      [['r', 'ub', 'e'], false, 2],
      [['r', 'ub', 'e', 'ns'], true, 0],
      [['r', 'ub', 'e', 'r'], true, 0],
      [['r', 'om'], true, 2],
      [['r', 'om', 'ulus'], true, 0],
      [['r', 'om', 'an'], false, 2],
      [['r', 'om', 'an', 'e'], true, 0],
      [['r', 'om', 'an', 'us'], true, 0],
    ]);

    const expectedStructure: [string[], boolean, number][][] = [
      [
        [[], false, 1],
        [['r'], false, 2],
        [['r', 'ub'], false, 2],
        [['r', 'ub', 'ic'], false, 2],
        [['r', 'ub', 'ic', 'on'], true, 0],
        [['r', 'ub', 'ic', 'undus'], true, 0],
        [['r', 'ub', 'e'], false, 2],
        [['r', 'ub', 'e', 'ns'], true, 0],
        [['r', 'ub', 'e', 'r'], true, 0],
        [['r', 'om'], true, 2],
        [['r', 'om', 'ulus'], true, 0],
        [['r', 'om', 'anus'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 2],
        [['r', 'ub'], false, 2],
        [['r', 'ub', 'ic'], false, 2],
        [['r', 'ub', 'ic', 'on'], true, 0],
        [['r', 'ub', 'ic', 'undus'], true, 0],
        [['r', 'ub', 'e'], false, 2],
        [['r', 'ub', 'e', 'ns'], true, 0],
        [['r', 'ub', 'e', 'r'], true, 0],
        [['r', 'om'], true, 1],
        [['r', 'om', 'ulus'], true, 0],
      ],
      [
        [[], false, 1],
        [['r'], false, 2],
        [['r', 'ub'], false, 2],
        [['r', 'ub', 'ic'], false, 2],
        [['r', 'ub', 'ic', 'on'], true, 0],
        [['r', 'ub', 'ic', 'undus'], true, 0],
        [['r', 'ub', 'e'], false, 2],
        [['r', 'ub', 'e', 'ns'], true, 0],
        [['r', 'ub', 'e', 'r'], true, 0],
        [['r', 'om'], true, 0],
      ],
      [
        [[], false, 1],
        [['rub'], false, 2],
        [['rub', 'ic'], false, 2],
        [['rub', 'ic', 'on'], true, 0],
        [['rub', 'ic', 'undus'], true, 0],
        [['rub', 'e'], false, 2],
        [['rub', 'e', 'ns'], true, 0],
        [['rub', 'e', 'r'], true, 0],
      ],
      [
        [[], false, 1],
        [['rub'], false, 2],
        [['rub', 'ic'], false, 2],
        [['rub', 'ic', 'on'], true, 0],
        [['rub', 'ic', 'undus'], true, 0],
        [['rub', 'er'], true, 0],
      ],
      [
        [[], false, 1],
        [['rubic'], false, 2],
        [['rubic', 'on'], true, 0],
        [['rubic', 'undus'], true, 0],
      ],
      [
        [[], false, 1],
        [['rubicundus'], true, 0],
      ],
      [[[], false, 0]],
    ];

    for (let i = 0; i < WORDS_2.length; i++) {
      deleteWordAndConfirmStructure(
        instance,
        deleteWord,
        WORDS_2[i],
        expectedStructure[i]
      );
    }
  });
});
