import { ITrieNode } from '../types';

export function create<N extends ITrieNode>(
  key: N['key'],
  parent: N['parent'] = null,
  children: N['children'] = new Map(),
  listNode: N['listNode'] = null
) {
  return { key, parent, children, listNode } as N;
}

export function clear<N extends ITrieNode>(instance: N) {
  instance.parent = null;
  instance.listNode = null;
  instance.children.clear();
}

export function isEndOfWord<N extends ITrieNode>(instance: N) {
  return null !== instance.listNode;
}

export function insertChildNode<N extends ITrieNode>(instance: N, node: N) {
  node.parent = instance;
  instance.children.set(node.key, node);
}

export function removeChild<N extends ITrieNode>(instance: N, key: string) {
  const node = instance.children.get(key);
  return node && instance.children.delete(key) ? (node as N) : undefined;
}

export function word<N extends ITrieNode>(instance: N) {
  if (!isEndOfWord(instance)) {
    return;
  }

  let ret = instance.key;

  for (let parent = instance.parent; parent?.parent; parent = parent.parent) {
    ret = `${parent.key}${ret}`;
  }

  return ret;
}

/**
 * Returns an iterator of all words in the trie that start with the given prefix.
 *
 * Traverses the trie from the given node, yielding each complete word found.
 * Words are yielded in ascending order of their length (shorter words first), not in lexicographical order.
 *
 * @typeParam N - The trie node type.
 * @param instance - The trie node to start traversal from (typically the node matching the prefix).
 * @param prefix - The prefix to match; all yielded words will start with this prefix.
 * @returns An iterator yielding each matching word as a string.
 *
 * @example
 * ```typescript
 * // Yields: "cat", "cats", "catnip" for prefix "cat"
 * for (const word of childrenWords(node, "cat")) {
 *   console.log(word);
 * }
 * ```
 */
export function* childrenWords<N extends ITrieNode>(
  instance: N,
  prefix: string
) {
  const stack: [N, string][] = [[instance, prefix]]; // @todo: It also returns node's word, not only chhildren's.

  while (stack.length > 0) {
    const [node, str] = stack.shift()!;

    if (isEndOfWord(node)) {
      yield str;
    }

    node.children.forEach((childNode, char) =>
      stack.push([childNode as N, `${str}${char}`])
    );
  }
}
