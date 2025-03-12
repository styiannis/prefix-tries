import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import fs from 'node:fs';
import { dts } from 'rollup-plugin-dts';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

function output(preserveModulesRoot, dir, format) {
  return { dir, format, preserveModulesRoot, preserveModules: true };
}

function external() {
  const externalModules = (externals) =>
    0 === externals.length
      ? () => false
      : (id) => new RegExp(`^(${externals.join('|')})($|/)`).test(id);

  return externalModules([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
  ]);
}

function CJS(input, srcDir, distDir, useExternal) {
  const format = 'cjs';
  const outDir = `${distDir}/${format}`;

  return {
    input,
    output: output(srcDir, outDir, format),
    plugins: [resolve(), typescript({ compilerOptions: { outDir } })],
    external: useExternal ? external() : undefined,
  };
}

function ES(input, srcDir, distDir, useExternal) {
  const format = 'es';
  const outDir = `${distDir}/${format}`;

  return {
    input,
    output: output(srcDir, outDir, format),
    plugins: [resolve(), typescript({ compilerOptions: { outDir } })],
    external: useExternal ? external() : undefined,
  };
}

function Types(input, srcDir, distDir, useExternal) {
  const format = 'es';
  const outDir = `${distDir}/@types`;

  return {
    input,
    output: output(srcDir, outDir, format),
    plugins: [resolve(), typescript({ compilerOptions: { outDir } }), dts()],
    external: useExternal ? external() : undefined,
  };
}

const srcDir = 'src';
const distDir = 'dist';
const inputFile = `${srcDir}/index.ts`;

export default [
  CJS(inputFile, srcDir, distDir, true),
  ES(inputFile, srcDir, distDir, true),
  Types(inputFile, srcDir, distDir, true),
];
