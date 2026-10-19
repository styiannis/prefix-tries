# Standard or compressed

`Trie` and `CompressedTrie` expose the same API and give the same answers,
apart from the order of `find`'s results. What differs is how they store the
words. This page measures what that costs, in memory, build time and lookup
time, and states the choice the measurements support. Everything here applies
equally to `TrieMap` and `CompressedTrieMap`.

**Last verified:** 2026-10-19 · v1.3.0 · Node v22.12.0

## What the two structures do differently

A standard trie gives every character its own node. The words `romane`,
`romanus` and `romulus` occupy a chain of nodes for `r`, `o` and `m`, then
branch, and the tree holds one node for every distinct prefix of the stored
words.

A compressed trie keeps a node only where a word ends or where the path
branches, and merges every chain in between into one node holding the whole
substring. The same three words need a node for `rom`, with `an` and `ulus`
below it. That means fewer nodes and a shallower tree, and more work on
writes: a word that diverges inside a substring splits a node, and a deletion
can merge two nodes back into one.

Both classes maintain the same insertion-ordered list beside the tree, and
both treat a character outside the Basic Multilingual Plane as one character.
`find` returns the same set of words from either, in an order that follows
each tree's shape. The [FAQ](faq.md) covers that order.

## Measurements

Every figure in this section comes from one corpus, 63,875 words: every line
of `/usr/share/dict/words` on the measuring machine made of lowercase ASCII
letters only. The words average 8.3 characters. Each figure was taken in a
child process of its own, which read the words from a file and allocated
nothing else.

The memory figures reproduce exactly from run to run, and are in decimal
megabytes. Each timing was taken in three processes, each reporting the median
of fifteen rounds after two rounds of warm-up, and the median of the three is
the figure for that run. The whole set was run six times in a row, and each
timing below is the range over those six runs. A ratio is computed within each
run, and the range of the six ratios is given. The timings are this machine's.
On another machine, compare the columns with each other rather than with a
clock. The node counts are exact on any machine.

### Memory

| Structure        |   Nodes | Retained |  Per node |
| ---------------- | ------: | -------: | --------: |
| `Array`          |       — |   0.5 MB |         — |
| `Set`            |       — |   1.3 MB |         — |
| `CompressedTrie` |  79,052 |  25.5 MB | 322 bytes |
| `Trie`           | 145,249 |  40.4 MB | 278 bytes |

The words were allocated before the measurement began and kept alive through
it, so each figure is what the structure adds to a program that already holds
its strings. That is what makes the `Set` and the `Array` so small: they hold
references to strings that already exist. Neither trie holds most of the
strings it was built from, so the same measurement with the word list
allocated inside the window moves them by the size of the list, 2.8 to
2.9 MB, and moves the `Set` from 1.3 to 4.2 MB. Any multiple taken between a
trie and a `Set` depends on that choice more than on either structure, which
is why none is quoted here.

What does not depend on it is the comparison between the two tries.
Compression keeps 54.4% of the nodes and 63% of the bytes, a saving of 37%.
A compressed node costs more than a standard one, for two reasons. The
per-node figure divides everything the structure holds by the number of tree
nodes, and the word list, one entry per word in both, is spread over fewer of
them. And a compressed key is a string of its own, where a standard trie's
one-character keys add nothing. The smaller node count more than repays both.

### Building and deleting

| Operation               |       `Trie` | `CompressedTrie` |
| ----------------------- | -----------: | ---------------: |
| Insert all 63,875 words | 28.3–31.2 ms |     53.7–55.9 ms |
| Delete 10,000 of them   | 14.9–15.6 ms |     16.4–18.1 ms |

Insertion into the compressed trie costs 1.76 to 1.94 times as much, which is
the scan of each node's children and the node splitting. Deletion is closer:
the compressed trie was slower in every run, by 10 to 20%.

### Prefix search

Mean milliseconds per `find(prefix)` call, against `Array.prototype.filter`
with `startsWith` over the same words. The node columns count the nodes in the
subtree the prefix lands on, which is what `find` walks, building a string at
each:

| Prefix  | Matches | Nodes, `Trie` | Nodes, compressed |    `filter` |      `Trie` | `CompressedTrie` |
| ------- | ------: | ------------: | ----------------: | ----------: | ----------: | ---------------: |
| `zy`    |       2 |             6 |                 2 | 0.558–0.568 |       0.002 |      0.001–0.002 |
| `car`   |     242 |           518 |               287 | 0.578–0.589 | 0.036–0.073 |      0.021–0.023 |
| `inter` |     267 |           656 |               342 | 0.585–0.592 | 0.045–0.049 |      0.026–0.027 |
| `pre`   |     493 |         1,209 |               646 | 0.576–0.591 | 0.097–0.154 |      0.050–0.052 |
| `un`    |   1,297 |         4,765 |             1,786 | 0.570–0.579 | 0.374–0.389 |      0.157–0.160 |
| `a`     |   3,572 |         8,560 |             4,501 | 0.577–0.591 | 0.939–1.284 |      0.438–0.450 |

