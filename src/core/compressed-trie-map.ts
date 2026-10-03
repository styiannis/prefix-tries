import { ITrieMap } from '../types';
import { clear as clearTrieMap, create as createTrieMap } from './trie-map';
import * as trieMapNode from './trie-map-node';
import * as trieNode from './trie-node';
import {
  commonSubstring,
  compressedTrieMapMergeNode,
  compressedTrieMapSplitNode,
  compressedTriePrefixEntriesNode,
  compressedTriePrefixNode,
  createListRecord,
  removeListRecord,
} from './util';

export function create<T extends ITrieMap>() {
  return createTrieMap<T>();
}

export function clear<T extends ITrieMap>(instance: T) {
  return clearTrieMap(instance);
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

    if (common !== childKey) {
      compressedTrieMapSplitNode(childNode, common);
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

    childNode.value = value; // Set or update the value.
  }

  if (!found) {
    const newNode = trieMapNode.create<T['root']>(prefix, value, node);
    trieNode.insertChild(node, newNode);
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
  const ret: [string, T['root']['value']][] = [];
  const node = compressedTriePrefixEntriesNode(instance, prefix);

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

export function deleteWord<T extends ITrieMap>(instance: T, word: string) {
  let node = compressedTriePrefixNode(instance, word);

  if (!node || !trieNode.isEndOfWord(node)) {
    return false;
  }

  removeListRecord(instance, node);

  while (node.parent && !trieNode.isEndOfWord(node)) {
    const parent = node.parent as T['root'];

    if (node.children.size === 0) {
      const removedNode = trieNode.removeChild(parent, node.key);

      // @todo: It's known that the condition is always true
      if (removedNode) {
        trieMapNode.clear(removedNode);
      }

      node = parent;

      continue;
    }

    if (node.children.size === 1) {
      compressedTrieMapMergeNode(node);
    }

    break;
  }

  return true;
}
