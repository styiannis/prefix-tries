import { ITrie } from '../types';
import { clear as clearTrie, create as createTrie } from './trie';
import * as trieNode from './trie-node';
import {
  commonSubstring,
  createListRecord,
  compressedTriePrefixNodes,
  compressedTrieMergeNode,
  compressedTrieSplitNode,
  removeListRecord,
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
  let iter = node.children.entries();

  let current = iter.next();
  let ok = false;
  while (!current.done && !ok) {
    while (!current.done) {
      const [childKey, childNode] = current.value;
      const common = commonSubstring(childKey, prefix);

      if (common) {
        if (common.length === prefix.length) {
          if (common.length === childKey.length) {
            if (!trieNode.isEndOfWord(childNode)) {
              createListRecord(instance, childNode);
            }
          } else {
            compressedTrieSplitNode(childNode, common);
            createListRecord(instance, childNode);
          }

          ok = true;
        } else {
          if (common.length !== childKey.length) {
            compressedTrieSplitNode(childNode, common);
          }

          prefix = prefix.substring(common.length);
          node = childNode;
          iter = node.children.entries();
          current = iter.next();
        }

        break;
      }

      current = iter.next();
    }
  }

  if (!ok) {
    const newNode = trieNode.create<T['root']>(prefix, node);
    trieNode.insertChildNode(node, newNode);
    createListRecord(instance, newNode);
  }
}

export function getPrefixEntries<T extends ITrie>(instance: T, prefix: string) {
  const node = compressedTriePrefixNodes(instance, prefix);
  return node ? trieNode.childrenWords(node, prefix) : [];
}

export function includesWord<T extends ITrie>(instance: T, word: string) {
  const node = compressedTriePrefixNodes(instance, word);
  return !!node && trieNode.isEndOfWord(node);
}

export function deleteWord<T extends ITrie>(instance: T, word: string) {
  let node = compressedTriePrefixNodes(instance, word);

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
