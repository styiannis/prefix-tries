import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import fs from 'node:fs';
import { dts } from 'rollup-plugin-dts';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

function emitPackageManifest(type) {
  const sideEffects =
    typeof pkg.sideEffects === 'boolean' ? pkg.sideEffects : true;

  return {
    name: 'emit-package-manifest',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'package.json',
        source: `${JSON.stringify({ type, sideEffects }, null, 2)}\n`,
      });
    },
  };
}

function external() {
  const externalModules = (externals) =>
    externals.length === 0
      ? () => false
      : (id) => new RegExp(`^(${externals.join('|')})($|/)`).test(id);

  return externalModules([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
  ]);
}

function output(preserveModulesRoot, dir, format) {
  return { dir, format, preserveModulesRoot, preserveModules: true };
}

function CJS(input, srcDir, distDir, useExternal) {
  const format = 'cjs';
  const outDir = `${distDir}/${format}`;

  return {
    input,
    output: output(srcDir, outDir, format),
    plugins: [
      ...(useExternal ? [] : [resolve()]),
      typescript({ compilerOptions: { outDir } }),
      emitPackageManifest('commonjs'),
    ],
    external: useExternal ? external() : undefined,
  };
}

function ES(input, srcDir, distDir, useExternal) {
  const format = 'es';
  const outDir = `${distDir}/${format}`;

  return {
    input,
    output: output(srcDir, outDir, format),
    plugins: [
      ...(useExternal ? [] : [resolve()]),
      typescript({ compilerOptions: { outDir } }),
      emitPackageManifest('module'),
    ],
    external: useExternal ? external() : undefined,
  };
}

function Types(input, srcDir, distDir, useExternal) {
  const format = 'es';
  const outDir = `${distDir}/@types`;

  return {
    input,
    output: output(srcDir, outDir, format),
    plugins: [...(useExternal ? [] : [resolve()]), dts()],
    external: useExternal ? external() : undefined,
  };
}

const BUILDERS = { cjs: CJS, es: ES, types: Types };
const ALL_BUILD_FORMATS = Object.keys(BUILDERS);

const formats = (process.env.BUILD_FORMATS ?? ALL_BUILD_FORMATS.join(','))
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

if (formats.length === 0) {
  throw new Error(
    `BUILD_FORMATS: at least one of "${ALL_BUILD_FORMATS.join(', ')}" is required.`
  );
}

const unknownFormats = process.env.BUILD_FORMATS
  ? formats.filter((f) => !ALL_BUILD_FORMATS.includes(f))
  : [];

if (unknownFormats.length > 0) {
  throw new Error(
    `BUILD_FORMATS: unknown format(s) "${unknownFormats.join(', ')}". Valid: ${ALL_BUILD_FORMATS.join(', ')}.`
  );
}

const srcDir = 'src';
const distDir = 'dist';
const inputFile = `${srcDir}/index.ts`;

// Declared dependencies stay external;
// false inlines them via resolve().
const useExternal = true;

export default formats.map((f) =>
  BUILDERS[f](inputFile, srcDir, distDir, useExternal)
);