The `Trie` column is the least stable in the document. Half of its cells sat
near one value and, in one or two of the six runs, landed up to twice as high:
`car` read 0.036 to 0.038 ms in five runs and 0.073 ms in the sixth. Neither
of the other two columns did this. The one range in them that spans a factor
of two, the compressed `zy` cell at 0.001 to 0.002 ms, differs only in the
last digit printed.

Two readings, and the second matters more.

The compressed trie is faster at prefix search wherever the result is large
enough to time, by 1.6 to 3.2 times, and the node columns say why: it walks
roughly half as many nodes or fewer to reach the same words, and builds
correspondingly fewer strings on the way. That is what it gets back for its
slower writes.

The advantage over a scan shrinks as the result grows, and on one letter the
standard trie loses it. `filter` costs the same whatever the prefix, because it
reads every word regardless. `find` costs what lies below the prefix: on
`car` the standard trie answers 8.1 to 16.1 times faster than the filter, and
on `a`, with 8,560 nodes below the prefix, it is the slower of the two, while
the compressed trie is still ahead. **A trie is an index for selective
prefixes.** For the standard trie, selective means a small fraction: `a`
matches 5.6% of the words, and it already loses there, because each node below
the prefix costs `find` 12.0 to 16.4 times what one word costs `filter`. The
compressed trie walks about half as many nodes and led on every prefix
measured here. If your queries routinely match more than a few percent of what
you stored, measure against a plain scan before adopting either structure, the
standard one above all.

### Exact membership

Mean milliseconds per `has` call, over every stored word:

|             `Set` |            `Trie` |  `CompressedTrie` |
| ----------------: | ----------------: | ----------------: |
| 0.000032–0.000033 | 0.000240–0.000243 | 0.000571–0.000580 |

Here the order reverses. The standard trie looks up one character at a time
in each node's children map, while the compressed trie scans the children of
every node on its path and compares substrings. The standard trie is 2.37 to
2.41 times as fast. Both are slower than a `Set` by a wide margin, 7.3 to 7.6
times for the standard trie and 17.4 to 18.0 times for the compressed one,
because a `Set` hashes the whole string once. Neither structure exists to
answer this question.

## How much compression saves

The saving above belongs to the English corpus, not to the technique. The
compressed trie removes a node only where it has one child and ends no word,
so what it saves depends on how many such chains the keys form. Three
generated corpora show the range:

| Corpus                         |   Words | Nodes, `Trie` | Nodes, compressed |   `Trie` | `CompressedTrie` | Build time, compressed ÷ standard |
| ------------------------------ | ------: | ------------: | ----------------: | -------: | ---------------: | --------------------------------: |
| File paths under a shared root |  20,000 |       220,636 |            28,867 |  54.8 MB |           9.7 MB |                         0.55–0.60 |
| 32-character hex digests       |  20,000 |       581,393 |            26,668 | 141.5 MB |           9.2 MB |                         0.23–0.24 |
| Every string `00000`–`99999`   | 100,000 |       111,110 |           111,110 |  38.5 MB |          38.5 MB |                         2.32–2.48 |

Long keys that share a stem and then diverge are what compression was made
for: over the digests it keeps under 5% of the nodes and 7% of the memory, and
builds 4.1 to 4.4 times faster, because creating 26,668 nodes is less work than
creating 581,393. It also answers `has` faster than the standard trie, by a
wide margin over the digests and a smaller one over the paths, where it keeps
more of the nodes. A dense key set over a small alphabet is the opposite case.
Every five-digit string is present, so every internal node has ten children,
no node is ever merged, and the compressed trie is the standard trie with
slower writes and slower lookups.

## Choosing

**Use `CompressedTrie` or `CompressedTrieMap`** when the word set is large,
mostly read after it is built, and read by prefix. It uses about a third less
memory on English words, much less on keys with long shared stems, and
answers prefix queries 1.6 to 3.2 times faster wherever the result is large
enough to time. On English words, its `has` and `get` are slower, and so is
building it. On keys like the paths and digests above, where it removes most
of the nodes, it builds faster and looks words up faster too. Dictionaries,
autocomplete indexes and path or route tables fit this shape.

**Use `Trie` or `TrieMap`** when writes are frequent relative to reads, when
exact lookups outnumber prefix queries and compression would remove few nodes,
when the keys are dense in a small alphabet, or when the structure is small
enough that the difference is noise.

**Use neither** if you do not query by prefix. The memory table is the
argument: tens of megabytes for a set of words a `Set` holds in a few, and
that cost buys one capability.

The two classes share an interface, so the decision is reversible: measure
your own workload, and change the constructor if the other structure wins.

## Reproducing these numbers

The measurements are not shipped with the package. To repeat them, run each
figure in a process of its own: read the words from a file, force collection
until the heap stops moving, record `heapUsed`, build the structure, collect
again until it stops moving, and read the difference. Time `find` over
prefixes chosen to span a range of result sizes, since the result size is the
variable that changes the conclusion.
