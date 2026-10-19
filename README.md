# Prefix Tries

[![NPM Version](https://img.shields.io/npm/v/prefix-tries)](https://www.npmjs.com/package/prefix-tries)
[![Coverage Status](https://img.shields.io/coverallsCoverage/github/styiannis/prefix-tries)](https://coveralls.io/github/styiannis/prefix-tries?branch=main)

Standard (prefix) and compressed (radix) tries for TypeScript, each as a set
of strings and as a map from strings to values, behind one interface. The
structure answers one question well: **given a prefix, which stored strings
begin with it**, without reading the strings that do not. Every instance also
keeps its words in the order they were added, and iterates in that order.

## Install

```bash
npm install prefix-tries
```

`yarn add` and `pnpm add` work the same way. The package requires Node 18.12 or
later, and ships an ES build and a CommonJS build with type definitions for
each. Its one runtime dependency is
[abstract-linked-lists](https://www.npmjs.com/package/abstract-linked-lists).

## Prefix search

`find` returns every stored word that begins with a prefix. `has` asks a
different question — whether one exact word was stored — and a prefix of a
stored word is not itself stored unless it was added as a word:

```typescript
import { Trie } from 'prefix-tries';

const commands = new Trie([
  'commit',
  'checkout',
  'cherry-pick',
  'clone',
  'config',
]);

console.log(commands.find('ch')); // [ 'checkout', 'cherry-pick' ]
console.log(commands.find('co')); // [ 'commit', 'config' ]
console.log(commands.find('x')); // []

console.log(commands.has('clone')); // true
console.log(commands.has('ch')); // false
console.log(commands.size); // 5
```

`find` walks down to the node where the prefix ends, then visits every node
below it. Its cost therefore grows with the number of words that begin with
the prefix, not with the number of words stored. When a few words begin with
it, `find` visits only their nodes and never descends into the rest of the
tree. When thousands do, as with a single letter, it visits the nodes of all
of them.

An unsorted array of the same words, filtered with `startsWith`, reads every
word whatever the prefix. `find` is far faster than the array when few words
begin with the prefix, and the array can be as fast, or faster, when
thousands do.

## Standard or compressed, behind one API

A standard trie gives every character its own node. A compressed trie stores
substrings instead: it keeps a node only where a stored word ends or where two
stored words diverge, so a single node can hold several characters. It
therefore never holds more nodes than a standard trie, and usually far fewer.

Fewer nodes take less memory, and leave fewer nodes to visit below a prefix.
In exchange, each step of the walk down to a word or a prefix costs more: at
each node, a standard trie finds the next child directly by its character,
while a compressed trie compares the rest of the word with the node's children
one by one. An insertion that diverges inside a stored substring also splits
the node that holds it.

Apart from the order of `find`'s results, the two answer every call
identically. Both extend the same abstract class, so code written against it
accepts either:

```typescript
import { AbstractTrie, CompressedTrie, Trie } from 'prefix-tries';

const words = ['romane', 'romanus', 'romulus', 'rubens', 'ruber', 'rubicon'];

function complete(index: AbstractTrie, typed: string) {
  return index.find(typed).sort();
}

console.log(complete(new Trie(words), 'rub')); // [ 'rubens', 'ruber', 'rubicon' ]
console.log(complete(new CompressedTrie(words), 'rub')); // [ 'rubens', 'ruber', 'rubicon' ]
```

## Values attached to keys

`TrieMap<V>` and `CompressedTrieMap<V>` associate a value with each string and
keep the prefix search, which returns `[word, value]` pairs:

```typescript
import { TrieMap } from 'prefix-tries';

const routes = new TrieMap<number>([
  ['/api/users', 1],
  ['/api/users/:id', 2],
  ['/api/posts', 3],
]);

console.log(routes.get('/api/users')); // 1
console.log(routes.get('/api')); // undefined

console.log(routes.find('/api/users'));
// [ [ '/api/users', 1 ], [ '/api/users/:id', 2 ] ]

routes.set('/api/users', 10);
console.log([...routes]);
// [ [ '/api/users', 10 ], [ '/api/users/:id', 2 ], [ '/api/posts', 3 ] ]
```

`CompressedTrieMap` takes the same calls, and prints the same output here.

## Iteration order

Iteration yields the words in insertion order, and adding a word that is
already stored leaves it where it was:

```typescript
import { Trie } from 'prefix-tries';

const recent = new Trie(['zebra', 'apple', 'mango']);

recent.add('apple');
recent.add('kiwi');

console.log([...recent]); // [ 'zebra', 'apple', 'mango', 'kiwi' ]
console.log([...recent.entries(true)]); // [ 'kiwi', 'mango', 'apple', 'zebra' ]
```

`find` is the exception. Its results come out in the order the tree holds
them, which is neither insertion order nor alphabetical and differs between
standard and compressed tries. In a compressed trie, an insertion or a
deletion can also change the order in which `find` returns the words already
stored. Sort the results when the order matters.

## Importing

Everything the package exports is available from its root, which is its only
entry point:

```typescript
import {
  Trie, // set of strings
  CompressedTrie, // set of strings, compressed
  TrieMap, // map from strings to values
  CompressedTrieMap, // map from strings to values, compressed
  AbstractTrie, // abstract base, for an implementation of your own
  AbstractTrieMap, // abstract base, for an implementation of your own
} from 'prefix-tries';
```

## API

`Trie` and `CompressedTrie` extend `AbstractTrie`, and `TrieMap<V>` and
`CompressedTrieMap<V>` extend `AbstractTrieMap<V>`. The table marks which
members the tries and the maps have, and gives the time complexity of each in
a standard and in a compressed trie. **n** is the number of words stored, **m**
the length of the word or prefix, and **σ** the largest number of children of
a node on the path to that word or prefix (e.g. at most 26 for lowercase English
words).

| Member                                | Tries | Maps | Time, standard                | Time, compressed              |
| ------------------------------------- | :---: | :--: | ----------------------------- | ----------------------------- |
| `size`                                |   ✓   |  ✓   | `O(1)`                        | `O(1)`                        |
| `add(word)`                           |   ✓   |      | `O(m)`                        | `O(m·σ)`                      |
| `set(word, value)`                    |       |  ✓   | `O(m)`                        | `O(m·σ)`                      |
| `get(word)`                           |       |  ✓   | `O(m)`                        | `O(m·σ)`                      |
| `has(word)`                           |   ✓   |  ✓   | `O(m)`                        | `O(m·σ)`                      |
| `delete(word)`                        |   ✓   |  ✓   | `O(m)`                        | `O(m·σ)`                      |
| `find(prefix)`                        |   ✓   |  ✓   | `O(m)` + the subtree          | `O(m·σ)` + the subtree        |
| `clear()`                             |   ✓   |  ✓   | `O(n)`                        | `O(n)`                        |
| `entries(reversed?)`                  |   ✓   |  ✓   | `O(1)` per call               | `O(1)` per call               |
| `keys(reversed?)` `values(reversed?)` |       |  ✓   | `O(1)` per call               | `O(1)` per call               |
| `forEach(callback, thisArg?)`         |   ✓   |  ✓   | `O(n)` as a drained `entries` | `O(n)` as a drained `entries` |
| `[Symbol.iterator](reversed?)`        |   ✓   |  ✓   | `O(1)` per call               | `O(1)` per call               |

The `O(1)` of the iterators is the cost of the call. Insertion order is kept
in a linked list that does not store the words, so `entries`, `keys`,
`[Symbol.iterator]` and `forEach` rebuild each word as they reach it, one step
per node from its end up to the root: its length in a standard trie, and
usually fewer steps in a compressed one.
`values` rebuilds nothing.

Every method validates its arguments and throws a `TypeError` for a word or
prefix that is not a string or is empty, a `reversed` argument that is not a
boolean, and a callback that is not a function. The empty string can therefore
never be stored, and `find('')` throws rather than returning everything. The
constructors take an optional array to start from (words for the tries,
`[word, value]` pairs for the maps) and also throw a `TypeError` for an
argument that is not an array, or for a map entry that is not a two-element
array.

## When not to use it

A trie stores a node for every character, or substring, of its words, and
walks those nodes for every word it adds, looks up or removes. That structure
is built for prefix queries. For the problems below, another structure fits
better:

| If this describes the problem                                         | Reach for                                                                                                                                      |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Exact membership or lookup only                                       | a `Set` or a `Map` — `has` walks the key node by node, many times slower than one hash, in many times the memory                               |
| A few hundred words in all, or prefixes that thousands of words share | an `Array` and `filter` — at either extreme, a scan of every word is about as fast as `find`, or faster, and needs no tree                     |
| Suffix, infix or fuzzy matching                                       | a suffix array for suffix and infix queries, a BK-tree or an edit-distance search for fuzzy ones — this one indexes prefixes only              |
| Memory is the binding constraint                                      | a sorted `Array` searched by binary search, which finds a prefix's range too — either trie takes many times the memory of the strings it holds |

## Documentation

- [The generated API reference](https://styiannis.github.io/prefix-tries/) —
  every signature and every type.
- [Open an issue](https://github.com/styiannis/prefix-tries/issues) for a
  question or a bug report.

Released under the
[MIT License](https://github.com/styiannis/prefix-tries/blob/main/LICENSE).
