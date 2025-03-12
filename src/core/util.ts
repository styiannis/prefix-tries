import { ITrie } from '../types';
import * as list from './trie-list';
import * as listNode from './trie-list-node';

export function commonSubstring(a: string, b: string) {
  let index = -1;
  for (let i = 0; i < Math.min(a.length, b.length) && a[i] === b[i]; i++) {
    index = i;
  }
  return -1 === index ? '' : a.substring(0, index + 1);
}

export function createListRecord<T extends ITrie>(
  instance: T,
  trieNode: T['root']
) {
  const newListNode = listNode.create<NonNullable<T['list']['head']>>(trieNode);
  list.pushNode(instance.list, newListNode);
  trieNode.listNode = newListNode;
}

export function removeListRecord<T extends ITrie>(
  instance: T,
  trieNode: T['root']
) {
  if (trieNode.listNode) {
    list.removeNode(instance.list, trieNode.listNode);
    trieNode.listNode = null;
  }
}

export function triePrefixNodes<T extends ITrie>(instance: T, prefix: string) {
  let prefixNode: T['root'] | undefined = undefined;

  let str = prefix;
  let found = false;

  let iter = instance.root.children.values();
  let current = iter.next();

  while (!current.done && !found) {
    while (!current.done) {
      const node = current.value;
      const common = commonSubstring(node.key, str);

      if (common) {
        if (common.length === node.key.length) {
          if (node.key.length === str.length) {
            prefixNode = node;
            found = true;
          } else {
            str = str.substring(common.length);
            iter = node.children.values();
            current = iter.next();
          }
          break;
        }
      }

      current = iter.next();
    }
  }

  return prefixNode;
}
