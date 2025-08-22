import { ITrieMapNode } from '../types';
import {
  clear as clearTrieNode,
  create as createTrieNode,
  isEndOfWord,
} from './trie-node';

export function create<N extends ITrieMapNode>(
  key: N['key'],
  value: N['value'],
  parent: N['parent'] = null,
  children: N['children'] = new Map(),
  listNode: N['listNode'] = null
) {
  const instance = createTrieNode<N>(key, parent, children, listNode);
  instance.value = value;
  return instance;
}

export function clear<N extends ITrieMapNode>(instance: N) {
  instance.value = undefined;
  return clearTrieNode(instance);
}

/**
 * Returns an iterator of word-value pairs for all words in the trie that start with the specified prefix.
 *
 * Traverses the trie from the given node, yielding each complete word and its associated value.
 * Pairs are yielded in order of increasing word length (shortest first), not in lexicographical order.
 *
 * @typeParam N - The trie map node type.
 * @param instance - The trie map node to start traversal from (typically the node matching the prefix).
 * @param prefix - The prefix to match; all yielded words will start with this prefix.
 * @returns An iterator yielding each matching word and its value as a tuple: [word, value].
 *
 * @example
 * ```typescript
 * // Yields: ["cat", 1], ["cats", 2], ["catnip", 3] for prefix "cat"
 * for (const [word, value] of childrenWordsValues(node, "cat")) {
 *   console.log(word, value);
 * }
 * ```
 */
export function* childrenWordsValues<N extends ITrieMapNode>(
  instance: N,
  prefix: string
) {
  const stack: [N, string][] = [[instance, prefix]]; // @todo: It also returns node's word-value, not only chhildren's.

  while (stack.length > 0) {
    const [node, str] = stack.shift()!;

    if (isEndOfWord(node)) {
      yield [str, node.value] as [string, N['value']];
    }

    node.children.forEach((childNode, char) =>
      stack.push([childNode as N, `${str}${char}`])
    );
  }
}
