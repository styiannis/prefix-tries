import { ITrieMap } from '../types';
import * as compressedTrie from './compressed-trie';
import * as trieMapNode from './trie-map-node';
import * as trieMap from './trie-map';
import * as trieNode from './trie-node';
import {
  commonSubstring,
  compressedTrieMapMergeNode,
  compressedTrieMapSplitNode,
  createListRecord,
  removeListRecord,
  triePrefixNode,
} from './util';

export function create<T extends ITrieMap>() {
  return trieMap.create<T>();
}

export function clear<T extends ITrieMap>(instance: T) {
  return trieMap.clear(instance);
}

export function size<T extends ITrieMap>(instance: T) {
  return instance.list.size;
}

export function setWordValue<T extends ITrieMap>(
  instance: T,
  word: string,
  value: T['root']['value']
) {
  let prefix = word;
  let node = instance.root;
  let iterator = node.children.entries();
  let current = iterator.next();

  let found = false;
  while (!current.done && !found) {
    const [childKey, childNode] = current.value;
    const common = commonSubstring(childKey, prefix);

    if (!common) {
      current = iterator.next();
      continue;
    }

    if (common.length !== childKey.length) {
      compressedTrieMapSplitNode(childNode, common);
    }

    found = common.length === prefix.length;

    if (!found) {
      prefix = prefix.substring(common.length);
      node = childNode;
      iterator = node.children.entries();
      current = iterator.next();
      continue;
    }

    if (common.length !== childKey.length || !trieNode.isEndOfWord(childNode)) {
      createListRecord(instance, childNode);
    }

    childNode.value = value; // Set or update the value.
  }

  if (!found) {
    const newNode = trieMapNode.create<T['root']>(prefix, value, node);
    trieNode.insertChildNode(node, newNode);
    createListRecord(instance, newNode);
  }
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
  const node = triePrefixNode(instance, prefix);
  return node ? trieMapNode.childrenWordsValues(node, prefix) : [];
}

export function includesWord<T extends ITrieMap>(instance: T, word: string) {
  return compressedTrie.includesWord(instance, word);
}

export function deleteWord<T extends ITrieMap>(instance: T, word: string) {
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
    const removedChild = trieNode.removeChild(parent, node.key);

    if (removedChild) {
      trieMapNode.clear(removedChild);
    }

    if (
      parent.parent &&
      1 === parent.children.size &&
      !trieNode.isEndOfWord(parent)
    ) {
      compressedTrieMapMergeNode(parent);
    }

    node = parent;
  }

  return true;
}
