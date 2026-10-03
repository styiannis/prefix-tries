import { ITrie, ITrieMapNode, ITrieNode } from '../types';
import * as list from './trie-list';
import * as listNode from './trie-list-node';
import * as trieMapNode from './trie-map-node';
import * as trieNode from './trie-node';

function isHighSurrogate(str: string, index: number) {
  const code = str.charCodeAt(index);
  return code >= 0xd800 && code <= 0xdbff;
}

function isLowSurrogate(str: string, index: number) {
  const code = str.charCodeAt(index);
  return code >= 0xdc00 && code <= 0xdfff;
}

export function commonSubstring(a: string, b: string) {
  let index = -1;
  for (let i = 0; i < Math.min(a.length, b.length) && a[i] === b[i]; i++) {
    index = i;
  }

  if (index === -1) {
    return '';
  }

  // A character such as an emoji is stored as two code units (a surrogate
  // pair). Never end the prefix between them, so it always ends on a whole
  // character.
  if (
    isHighSurrogate(a, index) &&
    (isLowSurrogate(a, index + 1) || isLowSurrogate(b, index + 1))
  ) {
    return a.substring(0, index);
  }

  return a.substring(0, index + 1);
}

export function createListRecord<T extends ITrie>(
  instance: T,
  trieNode: T['root']
) {
  const newListNode = listNode.create<NonNullable<T['list']['head']>>(trieNode);
  list.pushNode(instance.list, newListNode);
  trieNode.listNode = newListNode;
}

export function removeListRecord<T extends ITrie>(
  instance: T,
  trieNode: T['root']
) {
  // @todo: It's known that the condition is always true
  if (trieNode.listNode) {
    list.removeNode(instance.list, trieNode.listNode);
    trieNode.listNode = null;
  }
}

export function triePrefixNode<T extends ITrie>(instance: T, prefix: string) {
  if (!prefix) {
    return;
  }

  let prefixNode: T['root'] | undefined = instance.root;

  for (const char of prefix) {
    prefixNode = prefixNode.children.get(char);

    if (!prefixNode) {
      return;
    }
  }

  return prefixNode;
}

export function compressedTriePrefixNode<T extends ITrie>(
  instance: T,
  prefix: string
) {
  let prefixNode: T['root'] | undefined = undefined;

  let str = prefix;
  let iterator = instance.root.children.values();
  let current = iterator.next();

  while (!current.done) {
    const node = current.value;

    if (str === node.key) {
      prefixNode = node;
      break;
    }

    const common = commonSubstring(node.key, str);

    if (common === node.key) {
      str = str.substring(common.length);
      iterator = node.children.values();
    }

    current = iterator.next();
  }

  return prefixNode;
}

export function compressedTriePrefixEntriesNode<T extends ITrie>(
  instance: T,
  prefix: string
) {
  let prefixNode: T['root'] | undefined = undefined;

  let str = prefix;
  let iterator = instance.root.children.values();
  let current = iterator.next();

  while (!current.done && !prefixNode) {
    const node = current.value;
    const common = commonSubstring(node.key, str);

    if (!common) {
      current = iterator.next();
      continue;
    }

    if (common === node.key && str !== node.key) {
      str = str.substring(common.length);
      iterator = node.children.values();
      current = iterator.next();
      continue;
    }

    if (common === str) {
      prefixNode = node;
    }

    break;
  }

  return prefixNode;
}

export function compressedTrieMergeNode<N extends ITrieNode>(instance: N) {
  const parent = instance.parent as N | null;

  if (!parent || instance.children.size !== 1) {
    return instance;
  }

  const [childKey, child] = instance.children.entries().next().value as [
    string,
    N,
  ];

  trieNode.removeChild(parent, instance.key);
  child.key = `${instance.key}${childKey}`;
  trieNode.insertChild(parent, child);

  trieNode.clear(instance);

  return child;
}

export function compressedTrieMapMergeNode<N extends ITrieMapNode>(
  instance: N
) {
  const parent = instance.parent as N | null;

  if (!parent || instance.children.size !== 1) {
    return instance;
  }

  const [childKey, child] = instance.children.entries().next().value as [
    string,
    N,
  ];

  trieNode.removeChild(parent, instance.key);
  child.key = `${instance.key}${childKey}`;
  trieNode.insertChild(parent, child);

  trieMapNode.clear(instance);

  return child;
}

export function compressedTrieSplitNode<N extends ITrieNode>(
  instance: N,
  splitPrefix: string
) {
  const parent = instance.parent as N;
  const prefixNode = trieNode.create<N>(splitPrefix);

  trieNode.removeChild(parent, instance.key);

  instance.key = instance.key.substring(splitPrefix.length);

  trieNode.insertChild(parent, prefixNode);
  trieNode.insertChild(prefixNode, instance);

  return prefixNode;
}

export function compressedTrieMapSplitNode<N extends ITrieMapNode>(
  instance: N,
  splitPrefix: string
) {
  const parent = instance.parent as N;
  const prefixNode = trieMapNode.create<N>(splitPrefix, undefined);

  trieNode.removeChild(parent, instance.key);

  instance.key = instance.key.substring(splitPrefix.length);

  trieNode.insertChild(parent, prefixNode);
  trieNode.insertChild(prefixNode, instance);

  return prefixNode;
}
