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
    | 'compressed-trie'
    | 'compressed-trie-node'
) {
  if (
    'object' !== typeof instance ||
    Object.getPrototypeOf(instance) !== Object.prototype
  ) {
    return false;
  }

  // Own property names (sorted).
  const props = Object.getOwnPropertyNames(instance).sort();

  if ('trie' === instanceType || 'compressed-trie' === instanceType) {
    return areIdenticalArrays(props, ['list', 'root']);
  }

  if ('trie-node' === instanceType || 'compressed-trie-node' === instanceType) {
    return areIdenticalArrays(props, ['children', 'key', 'listNode', 'parent']);
  }

  return false;
}
