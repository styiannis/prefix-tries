import {
  IDoublyLinkedList,
  IDoublyLinkedListNode,
} from 'abstract-linked-lists';

/**
 * Interface for a node in the trie's doubly-linked list structure.
 *
 * @template T - The type of trie node (`ITrieNode` or `ITrieMapNode`)
 */
export interface ITrieListNode<T extends ITrieNode | ITrieMapNode = ITrieNode>
  extends IDoublyLinkedListNode {
  trieNode: T;
  next: ITrieListNode<T> | null;
  previous: ITrieListNode<T> | null;
}

/**
 * Interface for a node in a trie structure.
 * Each node represents a character in the stored words.
 */
export interface ITrieNode {
  key: string;
  parent: ITrieNode | null;
  children: Map<string, ITrieNode>;
  listNode: ITrieListNode<ITrieNode> | null;
}

/**
 * Interface for a node in a trie-map structure.
 * Each node represents one or more characters in the stored words.
 * Extends basic trie node functionality to associate values with words.
 *
 * @template V - The type of values stored in the trie-map.
 */
export interface ITrieMapNode<V = unknown> {
  key: string;
  value: V;
  parent: ITrieMapNode<V> | null;
  children: Map<string, ITrieMapNode<V>>;
  listNode: ITrieListNode<ITrieMapNode<V>> | null;
}

/**
 * Interface for the doubly-linked list used in tries.
 * Maintains insertion order of words/entries in the trie.
 *
 * @template T - The type of trie node.
 * @template N - The type of list node.
 */
export type ITrieList<
  T extends ITrieNode | ITrieMapNode = ITrieNode,
  N extends ITrieListNode<T> = ITrieListNode<T>
> = IDoublyLinkedList<N>;

/**
 * Interface for the trie data structure.
 * Combines the trie tree structure with a doubly-linked list for order preservation.
 *
 * @template N - The type of nodes used in the trie.
 */
export interface ITrie<N extends ITrieNode = ITrieNode> {
  root: N;
  list: ITrieList<N>;
}

/**
 * Interface for the trie-map data structure.
 * Combines the trie tree structure with a doubly-linked list for order preservation.
 *
 * @template V - The type of values stored in the trie-map.
 * @template N - The type of nodes used in the trie-map.
 */
export interface ITrieMap<
  V = unknown,
  N extends ITrieMapNode<V> = ITrieMapNode<V>
> {
  root: N;
  list: ITrieList<N>;
}
