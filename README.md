# Prefix Tries

A high-performance TypeScript library for efficient string manipulation and storage using tree-based data structures. This library provides:

### Core Data Structures

- **Standard Trie** (also known as "_prefix trie_" or "_prefix tree_")

  - Classic implementation optimized for straightforward usage
  - Ideal for most common string storage and retrieval needs
  - Perfect for smaller to medium-sized datasets

- **Compressed Trie** (also known as "_radix trie_" or "_radix tree_")
  - Memory-optimized implementation that merges single-child nodes
  - Significantly reduces memory footprint for large datasets
  - Maintains fast lookup performance while using less space

### Extended Functionality

Both implementations are available as pure tries for string storage and trie-maps for key-value associations, making this library suitable for a wide range of applications from autocomplete systems to routing tables.

## Key Features

### Data Structure Options

- **Standard Tries**: Traditional prefix tree implementation for straightforward string operations
- **Compressed Tries**: Space-efficient radix tree variant for optimized memory usage
- **Trie Maps**: Associate values with strings while maintaining prefix-based capabilities
- **Compressed Trie Maps**: Combine key-value storage with memory optimization

### Core Capabilities

- **Efficient Prefix Operations**: Lightning-fast prefix-based searches and pattern matching
- **Order Preservation**: Maintains insertion order for predictable iteration
- **Flexible Search**: Find all strings sharing common prefixes instantly
- **Memory Efficiency**: Optimized data structures for reduced memory consumption

### Developer Experience

- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Intuitive API**: Consistent interface across all implementations
- **Rich Documentation**: Detailed API docs and usage examples

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Importing Modules](#importing-modules)
- [Getting Started](#getting-started)
  - [Using Tries](#using-tries)
  - [Using Trie Maps](#using-trie-maps)
- [Code documentation](#code-documentation)
- [Issues and Support](#issues-and-support)
- [License](#license)

## System Requirements

| Package     | Version    |
| ----------- | ---------- |
| **Node.js** | ≥ `18.0.0` |
| **npm**     | ≥ `8.0.0`  |

## Installation

### Install via npm

```bash
npm install prefix-tries
```

### Install via yarn

```bash
yarn add prefix-tries
```

### Install via pnpm

```bash
pnpm install prefix-tries
```

## Importing Modules

The library provides both standard and memory-optimized implementations of tries and trie-maps. You can import the specific classes you need:

```typescript
import {
  // Concrete Classes
  Trie, // Standard trie implementation.
  TrieMap, // Standard trie-map implementation.
  CompressedTrie, // Memory-optimized trie implementation.
  CompressedTrieMap, // Memory-optimized trie-map implementation.

  // Abstract Base Classes
  AbstractTrie, // Base class for trie implementations.
  AbstractTrieMap, // Base class for trie-map implementations.
} from 'prefix-tries';
```

## Getting Started

### Using Tries

Tries are tree-like data structures optimized for storing and retrieving strings. They're particularly useful for implementing dictionaries, autocomplete features, and prefix-based searches.

Here's a basic example using the memory-optimized `CompressedTrie`:

```typescript
import { CompressedTrie } from 'prefix-tries';

// Initialize a trie with some words.
const words = ['apple', 'orange'];
const trie = new CompressedTrie(words);

// Add a new word.
trie.add('apricot');

// Count total words.
console.log(trie.size); // 3

// Check if word exists.
console.log(trie.has('orange')); // true

// Find words with prefix 'ap'.
console.log(trie.find('ap')); // ['apple', 'apricot']

// Iterate through all words (in insertion order).
for (let word of trie) {
  console.log(word);
  /*
    Output:
    apple
    orange
    apricot
  */
}

// Successful word removal.
console.log(trie.delete('apple')); // true

// Check the updated total word count.
console.log(trie.size); // 2

// Check for word that no longer exists.
console.log(trie.has('apple')); // false

// Clear all words.
trie.clear();
console.log(trie.size); // 0
```

### Using Trie Maps

Trie Maps combine the prefix-matching capabilities of tries with key-value storage. They're ideal for scenarios where you need to associate values with string keys while maintaining prefix search functionality.

Here's a basic example using the memory-optimized `CompressedTrieMap`:

```typescript
import { CompressedTrieMap } from 'prefix-tries';

// Initialize a trie-map with key-value pairs.
const wordValuePairs = [
  ['apple', 'value1'],
  ['orange', 'value2'],
];
const trieMap = new CompressedTrieMap(wordValuePairs);

// Add a new key-value pair.
trieMap.set('apricot', 'value3');

// Count total entries.
console.log(trieMap.size); // 3

// Check if key exists.
console.log(trieMap.has('orange')); // true

// Retrieve value by key.
console.log(trieMap.get('apricot')); // 'value3'

// Find entries with prefix 'ap'.
console.log(trieMap.find('ap')); // [['apple', 'value1'], ['apricot', 'value3']]

// Iterate through all entries (in insertion order).
for (let entry of trieMap) {
  console.log(entry);
  /*
    Output:
    ['apple', 'value1']
    ['orange', 'value2']
    ['apricot', 'value3']
  */
}

// Iterate through all keys.
for (let word of trieMap.keys()) {
  console.log(word);
  /*
    Output:
    apple
    orange
    apricot
  */
}

// Iterate through all values.
for (let value of trieMap.values()) {
  console.log(value);
  /*
    Output:
    value1
    value2
    value3
  */
}

// Successful entry removal.
console.log(trieMap.delete('apple')); // true

// Check the updated total word count.
console.log(trieMap.size); // 2

// Check for word that no longer exists.
console.log(trieMap.has('apple')); // false
console.log(trieMap.get('apple')); // undefined

// Clear all entries.
trieMap.clear();
console.log(trieMap.size); // 0
```

## Code documentation

The complete API reference of the library with detailed examples is available at the [code documentation site](https://styiannis.github.io/prefix-tries/).

## Issues and Support

If you encounter any issues or have questions, please [open an issue](https://github.com/styiannis/prefix-tries/issues).

## License

This project is licensed under the [MIT License](https://github.com/styiannis/prefix-tries?tab=MIT-1-ov-file#readme).
