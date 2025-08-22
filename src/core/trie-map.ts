import {
  inOrder,
  inReverseOrder,
} from 'abstract-linked-lists/doubly-linked-list/iterators';
import { ITrieList, ITrieMap } from '../types';
import * as list from './trie-list';
import * as trieMapNode from './trie-map-node';
import * as trieNode from './trie-node';
import { createListRecord, triePrefixNode } from './util';

export function create<T extends ITrieMap>() {
  return {
    list: list.create<ITrieList<T['root']>>(),
    root: trieMapNode.create<T['root']>('__ROOT__', undefined),
  } as T;
}

export function clear<T extends ITrieMap>(instance: T) {
  list.clear(instance.list);
  trieMapNode.clear(instance.root);
}

export function size<T extends ITrieMap>(instance: T) {
  return instance.list.size;
}

export function setWordValue<T extends ITrieMap>(
  instance: T,
  word: string,
  value: T['root']['value']
) {
  let parent = instance.root;

  for (const char of word) {
    let node = parent.children.get(char);

    if (!node) {
      node = trieMapNode.create<T['root']>(char, undefined, parent);
      trieNode.insertChild(parent, node);
    }

    parent = node;
  }

  if (!trieNode.isEndOfWord(parent)) {
    createListRecord(instance, parent);
  }

  parent.value = value; // Set or update the value.
}

export function getWordValue<T extends ITrieMap>(instance: T, word: string) {
  const node = triePrefixNode(instance, word);

  return node && trieNode.isEndOfWord(node)
    ? (node.value as T['root']['value'])
    : undefined;
}

export function getPrefixEntries<T extends ITrieMap>(
  instance: T,
  prefix: string
) {
  const ret: [string, T['root']['value']][] = [];
  const node = triePrefixNode(instance, prefix);

  if (!node) {
    return ret;
  }

  const wv = trieMapNode.wordValuePair(node);

  if (wv) {
    ret.push(wv);
  }

  ret.push(
    ...trieMapNode.childrenWordValuePairs(
      node,
      `${trieNode.parentsPrefix(node)}${node.key}`
    )
  );

  return ret;
}

export function* entries<T extends ITrieMap>(instance: T, reversed = false) {
  const iterator = reversed
    ? inReverseOrder(instance.list.tail)
    : inOrder(instance.list.head);

  for (const node of iterator) {
    const w = trieNode.word(node.trieNode);
    if (w) {
      yield [w, node.trieNode.value] as [string, T['root']['value']];
    }
  }
}

export function* values<T extends ITrieMap>(instance: T, reversed = false) {
  const iterator = reversed
    ? inReverseOrder(instance.list.tail)
    : inOrder(instance.list.head);

  for (const node of iterator) {
    yield node.trieNode.value as T['root']['value'];
  }
}
