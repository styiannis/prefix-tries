import {
  clear as listClear,
  create as listCreate,
  pushNode as listPushNode,
  removeNode as listRemoveNode,
} from 'abstract-linked-lists/doubly-linked-list/list';
import { ITrieList } from '../types';

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
  return listRemoveNode(instance, node);
}
