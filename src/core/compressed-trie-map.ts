import { ITrieMap } from '../types';
import { clear as clearTrieMap, create as createTrieMap } from './trie-map';
import * as trieMapNode from './trie-map-node';
import * as trieNode from './trie-node';
import {
  commonSubstring,
  compressedTrieMapMergeNode,
  compressedTrieMapSplitNode,
  compressedTriePrefixEntriesNode,
  createListRecord,
  removeListRecord,
  triePrefixNode,
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
  let node = triePrefixNode(instance, word);

  if (!node || !trieNode.isEndOfWord(node)) {
    return false;
  }

  removeListRecord(instance, node);

  while (
    node.parent &&
    node.children.size === 0 &&
    !trieNode.isEndOfWord(node)
  ) {
    const parent = node.parent as T['root'];
    const removedNode = trieNode.removeChild(parent, node.key);

    if (removedNode) {
      trieMapNode.clear(removedNode);
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
