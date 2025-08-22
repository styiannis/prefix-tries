import { ITrieMapNode } from '../types';
import {
  clear as clearTrieNode,
  create as createTrieNode,
  isEndOfWord,
  parentsPrefix,
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

export function wordValuePair<N extends ITrieMapNode>(instance: N) {
  return isEndOfWord(instance)
    ? ([`${parentsPrefix(instance)}${instance.key}`, instance.value] as [
        string,
        N['value']
      ])
    : undefined;
}

/**
 * Returns an iterator of word-value pairs for all words in the trie that start with the specified prefix.
 *
 * Traverses the trie from the given node, yielding each complete word and its associated value.
 *
 * @typeParam N - The trie map node type.
 * @param instance - The trie map node to start traversal from (typically the node matching the prefix).
 * @param prefix - The prefix to match; all yielded words will start with this prefix.
 * @returns An iterator yielding each matching word and its value as a tuple: [word, value].
 */
export function* childrenWordValuePairs<N extends ITrieMapNode>(
  instance: N,
  prefix: string
) {
  for (const [childKey, child] of instance.children) {
    const stack: [N, string][] = [[child as N, `${prefix}${childKey}`]];

    while (stack.length > 0) {
      const [node, str] = stack.shift()!;

      if (isEndOfWord(node)) {
        yield [str, node.value] as [string, N['value']];
      }

      node.children.forEach((n, c) => stack.push([n as N, `${str}${c}`]));
    }
  }
}
