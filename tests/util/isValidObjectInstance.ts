import { arraysEqual } from './arraysEqual';

export function isValidObjectInstance(
  instance: unknown,
  instanceType:
    | 'trie'
    | 'trie-node'
    | 'trie-map'
    | 'trie-map-node'
    | 'compressed-trie'
    | 'compressed-trie-node'
    | 'compressed-trie-map'
    | 'compressed-trie-map-node'
) {
  if (
    'object' !== typeof instance ||
    Object.getPrototypeOf(instance) !== Object.prototype
  ) {
    return false;
  }

  const props = Object.getOwnPropertyNames(instance).sort(
    (a: string, b: string) => a.localeCompare(b)
  );

  if (
    'trie' === instanceType ||
    'trie-map' === instanceType ||
    'compressed-trie' === instanceType ||
    'compressed-trie-map' === instanceType
  ) {
    return arraysEqual(props, ['list', 'root']);
  }

  if ('trie-node' === instanceType || 'compressed-trie-node' === instanceType) {
    return arraysEqual(props, ['children', 'key', 'listNode', 'parent']);
  }

  if (
    'trie-map-node' === instanceType ||
    'compressed-trie-map-node' === instanceType
  ) {
    return arraysEqual(props, [
      'children',
      'key',
      'listNode',
      'parent',
      'value',
    ]);
  }

  return false;
}
