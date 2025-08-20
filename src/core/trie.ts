import {
  inOrder,
  inReverseOrder,
} from 'abstract-linked-lists/doubly-linked-list/iterators';
import { ITrie, ITrieList } from '../types';
import * as list from './trie-list';
import * as trieNode from './trie-node';
import { createListRecord, removeListRecord, triePrefixNode } from './util';

export function create<T extends ITrie>() {
  return {
    list: list.create<ITrieList<T['root']>>(),
    root: trieNode.create<T['root']>('__ROOT__'),
  } as T;
}

export function clear<T extends ITrie>(instance: T) {
  list.clear(instance.list);
  trieNode.clear(instance.root);
}

export function size<T extends ITrie>(instance: T) {
  return instance.list.size;
}

export function addWord<T extends ITrie>(instance: T, word: string) {
  let parent = instance.root;

  for (const char of word) {
    let node = parent.children.get(char);

    if (!node) {
      node = trieNode.create<T['root']>(char, parent);
      trieNode.insertChildNode(parent, node);
    }

    parent = node;
  }

  if (!trieNode.isEndOfWord(parent)) {
    createListRecord(instance, parent);
  }
}

export function getPrefixEntries<T extends ITrie>(instance: T, prefix: string) {
  const node = triePrefixNode(instance, prefix);
  return node ? trieNode.childrenWords(node, prefix) : [];
}

export function includesWord<T extends ITrie>(instance: T, word: string) {
  const node = triePrefixNode(instance, word);
  return !!node && trieNode.isEndOfWord(node);
}

export function deleteWord<T extends ITrie>(instance: T, word: string) {
  let node = triePrefixNode(instance, word);

  if (!node || !trieNode.isEndOfWord(node)) {
    return false;
  }

  removeListRecord(instance, node);

  while (
    node &&
    node.parent &&
    0 === node.children.size &&
    !trieNode.isEndOfWord(node)
  ) {
    const parent = node.parent as T['root'];
    const removedNode = trieNode.removeChild(parent, node.key);

    if (removedNode) {
      trieNode.clear(removedNode);
    }

    node = parent;
  }

  return true;
}

export function* entries<T extends ITrie>(instance: T, reversed = false) {
  const listIterator = reversed
    ? inReverseOrder(instance.list.tail)
    : inOrder(instance.list.head);

  for (const listNode of listIterator) {
    const w = trieNode.word(listNode.trieNode);
    if (w) {
      yield w;
    }
  }
}
