const { readFileSync, existsSync } = require('node:fs');
const { dirname, join } = require('node:path');

const root = join(__dirname, '..');

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const pkgTypeDefault = 'commonjs';
const pkgType = pkg.type ?? pkgTypeDefault;

/**
 * Walks an "exports" map, pairing every string leaf with the module system the
 * conditions enclosing it require. Every leaf comes back, whatever shape the
 * map takes, so no target path gets silently skipped.
 *
 * @param {unknown} node A node of the map, or the map itself.
 * @param {string} [label] Path to `node`, used in error messages.
 * @param {'module' | 'commonjs' | null} [expected] Inherited requirement, or
 *   null once a condition puts it beyond reach.
 * @returns {Array<[label: string, path: string, expected: 'module' | 'commonjs' | null]>}
 */
function exportsEntries(node, label = 'exports', expected = pkgType) {
  if (!node) {
    return [];
  }

  if (typeof node === 'string') {
    return [[label, node, expected]];
  }

  return Object.entries(node).flatMap(([key, child]) => {
    // A .d.ts has no module system, and dist/@types gets no package.json, so
    // "import" would fail on it -- nor can an "import" nested under "types"
    // give it one, hence the flattening. Still checked for existence.
    if (key === 'types') {
      return exportsEntries(child, `${label} > types`).map(
        ([leafLabel, path]) => [leafLabel, path, null]
      );
    }

    // "default" passes through because Node takes it when nothing else matches.
    // Any other condition is a bundler's: it settles nothing, hence the null.
    let newExpected = null;

    if (key === 'import') {
      newExpected = 'module';
    } else if (key === 'require') {
      newExpected = 'commonjs';
    } else if (key.startsWith('.') || key === 'default') {
      newExpected = expected;
    }

    return exportsEntries(child, `${label} > ${key}`, newExpected);
  });
}

/**
 * Node reads a file's module system off its extension first -- .mjs and .cjs
 * settle it outright -- and only for .js falls back to the nearest package.json
 * above it, which is why the build emits one into dist/cjs and dist/es. Mirrors
 * that order, stopping before the root manifest, already parsed as pkg.
 *
 * @param {string} path Path to a declared file, relative to the package root.
 * @returns {'module' | 'commonjs'} The module system that applies to `path`.
 */
function moduleSystem(path) {
  if (path.endsWith('.mjs')) {
    return 'module';
  }

  if (path.endsWith('.cjs')) {
    return 'commonjs';
  }

  for (
    let dir = dirname(join(root, path));
    dir !== root && dir !== dirname(dir);
    dir = dirname(dir)
  ) {
    const manifestFile = join(dir, 'package.json');

    if (existsSync(manifestFile)) {
      const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
      return manifest.type ?? pkgTypeDefault;
    }
  }

  return pkgType;
}

function main() {
  const entries = exportsEntries(pkg.exports);

  const declared = Array.from(
    new Set([
      pkg.main,
      pkg.module,
      pkg.types,
      ...entries.map(([, path]) => path),
    ])
  ).filter(Boolean);

  // Node substitutes a pattern's literal "*" at resolution time: unexpanded,
  // neither existence nor module system can be told. Report, do not fail.
  const wildcards = declared.filter((path) => path.includes('*'));

  if (0 < wildcards.length) {
    console.warn(
      `Warning: wildcard paths are not validated -- skipped\n\n${wildcards
        .map((path, i) => `[${i}] ${path}`)
        .join('\n')}\n`
    );
  }

  const missing = declared.filter(
    (path) => !path.includes('*') && !existsSync(join(root, path))
  );

  if (0 < missing.length) {
    console.error(
      `Found invalid package paths\n\n${missing.map((path, i) => `[${i}] ${path}`).join('\n')}\n`
    );
    process.exitCode = 1;
    return;
  }

  const mismatched = [
    ['main', pkg.main, pkgType],
    ['module', pkg.module, 'module'],
    ...entries,
  ].filter(
    ([, path, expected]) =>
      path && expected && !path.includes('*') && moduleSystem(path) !== expected
  );

  if (0 < mismatched.length) {
    console.error(
      `Found entry paths pointing at the wrong module system\n\n${mismatched
        .map(
          ([label, path, expected]) => `[${label}] ${path} is not ${expected}`
        )
        .join('\n')}\n`
    );
    process.exitCode = 1;
  }
}

main();
