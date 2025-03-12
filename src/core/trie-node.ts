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
  if (isEndOfWord(instance)) {
    let ret = instance.key;

    for (
      let parent = instance.parent;
      parent && parent.parent;
      parent = parent.parent
    ) {
      ret = `${parent.key}${ret}`;
    }

    return ret;
  }
}

export function childrenWords<N extends ITrieNode>(
  instance: N,
  prefix: string
) {
  const arr = isEndOfWord(instance) ? [[prefix]] : [];

  instance.children.forEach((node, char) =>
    arr.push(childrenWords(node, `${prefix}${char}`))
  );

  return arr.flat();
}
