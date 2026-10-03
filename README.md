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
stored word is not itself stored unless it was added:

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

The cost of `find` grows with the part of the tree below the prefix, not with
the number of stored words. A prefix that few words share leaves most of the
tree unvisited. A prefix that thousands of words share, such as a single
letter, visits every one of their nodes.

The simplest alternative, an unsorted array of the same words filtered with
`startsWith`, reads every word whatever the prefix. That makes `find` far
faster when few words share the prefix, while the array can be as fast, or
faster, when thousands do.

## Standard or compressed, behind one API

A standard trie gives every character its own node. A compressed trie stores
substrings instead: adding a word creates a node only where the word ends or
where it diverges from a word already stored, so a single node can hold
several characters. The compressed trie therefore never holds more nodes than
a standard trie, and usually far fewer. The saving is paid for on insertion,
in two ways. Each step scans a node's children rather than looking one up by
its character, and a word that diverges inside a stored substring splits the
node that holds it. Both extend the same abstract class, so code written
against it accepts either:

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
keep the prefix search, which returns `[key, value]` pairs:

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

The compressed map takes the same calls:

```typescript
import { CompressedTrieMap } from 'prefix-tries';

const routes = new CompressedTrieMap<number>([
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

## Iteration order

Every instance keeps a doubly linked list beside the tree, one node per word,
so iteration yields the words in insertion order, and adding a word that is
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

`Trie` and `CompressedTrie` extend `AbstractTrie`; `TrieMap<V>` and
`CompressedTrieMap<V>` extend `AbstractTrieMap<V>`. With **m** the length of
the word or prefix and **σ** the number of children scanned at each node on
the path:

| Member                                | Tries | Maps | Standard               | Compressed             |
| ------------------------------------- | :---: | :--: | ---------------------- | ---------------------- |
| `size`                                |   ✓   |  ✓   | `O(1)`                 | `O(1)`                 |
| `add(word)`                           |   ✓   |      | `O(m)`                 | `O(m·σ)`               |
| `set(word, value)`                    |       |  ✓   | `O(m)`                 | `O(m·σ)`               |
| `get(word)`                           |       |  ✓   | `O(m·σ)`               | `O(m·σ)`               |
| `has(word)`                           |   ✓   |  ✓   | `O(m·σ)`               | `O(m·σ)`               |
| `delete(word)`                        |   ✓   |  ✓   | `O(m·σ)`               | `O(m·σ)`               |
| `find(prefix)`                        |   ✓   |  ✓   | `O(m·σ)` + the subtree | `O(m·σ)` + the subtree |
| `clear()`                             |   ✓   |  ✓   | `O(1)`                 | `O(1)`                 |
| `entries(reversed?)`                  |   ✓   |  ✓   | `O(1)` call            | `O(1)` call            |
| `keys(reversed?)` `values(reversed?)` |       |  ✓   | `O(1)` call            | `O(1)` call            |
| `forEach(callback, thisArg?)`         |   ✓   |  ✓   | —                      | —                      |
| `[Symbol.iterator](reversed?)`        |   ✓   |  ✓   | `O(1)` call            | `O(1)` call            |

Insertion into a standard trie looks each child up by its character. Every
other walk, standard or compressed, scans a node's children until one
matches.

A drained `entries`, `keys` or `[Symbol.iterator]`, and every `forEach` call,
rebuilds each word by walking from its node up to the root, so it costs one
step per node on the word's path rather than one step per word. That is the
word's length in a standard trie, and usually fewer steps in a compressed one.
`values` rebuilds nothing.

Every method validates its arguments and throws a `TypeError` for a word or
prefix that is not a string or is empty, a `reversed` that is not a boolean,
and a callback that is not a function. The empty string can therefore never
be stored, and `find('')` throws rather than returning everything. The
constructors take an optional array to start from (words for the tries,
`[key, value]` pairs for the maps) and throw the same error for an argument
that is not an array, or for a map entry that is not one.

## When not to use it

A trie pays for its prefix query with a node per character or substring, and a
tree to walk for every other question. The cases below are those where that
cost buys nothing.

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
