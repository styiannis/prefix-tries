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

export function insertChild<N extends ITrieNode>(instance: N, node: N) {
  node.parent = instance;
  instance.children.set(node.key, node);
}

export function removeChild<N extends ITrieNode>(instance: N, key: string) {
  const node = instance.children.get(key) as N | undefined;
  return node && instance.children.delete(key) ? node : undefined;
}

export function parentsPrefix<N extends ITrieNode>(instance: N) {
  let prefix = '';

  for (let nd = instance.parent; nd?.parent; nd = nd.parent) {
    prefix = `${nd.key}${prefix}`;
  }

  return prefix;
}

export function word<N extends ITrieNode>(instance: N) {
  return isEndOfWord(instance)
    ? `${parentsPrefix(instance)}${instance.key}`
    : undefined;
}

/**
 * Returns an iterator of all words in the trie that start with the given prefix.
 *
 * Traverses the trie from the given node, yielding each complete word found.
 *
 * @typeParam N - The trie node type.
 * @param instance - The trie node to start traversal from (typically the node matching the prefix).
 * @param prefix - The prefix to match; all yielded words will start with this prefix.
 * @returns An iterator yielding each matching word as a string.
 */
export function* childrenWords<N extends ITrieNode>(
  instance: N,
  prefix: string
) {
  for (const [childKey, child] of instance.children) {
    const stack: [N, string][] = [[child as N, `${prefix}${childKey}`]];

    while (stack.length > 0) {
      const [node, str] = stack.shift()!;

      if (isEndOfWord(node)) {
        yield str;
      }

      node.children.forEach((n, c) => stack.push([n as N, `${str}${c}`]));
    }
  }
}
