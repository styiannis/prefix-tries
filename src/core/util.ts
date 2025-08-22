import { ITrie, ITrieMapNode, ITrieNode } from '../types';
import * as list from './trie-list';
import * as listNode from './trie-list-node';
import * as trieMapNode from './trie-map-node';
import * as trieNode from './trie-node';

export function commonSubstring(a: string, b: string) {
  let index = -1;
  for (let i = 0; i < Math.min(a.length, b.length) && a[i] === b[i]; i++) {
    index = i;
  }
  return -1 === index ? '' : a.substring(0, index + 1);
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
  if (trieNode.listNode) {
    list.removeNode(instance.list, trieNode.listNode);
    trieNode.listNode = null;
  }
}

export function triePrefixNode<T extends ITrie>(instance: T, prefix: string) {
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
      continue;
    }

    prefixNode = node;
  }

  return prefixNode;
}

export function compressedTrieMergeNode<N extends ITrieNode>(instance: N) {
  if (1 === instance.children.size) {
    const child = instance.children.entries().next().value;

    if (child) {
      const [childKey, childNode] = child;

      const key = instance.key;
      const parent = instance.parent;

      instance.key = `${key}${childKey}`;
      instance.children = childNode.children;
      instance.children.forEach((n) => (n.parent = instance));
      instance.listNode = childNode.listNode;

      if (instance.listNode) {
        instance.listNode.trieNode = instance;
      }

      trieNode.removeChild(instance, childKey);

      childNode.parent = null;
      childNode.listNode = null;

      if (parent) {
        parent.children.delete(key);
        trieNode.insertChild(parent, instance);
      }
    }
  }

  return instance;
}

export function compressedTrieMapMergeNode<N extends ITrieMapNode>(
  instance: N
) {
  if (1 === instance.children.size) {
    const child = instance.children.entries().next().value;

    if (child) {
      const [childKey, childNode] = child;

      const key = instance.key;
      const parent = instance.parent;

      instance.key = `${key}${childKey}`;
      instance.value = childNode.value;
      instance.children = childNode.children;
      instance.children.forEach((n) => (n.parent = instance));
      instance.listNode = childNode.listNode;

      if (instance.listNode) {
        instance.listNode.trieNode = instance;
      }

      trieNode.removeChild(instance, childKey);

      childNode.parent = null;
      childNode.listNode = null;

      if (parent) {
        parent.children.delete(key);
        trieNode.insertChild(parent, instance);
      }
    }
  }

  return instance;
}

export function compressedTrieSplitNode<N extends ITrieNode>(
  instance: N,
  splitPrefix: string
) {
  const newNode = trieNode.create(
    instance.key.substring(splitPrefix.length),
    instance,
    instance.children,
    instance.listNode
  );

  newNode.children.forEach((n) => (n.parent = newNode));

  if (newNode.listNode) {
    newNode.listNode.trieNode = newNode;
  }

  if (instance.parent) {
    trieNode.removeChild(instance.parent, instance.key);
    instance.key = splitPrefix;
    trieNode.insertChild(instance.parent, instance);
  }

  instance.listNode = null;
  instance.children = new Map();

  trieNode.insertChild(instance, newNode);
}

export function compressedTrieMapSplitNode<N extends ITrieMapNode>(
  instance: N,
  splitPrefix: string
) {
  const newNode = trieMapNode.create(
    instance.key.substring(splitPrefix.length),
    instance.value,
    instance,
    instance.children,
    instance.listNode
  );

  newNode.children.forEach((n) => (n.parent = newNode));

  if (newNode.listNode) {
    newNode.listNode.trieNode = newNode;
  }

  if (instance.parent) {
    trieNode.removeChild(instance.parent, instance.key);
    instance.key = splitPrefix;
    trieNode.insertChild(instance.parent, instance);
  }

  instance.listNode = null;
  instance.children = new Map();

  trieNode.insertChild(instance, newNode);
}
