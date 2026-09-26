# Getting started

From an empty project to a prefix search you can add to, iterate in the order
you filled it, attach values to, and empty again.

**Last verified:** 2026-09-25 · v1.2.0 · Node ≥ 18.12

## Install

```bash
npm install prefix-tries
```

The package has one runtime dependency, `abstract-linked-lists`, which npm
installs with it. It ships an ES build, a CommonJS build and type
definitions, so TypeScript needs no additional configuration and JavaScript
works with either module system.

## Store words and search by prefix

A `Trie` holds strings. Seed it from an array at construction, add words one
at a time, or both — the constructor calls `add` for each element, so the two
are the same operation.

```typescript
import { Trie } from 'prefix-tries';

const commands = new Trie([
  'commit',
  'checkout',
  'cherry-pick',
  'clone',
  'config',
]);

commands.add('cat-file');

console.log(commands.size); // 6
console.log(commands.find('ch')); // [ 'checkout', 'cherry-pick' ]
```

`find` returns every stored word that begins with the prefix, and the prefix
itself when it is a stored word. The order of the array follows the shape of
the tree, not the order you added the words in. Sort it if you need a
particular order.

## Ask whether one exact word is present

`find` asks about prefixes and `has` asks about whole words, so a string can
pass the first test and fail the second:

```typescript
import { Trie } from 'prefix-tries';

const commands = new Trie(['commit', 'checkout', 'cherry-pick', 'clone']);

console.log(commands.has('clone')); // true
console.log(commands.has('cl')); // false
console.log(commands.find('cl')); // [ 'clone' ]
console.log(commands.find('cl').length > 0); // true
```

`'cl'` is the start of a stored word, but it was never added as a word of its
own, so `has` answers `false`. To ask whether anything starts with a string,
test the length of what `find` returns.

## Iterate in the order you filled it

Every instance keeps its words in insertion order, and iterating yields them
in that order. The iterator takes an argument for the other direction:

```typescript
import { Trie } from 'prefix-tries';

const commands = new Trie(['commit', 'checkout', 'cherry-pick', 'clone']);
commands.add('cat-file');

for (const command of commands) {
  console.log(command);
}
// commit
// checkout
// cherry-pick
// clone
// cat-file

console.log([...commands[Symbol.iterator](true)]);
// [ 'cat-file', 'clone', 'cherry-pick', 'checkout', 'commit' ]

commands.forEach((command, trie) => {
  if (command.startsWith('ch')) {
    console.log(command, trie.size);
  }
});
// checkout 5
// cherry-pick 5
```

`for...of` and the spread form call the iterator with no argument, so pass
`true` explicitly for reverse order, as the spread after the loop does.
`entries(true)` does the same. `forEach` receives each word and the instance,
and takes an optional `thisArg`.

## Attach values to the words

When each string needs a value, use `TrieMap<V>`. It has the same prefix
search, and `set`, `get`, `keys` and `values` besides:

```typescript
import { TrieMap } from 'prefix-tries';

const routes = new TrieMap<number>([
  ['/api/users', 1],
  ['/api/users/:id', 2],
  ['/api/posts', 3],
]);

console.log(routes.get('/api/users')); // 1
console.log(routes.get('/api')); // undefined
console.log(routes.has('/api')); // false

console.log(routes.find('/api/users'));
// [ [ '/api/users', 1 ], [ '/api/users/:id', 2 ] ]

routes.set('/api/users', 10);

console.log([...routes]);
// [ [ '/api/users', 10 ], [ '/api/users/:id', 2 ], [ '/api/posts', 3 ] ]
console.log([...routes.keys()]); // [ '/api/users', '/api/users/:id', '/api/posts' ]
console.log([...routes.values()]); // [ 10, 2, 3 ]
```

`find` on a map returns `[key, value]` pairs. `set` on an existing key
replaces the value and leaves the key where it was in the iteration order.
`get` on a string that is not a stored key returns `undefined`, including when
it is the start of stored keys, which is the same exact-match rule `has`
follows. `forEach` on a map passes the value first and the key second, the
way `Map.prototype.forEach` does.

## Remove words

`delete` takes a whole word, on the same exact-match rule, and reports whether
it was there:

```typescript
import { Trie } from 'prefix-tries';

const commands = new Trie(['commit', 'checkout', 'clone']);

console.log(commands.delete('clone')); // true
console.log(commands.delete('clone')); // false
console.log(commands.delete('co')); // false
console.log(commands.size, [...commands]); // 2 [ 'commit', 'checkout' ]

commands.clear();
console.log(commands.size, commands.find('c')); // 0 []

commands.add('rebase');
console.log([...commands]); // [ 'rebase' ]
```

A deletion also removes the nodes that no longer lead to any word, so a trie
that is filled and emptied does not keep the tree it built. `clear()` empties
the instance in one call, and the instance stays usable.

## Use the compressed structure

Everything above works unchanged with `CompressedTrie` and
`CompressedTrieMap`: the same methods, with the same signatures and the same
answers, apart from the order of `find`'s results. They store the same words
in a tree that never has more nodes and usually has far fewer, and they pay
for it when writing, unless the compression removes most of the nodes.
Switching is one word:

```typescript
import { CompressedTrie } from 'prefix-tries';

const commands = new CompressedTrie([
  'commit',
  'checkout',
  'cherry-pick',
  'clone',
  'config',
]);

console.log(commands.find('ch')); // [ 'checkout', 'cherry-pick' ]
console.log(commands.has('ch'), commands.size); // false 5
console.log([...commands]);
// [ 'commit', 'checkout', 'cherry-pick', 'clone', 'config' ]
```

Which of the two to use, with measurements of memory, build time and search
time, is the subject of [standard-vs-compressed.md](standard-vs-compressed.md).

## Handle invalid input

Words and prefixes must be non-empty strings, `reversed` must be a boolean and
a callback must be a function. Anything else throws a `TypeError` before the
instance is touched:

```typescript
import { Trie } from 'prefix-tries';

const commands = new Trie(['commit']);

for (const call of [
  () => commands.add(''),
  () => commands.find(42 as unknown as string),
  () => commands.entries('yes' as unknown as boolean),
]) {
  try {
    call();
  } catch (error) {
    console.log(error instanceof TypeError, (error as Error).message);
  }
}
// true The "word" value should not be empty.
// true The "prefix" value must be a string. Current value: "42".
// true The "reversed" value must be a boolean. Current value: "yes".

console.log([...commands]); // [ 'commit' ]
```

One consequence is worth planning for. A single invalid element makes the
constructor throw, and the instance it had partly filled is never returned to
you. Filter the input first, or add the words in a loop where you can handle
each failure:

```typescript
import { Trie } from 'prefix-tries';

const input = ['ok', '', 'later'];

try {
  new Trie(input);
} catch (error) {
  console.log((error as Error).message); // The "word" value should not be empty.
}

const trie = new Trie();
for (const word of input) {
  if (word) {
    trie.add(word);
  }
}
console.log([...trie]); // [ 'ok', 'later' ]
```

## What this page did not cover

[standard-vs-compressed.md](standard-vs-compressed.md) measures the choice this
page deferred: what each structure holds in memory, what each costs to build,
and the point at which a prefix matches so much that the standard trie no
longer beats a plain scan. [faq.md](faq.md) covers the behaviour that
surprises people, every error the library throws, and which module system
resolves to which build.
[architecture-and-api.md](architecture-and-api.md) explains why every instance
holds a tree and a list, what each operation costs, and what the abstract
classes are for.
