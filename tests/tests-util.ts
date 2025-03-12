/* ----------------------------------------- */
/* ---------- // Helper functions ---------- */
/* ----------------------------------------- */

function areIdenticalArrays(a: any[], b: any[]) {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

/* ----------------------------------------- */
/* ---------- Helper functions // ---------- */
/* ----------------------------------------- */

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

  // Own property names (sorted).
  const props = Object.getOwnPropertyNames(instance).sort();

  if (
    'trie' === instanceType ||
    'trie-map' === instanceType ||
    'compressed-trie' === instanceType ||
    'compressed-trie-map' === instanceType
  ) {
    return areIdenticalArrays(props, ['list', 'root']);
  }

  if ('trie-node' === instanceType || 'compressed-trie-node' === instanceType) {
    return areIdenticalArrays(props, ['children', 'key', 'listNode', 'parent']);
  }

  if (
    'trie-map-node' === instanceType ||
    'compressed-trie-map-node' === instanceType
  ) {
    return areIdenticalArrays(props, [
      'children',
      'key',
      'listNode',
      'parent',
      'value',
    ]);
  }
}
