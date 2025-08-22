import { ITrie } from '../types';
import { clear as clearTrie, create as createTrie } from './trie';
import * as trieNode from './trie-node';
import {
  commonSubstring,
  compressedTrieMergeNode,
  compressedTriePrefixNode,
  compressedTrieSplitNode,
  createListRecord,
  removeListRecord,
  triePrefixNode,
} from './util';

export function create<T extends ITrie>() {
  return createTrie<T>();
}

export function clear<T extends ITrie>(instance: T) {
  return clearTrie(instance);
}

export function size<T extends ITrie>(instance: T) {
  return instance.list.size;
}

export function addWord<T extends ITrie>(instance: T, word: string) {
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
      compressedTrieSplitNode(childNode, common);
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
  }

  if (!found) {
    const newNode = trieNode.create<T['root']>(prefix, node);
    trieNode.insertChildNode(node, newNode);
    createListRecord(instance, newNode);
  }
}

export function getPrefixEntries<T extends ITrie>(instance: T, prefix: string) {
  return compressedTriePrefixNode(instance, prefix); // @todo: Continue here
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
    const removedChild = trieNode.removeChild(parent, node.key);

    if (removedChild) {
      trieNode.clear(removedChild);
    }

    if (
      parent.parent &&
      1 === parent.children.size &&
      !trieNode.isEndOfWord(parent)
    ) {
      compressedTrieMergeNode(parent);
    }

    node = parent;
  }

  return true;
}
