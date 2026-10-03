// Loads dist/cjs via require() and dist/es via import() on whichever Node
// version invokes it. The barrel re-exports the whole graph, so loading it
// parses every module. Scoped to dist/ only, no config or "exports" map: only
// built formats load, so pruning a format needs no edit here.

const { existsSync } = require('node:fs');
const { join } = require('node:path');
const { pathToFileURL } = require('node:url');

const root = join(__dirname, '..');

const formatEntries = [
  {
    path: 'dist/es/index.mjs',
    loader: (path) => import(pathToFileURL(path).href),
  },
  { path: 'dist/cjs/index.cjs', loader: (path) => require(path) },
];

function exportsNothing(namespace) {
  // Empty usually means a forgotten src/index.ts, but exporting only subpaths is
  // valid. Nullish counts as empty (a factory returning nothing); a function
  // does not: `module.exports = fn` has no keys but works.
  return (
    !namespace ||
    (typeof namespace !== 'function' && Object.keys(namespace).length === 0)
  );
}

function selectBuiltFormats(formats) {
  const present = formats.filter(({ path }) => existsSync(join(root, path)));

  if (present.length === 0) {
    const paths = formats.map(({ path }) => path).join(', ');

    console.error(
      `Nothing was built: none of ${paths} exists.\nRun "npm run build" before this step.`
    );

    process.exitCode = 1;
  }

  return present;
}

async function loadFormats(built) {
  const problems = [];
  const warnings = [];
  const report = [];

  for (const { path, loader } of built) {
    const file = join(root, path);

    let namespace;

    try {
      namespace = await loader(file);
    } catch (error) {
      problems.push(`${path} threw: ${error?.message ?? error}`);
      continue;
    }

    report.push(`${path} loads`);

    if (exportsNothing(namespace)) {
      warnings.push(`${path} exports nothing -- check src/index.ts`);
    }
  }

  return { problems, warnings, report };
}

const builtFormats = selectBuiltFormats(formatEntries);

loadFormats(builtFormats)
  .then(({ problems, warnings, report }) => {
    if (problems.length > 0) {
      console.error(
        `Distribution files do not load correctly\n\n${problems
          .map((line, i) => `[${i + 1}] ${line}`)
          .join('\n')}\n`
      );
      process.exitCode = 1;
      return;
    }

    if (warnings.length > 0) {
      console.warn(
        `Warnings\n${warnings
          .map((line, i) => `[${i + 1}] ${line}`)
          .join('\n')}\n`
      );
    }

    if (!process.exitCode) {
      console.log(
        `${report.length} built formats ok\n${report
          .map((line, i) => `[${i + 1}] ${line}`)
          .join('\n')}`
      );
    }
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
