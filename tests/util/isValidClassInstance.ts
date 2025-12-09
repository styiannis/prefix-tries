import {
  AbstractTrie,
  AbstractTrieMap,
  CompressedTrie,
  CompressedTrieMap,
  Trie,
  TrieMap,
} from '../../src/classes';
import { arraysEqual } from './arraysEqual';

function isValidTrieClassInstance(
  instance: unknown,
  instanceType: 'Trie' | 'CompressedTrie'
) {
  const props = Object.getOwnPropertyNames(instance).sort();
  const proto = Object.getPrototypeOf(instance);
  const protoProps = Object.getOwnPropertyNames(proto).sort();

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
      proto === Trie.prototype &&
      proto !== AbstractTrie.prototype
    );
  }

  return (
    instance instanceof CompressedTrie &&
    instance instanceof AbstractTrie &&
    proto === CompressedTrie.prototype &&
    proto !== AbstractTrie.prototype
  );
}

function isValidTrieMapClassInstance(
  instance: unknown,
  instanceType: 'TrieMap' | 'CompressedTrieMap'
) {
  const props = Object.getOwnPropertyNames(instance).sort();
  const proto = Object.getPrototypeOf(instance);
  const protoProps = Object.getOwnPropertyNames(proto).sort();

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
      proto === TrieMap.prototype &&
      proto !== AbstractTrieMap.prototype
    );
  }

  return (
    instance instanceof CompressedTrieMap &&
    instance instanceof AbstractTrieMap &&
    proto === CompressedTrieMap.prototype &&
    proto !== AbstractTrieMap.prototype
  );
}

export const isValidClassInstance = (
  instance: unknown,
  instanceType: 'Trie' | 'CompressedTrie' | 'TrieMap' | 'CompressedTrieMap'
) =>
  'object' === typeof instance &&
  ('Trie' === instanceType || 'CompressedTrie' === instanceType
    ? isValidTrieClassInstance(instance, instanceType)
    : isValidTrieMapClassInstance(instance, instanceType));
