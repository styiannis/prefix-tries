# FAQ

Behaviour that surprises readers of the API, every error the library throws,
and the questions the package shape raises.

**Last verified:** 2026-09-24 · v1.1.1

## Behaviour

### `has()` returns `false` for a string I can see in the trie

`has` asks whether an exact word was stored, not whether a path exists in the
tree. Storing `'cart'` creates a path through `c`, `a` and `r`, but only
`cart` is marked as a word:

```typescript
import { Trie } from 'prefix-tries';

const trie = new Trie(['cart']);

console.log(trie.has('cart')); // true
console.log(trie.has('car')); // false
console.log(trie.find('car')); // [ 'cart' ]
console.log(trie.find('car').length > 0); // true
```

To ask whether anything starts with a string, test the length of what `find`
returns. The same rule governs `delete` on every class, and `get` on the map
classes: a string that was never stored is not a word, whatever it is the
start of.

### `find()` returns results in an order I did not expect

The order follows the shape of the tree at the moment of the call. It is not
insertion order and not alphabetical, and it differs between the standard and
compressed classes. In a compressed trie it can also change for the words
already stored, when an insertion splits a node or a deletion merges two:

```typescript
import { CompressedTrie, Trie } from 'prefix-tries';

const words = ['car', 'cart', 'cat', 'dog'];

console.log(new Trie(words).find('c')); // [ 'car', 'cat', 'cart' ]
console.log(new CompressedTrie(words).find('c')); // [ 'car', 'cart', 'cat' ]

const split = new CompressedTrie(['pabc', 'px']);
console.log(split.find('p')); // [ 'pabc', 'px' ]

split.add('pab');
console.log(split.find('p')); // [ 'px', 'pab', 'pabc' ]

const trie = new CompressedTrie(['romane', 'romanus', 'romulus']);
console.log(trie.find('rom')); // [ 'romane', 'romanus', 'romulus' ]

trie.delete('romanus');
console.log(trie.find('rom')); // [ 'romulus', 'romane' ]
console.log(trie.find('rom').sort()); // [ 'romane', 'romulus' ]
```

Sort the result when the order matters. Iteration, unlike `find`, is ordered
and stable.

### What order does iteration use?

Insertion order, and it survives every mutation. Each instance keeps a list of
its words beside the tree, and iteration walks the list. Adding a word that is
already stored does not move it, and neither does setting a new value for an
existing key. A word that is deleted and added again goes to the end:

```typescript
import { Trie, TrieMap } from 'prefix-tries';

const trie = new Trie(['b', 'a']);
trie.add('b');
console.log([...trie]); // [ 'b', 'a' ]

const map = new TrieMap([
  ['b', 1],
  ['a', 2],
]);
map.set('b', 3);
console.log([...map]); // [ [ 'b', 3 ], [ 'a', 2 ] ]

trie.delete('b');
trie.add('b');
console.log([...trie]); // [ 'a', 'b' ]
```

Pass `true` to iterate in reverse: `[Symbol.iterator](true)`, `entries(true)`,
`keys(true)` or `values(true)`.

### Does `find()` include the prefix itself?

Yes, when the prefix is a stored word. `find` returns stored words, so a
prefix that was never added is not in the result even though the search
succeeds:

```typescript
import { Trie } from 'prefix-tries';

const trie = new Trie(['car', 'cart']);

console.log(trie.find('car')); // [ 'car', 'cart' ]
console.log(trie.find('ca')); // [ 'car', 'cart' ]
```

### Can I delete words while iterating?

Not the word the iteration is on. To advance, the iterator reads the next link
of the current word's list node, and `delete` clears that link, so the loop
ends at the word you deleted:

```typescript
import { Trie } from 'prefix-tries';

const trie = new Trie(['w', 'x', 'y', 'z']);

const seen: string[] = [];
for (const word of trie) {
  seen.push(word);
  if (word === 'x') {
    trie.delete(word);
  }
}

console.log(seen); // [ 'w', 'x' ]
console.log(trie.size, [...trie]); // 3 [ 'w', 'y', 'z' ]
```

