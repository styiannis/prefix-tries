// Checks the paths package.json declares -- "exports", plus the legacy "main",
// "module" and "types" -- against what the build actually produced: that each
// one exists, and that it names the right kind of file for the condition it
// sits under.

const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');

const defaultPkgType = 'commonjs';

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const pkgType = pkg.type ?? defaultPkgType;

function exportsEntries(node, label = 'exports', expected = pkgType) {
  if (!node) {
    return [];
  }

  if (typeof node === 'string') {
    return [{ label, path: node, expected }];
  }

  return Object.entries(node).flatMap(([key, child]) => {
    // "import"/"require" settle the module system; a subpath, "default" or
    // "types" key inherits it. Any other condition -- "browser", "worker", a
    // bundler's own -- settles nothing, so leaves under it keep null and are
    // checked for existence only.
    let newExpected = null;

    if (key === 'import') {
      newExpected = 'module';
    } else if (key === 'require') {
      newExpected = 'commonjs';
    } else if (key.startsWith('.') || key === 'default' || key === 'types') {
      newExpected = expected;
    }

    return exportsEntries(child, `${label} > ${key}`, newExpected);
  });
}

function checkModuleSystemMatches(entries) {
  const mismatched = [
    { label: 'main', path: pkg.main, expected: pkgType },
    { label: 'module', path: pkg.module, expected: 'module' },
    // "types" is the fallback for resolvers that ignore "exports"; those same
    // resolvers follow "main", so it has to describe main's format, not
    // module's.
    { label: 'types', path: pkg.types, expected: pkgType },
    ...entries,
  ].filter(
    ({ path, expected }) =>
      path &&
      expected &&
      !path.includes('*') &&
      // Extension is the only signal used: the build emits .mjs/.cjs and
      // .d.mts/.d.cts exclusively, so it always settles. A plain .js would
      // need the nearest package.json's "type" instead -- deliberately not
      // handled, since nothing here produces one.
      (path.endsWith('.mjs') || path.endsWith('.mts')
        ? 'module'
        : 'commonjs') !== expected
  );

  if (mismatched.length === 0) {
    return;
  }

  console.error(
    `Found entry paths pointing at the wrong module system\n\n${mismatched
      .map(
        ({ label, path, expected }) => `[${label}] ${path} is not ${expected}`
      )
      .join('\n')}\n`
  );

  process.exitCode = 1;
}

function checkPathsExist(paths) {
  const missing = paths.filter(
    (path) => path && !path.includes('*') && !existsSync(join(root, path))
  );

  if (missing.length === 0) {
    return;
  }

  console.error(
    `Found invalid package paths\n\n${missing.map((path, i) => `[${i}] ${path}`).join('\n')}\n`
  );

  process.exitCode = 1;
}

function warnOnWildcardPaths(paths) {
  // Node substitutes a pattern's literal "*" at resolution time: unexpanded,
  // neither existence nor module system can be told. Report, do not fail.
  const wildcards = paths.filter((p) => p.includes('*'));

  if (wildcards.length > 0) {
    console.warn(
      `Warning: wildcard paths are not validated -- skipped\n\n${wildcards
        .map((path, i) => `[${i}] ${path}`)
        .join('\n')}\n`
    );
  }
}

const exportsPathEntries = exportsEntries(pkg.exports);

const declaredPaths = Array.from(
  new Set([
    pkg.source,
    pkg.main,
    pkg.module,
    pkg.types,
    ...exportsPathEntries.map(({ path }) => path),
  ])
).filter(Boolean);

warnOnWildcardPaths(declaredPaths);

checkPathsExist(declaredPaths);
checkModuleSystemMatches(exportsPathEntries);

if (!process.exitCode) {
  // Wildcards are counted out: they were skipped, not checked.
  const checked = declaredPaths.filter((path) => !path.includes('*'));

  console.log(`${checked.length} declared paths ok`);
}
