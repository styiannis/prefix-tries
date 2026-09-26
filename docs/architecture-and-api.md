# Architecture and API

**Last verified:** 2026-09-25 · v1.2.0

## A tree and a list in every instance

Every instance holds two structures, and every write maintains both. A tree
answers prefix questions. A doubly linked list with one node per stored word
answers ordering questions. A node that ends a word points at its list node,
and the list node points back:

```typescript
export interface ITrieNode {
  key: string;
  parent: ITrieNode | null;
  children: Map<string, ITrieNode>;
  listNode: ITrieListNode<ITrieNode> | null;
}
```

`listNode` does two jobs. It links the node to the list, and it is the mark
that a word ends there: `isEndOfWord` tests `null !== instance.listNode`, and
there is no separate flag. `ITrieMapNode<V>` has the same four fields plus
`value`.

Three properties follow from the pairing:

- **`size` is `O(1)`.** It reads the list's counter, and nothing counts the
  tree.
- **Iteration follows insertion order.** It walks the list, not the tree, so
  it steps from word to word and never searches the tree for the next one.
- **The order survives mutation.** Adding a word that is already stored finds
  a node that already has a list node and adds nothing, so the word keeps its
  place. `set` on an existing key writes `value` and nothing else.

The list holds no strings: each word is rebuilt from its node by
concatenating the keys on the path to the root, which is why
[iteration](#complexity-as-implemented) costs the depth of every word rather
than one step per word.

The cost of the pairing is one list node per stored word, and two structures
to keep consistent on every insertion and deletion. The list comes from
[abstract-linked-lists](https://www.npmjs.com/package/abstract-linked-lists),
the package's one runtime dependency.

## Two ways to cut the same words

Both families build trees of the same node type. They differ in what a key
holds.

A standard trie, `Trie` or `TrieMap`, gives every character its own node.
`addWord` splits a word with `for...of`, which yields code points, so a
character outside the Basic Multilingual Plane — stored by JavaScript as two
UTF-16 code units — is still one node. Lookup walks the same way, one
`Map.get` per character.

A compressed trie, `CompressedTrie` or `CompressedTrieMap`, keeps a node only
where a word ends or where the path branches, and merges every chain of
single-child nodes between them into one node with a substring key. `romane`,
`romanus` and `romulus` produce a node for `rom`, with `an` and `ulus` below
it, and `e` and `us` below `an`. Keeping that shape takes two operations the
standard family never performs. A word that diverges inside a key splits that
node in two. A deletion that leaves a node which neither ends a word nor
branches merges it with its only child.

Because an insertion splits a node rather than adding a sibling beside it, no
two siblings share a first character, and at most one child can match the rest
of a search string. The compressed walk still has to find it, and it does so by
scanning the children and comparing, not by a `Map.get`. That scan is the σ in
the [complexity table](#complexity-as-implemented).

Every compressed path compares keys through one function, `commonSubstring`.
It compares by code unit, and it never ends the common part between the two
halves of a surrogate pair. A compressed key therefore holds whole characters,
as a standard one does, and a search string that ends halfway through a
character matches nothing in either family.

## Two layers

`src/` divides into `core/`, which holds every algorithm, and `classes/`,
which validates the arguments and delegates to it.

```
src/
├── core/
│   ├── trie.ts, trie-map.ts                       the standard family
│   ├── compressed-trie.ts, compressed-trie-map.ts the compressed family
│   ├── trie-node.ts, trie-map-node.ts             node creation and traversal
│   ├── trie-list.ts, trie-list-node.ts            the word list
│   └── util.ts                                    prefix walks, split, merge
├── classes/
│   ├── abstract/   AbstractTrie, AbstractTrieMap
│   ├── {Trie,CompressedTrie,TrieMap,CompressedTrieMap}.ts
│   └── validators.ts
└── types.ts        the node, list and instance interfaces
```

`core/` is written as small independent functions over plain objects, each
with behaviour and cost that can be checked in the function itself. A trie is
the object `{ root, list }`, a node is a plain object, and every function
that works on an instance takes it as its first argument. The standard prefix
walk is the whole of the standard lookup, and its `O(m)` can be read off it —
one `Map.get` per character of the prefix:

```typescript
export function triePrefixNode<T extends ITrie>(instance: T, prefix: string) {
  if (!prefix) {
    return;
  }

  let prefixNode: T['root'] | undefined = instance.root;

  for (const char of prefix) {
    prefixNode = prefixNode.children.get(char);

    if (!prefixNode) {
      return;
    }
  }

  return prefixNode;
}
```

The `classes/` layer contains no algorithm. Each method validates its
arguments and delegates, and `forEach`, which drives the iterator, is the only
one that does more:

```typescript
add(word: string) {
  validateNonEmptyString(word, 'word');
  return addWord(this.#trie, word);
}
```

Validation lives in this layer only, and `core/` assumes its input is valid.
That is why a rejected call leaves the instance unchanged: nothing in `core/`
has run. Three validators cover everything that is checked — non-empty string,
boolean, function. A map's `value` and `forEach`'s `thisArg` pass through
unchecked, since any value is legitimate for either.

The two families share every function whose behaviour does not depend on how
keys are cut, and nothing else. The compressed `create` and `clear` call the
standard ones, and the iterators are shared outright: `entries` and `keys` come
from `core/trie.ts`, `values` and the map `entries` from `core/trie-map.ts`.
Every function that walks the tree by key — insertion, lookup, deletion and
`find` — is written separately for each family. Within a family the map
reuses the set where the value does not matter: `TrieMap` takes `has` and
`delete` from `core/trie.ts`, and `CompressedTrieMap` takes `has` from
`core/compressed-trie.ts`.

## The public surface

The package root exports six classes and nothing else:

| Export                              | Kind     |
| ----------------------------------- | -------- |
| `Trie` `CompressedTrie`             | class    |
| `TrieMap<V>` `CompressedTrieMap<V>` | class    |
| `AbstractTrie` `AbstractTrieMap<V>` | abstract |

`core/` and `types.ts` are not exported, and `package.json` declares the one
export path `"."`, so a deep import fails:

```
require('prefix-tries/core/trie');
// ERR_PACKAGE_PATH_NOT_EXPORTED
```

Each class holds its structure in a private field — `#trie`,
`#compressedTrie`, `#trieMap`, `#compressedTrieMap` — so the tree cannot be
reached from outside at runtime either. The surface is deliberately narrower
than the layering suggests: `core/` exists to make the implementation
checkable, not to be a second API.

## Complexity, as implemented

With **m** the length of the word or prefix, **σ** the number of children
scanned at a node on the path, **S** the number of nodes in the subtree below
the prefix, **n** the number of stored words and **d** the number of nodes
between a word's node and the root:

| Operation                            | Standard                     | Compressed                   |
| ------------------------------------ | ---------------------------- | ---------------------------- |
| `add` `set`                          | `O(m)`                       | `O(m·σ)`, may split one node |
| `has` `get`                          | `O(m)`                       | `O(m·σ)`                     |
| `delete`                             | `O(m)`                       | `O(m·σ)`, may merge one node |
| `find`                               | `O(m + S)`                   | `O(m·σ + S)`                 |
| `size`                               | `O(1)`                       | `O(1)`                       |
| `clear`                              | `O(n)`                       | `O(n)`                       |
| `entries` `keys` `[Symbol.iterator]` | `O(1)` call, `O(Σd)` drained | `O(1)` call, `O(Σd)` drained |
| `values`                             | `O(1)` call, `O(n)` drained  | `O(1)` call, `O(n)` drained  |

Four of the rows need explaining.

`find` pays for every node below the prefix, not for every result. It walks
the subtree breadth-first, one top-level child at a time, and builds a string
at every node it visits, whether or not a word ends there. A prefix that
selects a small subtree is cheap. A prefix whose subtree holds a few percent
of the tree can already cost more than filtering an array of every stored
word.
[standard-vs-compressed.md](standard-vs-compressed.md#prefix-search) measures
where that happens. The traversal order is also why `find` returns neither
insertion order nor sorted order, and why the two families return the same
words in different orders.

The σ factor applies to the compressed family only. Its walk scans a node's
children for the one sharing a prefix with the rest of the search string,
where the standard walk looks the next character up in the children map.

Iteration is linear in the total depth of the stored words, **Σd**, not in
**n**. The list holds no strings, so every word is rebuilt from its node by
walking up to the root. A compressed path never holds more nodes than the
standard one, and usually fewer, so the same words cost it at most as many
steps. `values` reads each value through the list node's link to its tree
node, and rebuilds nothing.

`clear` walks the list once and unlinks every node, then resets the list's
three fields — `size`, `head` and `tail` — and clears the root's children map.
The tree below the root is not walked. It is left to the garbage collector, so
the call grows with the number of words, not with the number of nodes.

## Extending

Two routes, for two different intentions.

**Subclass a concrete class** when the structure is right and the behaviour
at the API boundary is not. The tree stays private to the base class, so a
subclass can change what reaches it but not the tree itself. A trie that
ignores case lowercases on the way in:

```typescript
import { Trie } from 'prefix-tries';

class CaseInsensitiveTrie extends Trie {
  override add(word: string) {
    super.add(word.toLowerCase());
  }

  override has(word: string) {
    return super.has(word.toLowerCase());
  }

  override delete(word: string) {
    return super.delete(word.toLowerCase());
  }

  override find(prefix: string) {
    return super.find(prefix.toLowerCase());
  }
}

const commands = new CaseInsensitiveTrie(['Commit', 'CHECKOUT']);

console.log([...commands]); // [ 'commit', 'checkout' ]
console.log(commands.has('COMMIT'), commands.find('Ch')); // true [ 'checkout' ]
console.log(commands.delete('Checkout'), commands.size); // true 1
```

The constructor adds its initial words through `this.add`, so they pass
through the override too. Every method that takes a word needs the same
treatment. One left out answers in the stored form: without the `has`
override, `has('COMMIT')` would be `false`. Iteration needs none, and yields
the words as they were stored, lowercased.

**Implement an abstract class** when the storage or the traversal is your
own — a trie over a sorted child array, or one that keeps its words on disk —
and it must stay substitutable for the built-in classes. Every member of
`AbstractTrie` and `AbstractTrieMap<V>` is abstract. `AbstractTrie` requires
`size`, `[Symbol.iterator]`, `add`, `clear`, `delete`, `entries`, `find`,
`forEach` and `has`. `AbstractTrieMap<V>` replaces `add` with `set` and `get`,
and adds `keys` and `values`. `core/` is not exported, so such an
implementation supplies its own internals. `[Symbol.iterator]`, `entries`,
`keys` and `values` declare `reversed` as optional, so `for...of`, which never
passes it, type-checks against a reference typed as the abstract class:

```typescript
import { AbstractTrie, CompressedTrie, Trie } from 'prefix-tries';

function snapshot(index: AbstractTrie) {
  return {
    size: index.size,
    words: [...index],
    last: [...index.entries(true)][0],
  };
}

console.log(snapshot(new Trie(['a', 'b'])));
// { size: 2, words: [ 'a', 'b' ], last: 'b' }
console.log(snapshot(new CompressedTrie(['a', 'b'])));
// { size: 2, words: [ 'a', 'b' ], last: 'b' }
```

## Tooling

TypeScript 5.9 in `strict` mode with `exactOptionalPropertyTypes` and
`noUncheckedIndexedAccess`. Rollup runs four times: the ES build, the CommonJS
build, and a declaration tree for each of them. All four run with
`preserveModules`, so the output mirrors `src/` file for file, and all four
label their output by extension — `.mjs` and `.d.mts` on the ES side, `.cjs`
and `.d.cts` on the CommonJS side. `abstract-linked-lists` stays external in
both builds, imported rather than bundled.

Two scripts check the result. `check-declared-paths` verifies that every path
declared in `package.json` exists, and that each entry point carries the
extension of the module system it is declared for. `check-dist-loads` loads the
two built entries the way a consumer would, the CommonJS one with `require` and
the ES one with `import`. Jest covers both layers, and `npm run verify` runs the
type check, the linter, the build and both checks in sequence.