The trie itself is correct afterwards. Only the loop ended early. The same
holds for `forEach`, `entries`, `keys` and `values`, and for reverse
iteration, which reads the previous link instead.

Deleting any other word is safe: the list is relinked around it, and the
iterator follows the new links. To delete the current word, iterate over a
snapshot, `for (const word of [...trie])`.

### Can I store non-ASCII text?

Yes, and every word comes back exactly as it went in, from both families.
Both treat a character outside the Basic Multilingual Plane, such as an emoji,
as one character, although JavaScript stores it as two UTF-16 code units. A
search string that ends between those two units matches nothing:

```typescript
import { CompressedTrie, Trie } from 'prefix-tries';

console.log(new Trie(['καλημέρα', 'καλησπέρα']).find('καλη'));
// [ 'καλημέρα', 'καλησπέρα' ]

const words = ['a\u{1F600}b', 'a\u{1F601}c']; // 'a😀b' and 'a😁c'

for (const trie of [new Trie(words), new CompressedTrie(words)]) {
  console.log(trie.find('a\u{1F600}'), trie.find('a\uD83D'));
}
// [ 'a😀b' ] []
// [ 'a😀b' ] []
```

A string like `'a\uD83D'` is what `slice` and `substring` produce when they
cut through an emoji, since both count code units. To cut a prefix by
character, spread the string first:

```typescript
import { Trie } from 'prefix-tries';

const typed = 'a\u{1F600}b';
const trie = new Trie([typed]);

console.log(trie.find(typed.slice(0, 2))); // []
console.log(trie.find([...typed].slice(0, 2).join(''))); // [ 'a😀b' ]
```

### `get()` returned `undefined` for a key I set

The value you set was `undefined`. `get` returns the stored value for a key and
`undefined` for a string that is not a key, so the two read the same. `has`
tells them apart:

```typescript
import { TrieMap } from 'prefix-tries';

const flags = new TrieMap<string | undefined>([
  ['beta', 'on'],
  ['legacy', undefined],
]);

console.log(flags.get('legacy'), flags.get('missing')); // undefined undefined
console.log(flags.has('legacy'), flags.has('missing')); // true false
```

### My loop threw and some words were still stored

Each call to `add` or `set` is complete on its own, and nothing undoes the
calls before a failed one. Words added before an invalid one stay:

```typescript
import { Trie } from 'prefix-tries';

const trie = new Trie();

try {
  for (const word of ['ok', '', 'later']) {
    trie.add(word);
  }
} catch (error) {
  console.log((error as Error).message); // The "word" value should not be empty.
}

console.log([...trie]); // [ 'ok' ]
```

The constructor behaves the same way, except that when it throws, the
partly filled instance is never returned. Validate the input before
constructing, or add in a loop that handles each failure.

### Why is `Trie.find()` on one letter slower than filtering an array?

