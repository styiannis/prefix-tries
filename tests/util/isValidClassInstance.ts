import {
  AbstractTrie,
  AbstractTrieMap,
  CompressedTrie,
  CompressedTrieMap,
  Trie,
  TrieMap,
} from '../../src';
import { arraysEqual } from './arraysEqual';

export function isValidClassInstance(
  instance: unknown,
  instanceType: 'Trie' | 'CompressedTrie' | 'TrieMap' | 'CompressedTrieMap'
) {
  if ('object' !== typeof instance) {
    return false;
  }

  // Own property names (sorted)
  const props = Object.getOwnPropertyNames(instance).sort();

  // Prototype property names (sorted)
  const protoProps = Object.getOwnPropertyNames(
    Object.getPrototypeOf(instance)
  ).sort();

  if ('Trie' === instanceType || 'CompressedTrie' === instanceType) {
    if (
      !arraysEqual(props, []) ||
      !arraysEqual(protoProps, [
        'add',
        'clear',
        'constructor',
        'delete',
        'entries',
        'find',
        'forEach',
        'has',
        'size',
      ])
    ) {
      return false;
    }

    if ('Trie' === instanceType) {
      return (
        instance instanceof Trie &&
        instance instanceof AbstractTrie &&
        Object.getPrototypeOf(instance) === Trie.prototype &&
        Object.getPrototypeOf(instance) !== AbstractTrie.prototype
      );
    }

    return (
      instance instanceof CompressedTrie &&
      instance instanceof AbstractTrie &&
      Object.getPrototypeOf(instance) === CompressedTrie.prototype &&
      Object.getPrototypeOf(instance) !== AbstractTrie.prototype
    );
  }

  if ('TrieMap' === instanceType || 'CompressedTrieMap' === instanceType) {
    if (
      !arraysEqual(props, []) ||
      !arraysEqual(protoProps, [
        'clear',
        'constructor',
        'delete',
        'entries',
        'find',
        'forEach',
        'get',
        'has',
        'keys',
        'set',
        'size',
        'values',
      ])
    ) {
      return false;
    }

    if ('TrieMap' === instanceType) {
      return (
        instance instanceof TrieMap &&
        instance instanceof AbstractTrieMap &&
        Object.getPrototypeOf(instance) === TrieMap.prototype &&
        Object.getPrototypeOf(instance) !== AbstractTrieMap.prototype
      );
    }

    return (
      instance instanceof CompressedTrieMap &&
      instance instanceof AbstractTrieMap &&
      Object.getPrototypeOf(instance) === CompressedTrieMap.prototype &&
      Object.getPrototypeOf(instance) !== AbstractTrieMap.prototype
    );
  }

  return false;
}
