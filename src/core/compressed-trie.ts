import { ITrie } from '../types';
import { clear as clearTrie, create as createTrie } from './trie';
import * as trieNode from './trie-node';
import {
  commonSubstring,
  compressedTrieMergeNode,
  compressedTriePrefixEntriesNode,
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

    if (common !== childKey) {
      compressedTrieSplitNode(childNode, common);
    }

    found = common === prefix;

    if (!found) {
      prefix = prefix.substring(common.length);
      node = childNode;
      iterator = node.children.entries();
      current = iterator.next();
      continue;
    }

    if (common !== childKey || !trieNode.isEndOfWord(childNode)) {
      createListRecord(instance, childNode);
    }
  }

  if (!found) {
    const newNode = trieNode.create<T['root']>(prefix, node);
    trieNode.insertChild(node, newNode);
    createListRecord(instance, newNode);
  }
}

export function getPrefixEntries<T extends ITrie>(instance: T, prefix: string) {
  const ret: string[] = [];
  const node = compressedTriePrefixEntriesNode(instance, prefix);

  if (!node) {
    return ret;
  }

  const w = trieNode.word(node);

  if (w) {
    ret.push(w);
  }

  ret.push(
    ...trieNode.childrenWords(
      node,
      `${trieNode.parentsPrefix(node)}${node.key}`
    )
  );

  return ret;
}

export function deleteWord<T extends ITrie>(instance: T, word: string) {
  let node = triePrefixNode(instance, word);

  if (!node || !trieNode.isEndOfWord(node)) {
    return false;
  }

  removeListRecord(instance, node);

  for (
    let nd = node, parent = nd.parent;
    parent && nd.children.size === 0 && !trieNode.isEndOfWord(nd);
    nd = parent, parent = nd.parent
  ) {
    const removedNode = trieNode.removeChild(parent, nd.key);

    // @todo: It's known that the condition is always true
    if (removedNode) {
      trieNode.clear(removedNode);
    }

    if (
      parent.parent &&
      parent.children.size === 1 &&
      !trieNode.isEndOfWord(parent)
    ) {
      compressedTrieMergeNode(parent);
    }
  }

  return true;
}