Because `find` pays for every node below the prefix, and one letter leaves
thousands of nodes below it. The standard trie builds a string at each of those
nodes, not only at the ones that end a word, whereas a filter reads strings
that already exist. On a 63,875-word corpus, `find('a')` on a `Trie` takes
longer than `filter` with `startsWith` over the same words. Three letters in,
it is several times faster, and it keeps getting faster as the prefix grows. A
`CompressedTrie` walks about half as many nodes, and stayed ahead of the
filter on every prefix measured.
[standard-vs-compressed.md](standard-vs-compressed.md#prefix-search) has the
measurements. A trie is an index for selective prefixes.

### Is the memory cost significant?

Yes, and it is the main reason not to use this structure. The same 63,875
words take 40.4 MB as a `Trie` and 25.5 MB as a `CompressedTrie`, against
1.3 MB for a `Set` holding references to strings that already exist.
[standard-vs-compressed.md](standard-vs-compressed.md#memory) says how each
figure was taken.

### Is `has()` faster than `Set.has()`?

No. A `Set` hashes the whole string once. A standard trie looks up one
character at a time, one `Map.get` each, and a compressed trie scans the
children of every node on the path. Over the same 63,875 words, `Trie.has`
measured seven to nine times slower than `Set.has`, and `CompressedTrie.has`
about seventeen times. If exact membership is all you need, use a `Set`.

## Errors

Every public method validates its arguments before touching the structure, so
a rejected call leaves the instance unchanged. Every failure is a `TypeError`:

| Message                                                          | Thrown by                                                        | Fix                                    |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------- |
| `The "word" value must be a string. Current value: "<v>".`       | `add`, `set`, `get`, `has`, `delete` given a non-string          | Convert to a string first              |
| `The "word" value should not be empty.`                          | the same methods given `''`                                      | The empty string cannot be stored      |
| `The "prefix" value must be a string. Current value: "<v>".`     | `find` given a non-string                                        | Convert to a string first              |
| `The "prefix" value should not be empty.`                        | `find('')`                                                       | Iterate the instance to get every word |
| `The "reversed" value must be a boolean. Current value: "<v>".`  | `entries`, `keys`, `values` or the iterator, given a non-boolean | Pass `true`, `false` or nothing        |
| `The "callback" value must be a function. Current value: "<v>".` | `forEach` given a non-function                                   | Pass a function                        |

```typescript
import { Trie, TrieMap } from 'prefix-tries';

const trie = new Trie();
const map = new TrieMap<number>();

const calls: Array<() => unknown> = [
  () => trie.add(7 as unknown as string),
  () => map.set('', 1),
  () => trie.find(''),
  () => trie.entries(1 as unknown as boolean),
  () => trie.forEach('log' as unknown as () => void),
];

for (const call of calls) {
  try {
    call();
  } catch (error) {
    console.log(`${(error as Error).name}: ${(error as Error).message}`);
  }
}
// TypeError: The "word" value must be a string. Current value: "7".
// TypeError: The "word" value should not be empty.
// TypeError: The "prefix" value should not be empty.
// TypeError: The "reversed" value must be a boolean. Current value: "1".
// TypeError: The "callback" value must be a function. Current value: "log".
```

Two consequences of the empty-string rule: `''` can never be a stored word,
and `find('')` throws rather than returning everything. To get every word,
iterate the instance. The `reversed` check runs when the iterator is
requested, not when it is first advanced, so it throws on the call itself.

## Environment and integration

### Does it work in the browser?

Yes. `src/` references no platform API — no `process`, no `document`, no
`Buffer`, no timers — so the built modules run unmodified in browsers, Node,
Deno, Bun, workers and edge runtimes. There is nothing to polyfill.

### ESM or CommonJS?

Both. `import` resolves to `dist/es/index.mjs` and `require` to
`dist/cjs/index.cjs`, each with its own declarations —
`dist/@types/es/index.d.mts` and `dist/@types/cjs/index.d.cts` — emitted from
the same source by the same build. The module system is carried by the file
extension rather than inferred from a `type` field, so Node reads each build
as what it is and neither path prints a warning.

### Can I import the internal functions directly?

No. The package declares the one export path `"."`, and nothing below it can
be reached:

```
require('prefix-tries/core/trie');
// ERR_PACKAGE_PATH_NOT_EXPORTED
```

The four classes and the two abstract classes are the whole public surface,
and an instance keeps its tree in a private class field.
[architecture-and-api.md](architecture-and-api.md#the-public-surface) explains
why.

### Will unused classes be dropped from my bundle?

The package declares `"sideEffects": false` and ships an ES build that keeps
one module per source file, so a bundler that performs tree-shaking removes
what you do not import. Importing `Trie` alone does not pull in the compressed
classes.

### What does it depend on at runtime?

One package,
[abstract-linked-lists](https://www.npmjs.com/package/abstract-linked-lists),
which supplies the doubly linked list that keeps the insertion order. It has
no runtime dependencies of its own.

### What are the version requirements?

Node 18.12 or later, and npm 8 or later. The published code targets ES2022.
