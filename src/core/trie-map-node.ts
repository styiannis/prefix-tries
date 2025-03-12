import { ITrieMapNode } from '../types';
import {
  clear as clearTrieNode,
  create as createTrieNode,
  isEndOfWord,
} from './trie-node';

export function create<N extends ITrieMapNode>(
  key: N['key'],
  value: N['value'],
  parent: N['parent'] = null,
  children: N['children'] = new Map(),
  listNode: N['listNode'] = null
) {
  const instance = createTrieNode<N>(key, parent, children, listNode);
  instance.value = value;
  return instance;
}

export function clear<N extends ITrieMapNode>(instance: N) {
  instance.value = undefined;
  return clearTrieNode(instance);
}

export function childrenWordsValues<N extends ITrieMapNode>(
  instance: N,
  prefix: string
) {
  const ret: [string, N['value']][] = isEndOfWord(instance)
    ? [[prefix, instance.value]]
    : [];

  instance.children.forEach((node, char) =>
    childrenWordsValues(node, `${prefix}${char}`).forEach((entry) =>
      ret.push(entry)
    )
  );

  return ret;
}
