// Loads dist/cjs via require() and dist/es via import() on whichever Node
// version invokes it. The barrel re-exports the whole graph, so loading it
// parses every module.
//
// Scoped to dist/ only, no config or "exports" map: only built formats load,
// so pruning a format needs no edit here.

const { existsSync } = require('node:fs');
const { join } = require('node:path');
const { pathToFileURL } = require('node:url');

const root = join(__dirname, '..');

// Declarations get no loader -- they do not exist at runtime.
const formats = [
  { dir: 'dist/@types/es', entry: 'index.d.mts', loader: null },
  { dir: 'dist/@types/cjs', entry: 'index.d.cts', loader: null },
  {
    dir: 'dist/es',
    entry: 'index.mjs',
    loader: (path) => import(pathToFileURL(path).href),
  },
  { dir: 'dist/cjs', entry: 'index.cjs', loader: (path) => require(path) },
];

function selectBuiltFormats() {
  // The directory, not the entry file: a pruned format leaves no directory at
  // all, while one that exists but holds no barrel is a build that went wrong
  // -- reported per format further down, not treated as "not built".
  const built = formats.filter(({ dir }) => existsSync(join(root, dir)));

  if (built.length === 0) {
    console.error(
      `Nothing was built: none of ${formats.map((f) => f.dir).join(', ')}\n` +
        `exists. Run "npm run build" before this step.`
    );
    process.exitCode = 1;
  }

  return built;
}

async function loadFormats(built) {
  for (const { dir, entry, loader } of built) {
    const path = join(root, dir, entry);

    if (!existsSync(path)) {
      // The build always emits this entry when the format's directory exists
      // (rollup.config.mjs feeds every format the same src/index.ts input),
      // so a missing one means a build that failed partway, not a valid state.
      console.error(`${dir}/ holds no ${entry} -- nothing to load`);
      process.exitCode = 1;
      continue;
    }

    const namespace = loader ? await loader(path) : null;

    // Empty is usually a forgotten src/index.ts, though a package may legitimately
    // route everything through subpaths. The typeof guard excludes a default-only
    // barrel (`module.exports = fn`), whose Object.keys() is empty but valid.
    if (
      namespace &&
      typeof namespace !== 'function' &&
      Object.keys(namespace).length === 0
    ) {
      console.warn(
        `Warning: ${dir}/${entry} exports nothing -- check src/index.ts`
      );
    }
  }
}

const builtFormats = selectBuiltFormats();

loadFormats(builtFormats)
  .then(() => {
    if (!process.exitCode) {
      console.log(
        `${builtFormats.length} built formats ok: ${builtFormats
          .map(({ dir }) => dir)
          .join(', ')}`
      );
    }
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
