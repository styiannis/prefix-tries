// For detailed Rollup configuration options, visit: https://rollupjs.org/configuration-options/

import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import fs from 'node:fs';
import { dts } from 'rollup-plugin-dts';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const pkgExternals = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.optionalDependencies || {}),
];

const isExternalModule = (id) =>
  pkgExternals.some((name) => id === name || id.startsWith(`${name}/`));

const makeOutputOptions = (preserveModulesRoot, dir, format, ext) => ({
  dir,
  format,
  preserveModulesRoot,
  preserveModules: true,
  entryFileNames: `[name]${ext}`,
  chunkFileNames: `[name]${ext}`,
  // 'auto' (the default) collapses a default-only module to
  // `module.exports = value`, but the emitted .d.cts always declares it as
  // `export { value as default }` -- i.e. `exports.default`. Forcing
  // 'named' keeps the two in sync for CJS.
  exports: format === 'cjs' ? 'named' : 'auto',
});

const buildJS = (format, srcFile, srcDir, distDir, useExternal) => {
  const outDir = `${distDir}/${format}`;
  const extension = format === 'es' ? '.mjs' : '.cjs';

  return {
    input: srcFile,
    output: makeOutputOptions(srcDir, outDir, format, extension),
    plugins: [
      ...(useExternal ? [] : [resolve()]),
      typescript({ compilerOptions: { outDir } }),
    ],
    external: useExternal ? isExternalModule : undefined,
  };
};

const buildTypes = (format, srcFile, srcDir, distDir, useExternal) => {
  const outDir = `${distDir}/@types/${format}`;
  const extension = format === 'es' ? '.d.mts' : '.d.cts';

  return {
    input: srcFile,
    output: makeOutputOptions(srcDir, outDir, format, extension),
    plugins: [...(useExternal ? [] : [resolve()]), dts()],
    external: useExternal ? isExternalModule : undefined,
  };
};

const srcDir = 'src';
const srcFile = `${srcDir}/index.ts`;
const distDir = 'dist';

// Declared dependencies stay external; false inlines them via resolve().
const useExternal = true;

export default ['cjs', 'es'].flatMap((format) => [
  buildJS(format, srcFile, srcDir, distDir, useExternal),
  buildTypes(format, srcFile, srcDir, distDir, useExternal),
]);
