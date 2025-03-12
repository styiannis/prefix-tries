import {
  clear as listClear,
  create as listCreate,
  pushNode as listPushNode,
} from 'abstract-linked-lists/doubly-linked-list/list';
import { ITrieList } from '../types';
import { detach } from './trie-list-node';

export function create<L extends ITrieList>() {
  return listCreate<L>();
}

export function clear<L extends ITrieList>(instance: L) {
  return listClear(instance);
}

export function pushNode<L extends ITrieList>(
  instance: L,
  node: NonNullable<L['head']>
) {
  return listPushNode(instance, node);
}

export function removeNode<L extends ITrieList>(
  instance: L,
  node: NonNullable<L['head']>
) {
  if (node === instance.head) {
    instance.head = node.next;
  }

  if (node === instance.tail) {
    instance.tail = node.previous;
  }

  detach(node);
  instance.size--;

  return node;
}
