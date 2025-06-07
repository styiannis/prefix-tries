import { ITrieMap } from '../types';
import * as compressedTrie from './compressed-trie';
import * as trieMapNode from './trie-map-node';
import * as trieMap from './trie-map';
import * as trieNode from './trie-node';
import {
  commonSubstring,
  createListRecord,
  compressedTrieMapMergeNode,
  compressedTrieMapSplitNode,
  compressedTriePrefixNode,
  removeListRecord,
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
            childNode.value = value; // Set or update the value.
          } else {
            const updatedChildNode = compressedTrieMapSplitNode(
              childNode,
              common
            );
            updatedChildNode.value = value;
            createListRecord(instance, updatedChildNode);
          }

          ok = true;
        } else {
          if (common.length !== childKey.length) {
            compressedTrieMapSplitNode(childNode, common);
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
    const newNode = trieMapNode.create<T['root']>(prefix, value, node);
    trieNode.insertChildNode(node, newNode);
    createListRecord(instance, newNode);
  }
}

export function getWordValue<T extends ITrieMap>(instance: T, word: string) {
  const node = compressedTriePrefixNode(instance, word);
  return node && trieNode.isEndOfWord(node)
    ? (node.value as T['root']['value'])
    : undefined;
}

export function getPrefixEntries<T extends ITrieMap>(
  instance: T,
  prefix: string
) {
  const node = compressedTriePrefixNode(instance, prefix);
  return node ? trieMapNode.childrenWordsValues(node, prefix) : [];
}

export function includesWord<T extends ITrieMap>(instance: T, word: string) {
  return compressedTrie.includesWord(instance, word);
}

export function deleteWord<T extends ITrieMap>(instance: T, word: string) {
  let node = compressedTriePrefixNode(instance, word);

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
