import { create as nodeCreate } from 'abstract-linked-lists/doubly-linked-list/node';
import { ITrieListNode } from '../types';

export function create<N extends ITrieListNode>(
  trieNode: N['trieNode'],
  previous: N['previous'] = null,
  next: N['next'] = null
) {
  const instance = nodeCreate<N>(previous, next);
  instance.trieNode = trieNode;
  return instance;
}
