import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      typescript({ tsconfig: './tsconfig.prod.json' }),
      resolve(),
      commonjs(),
    ],
  },

  // CommonJS Build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      typescript({ tsconfig: './tsconfig.prod.json' }),
      resolve(),
      commonjs(),
    ],
  },

  // UMD Build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'IalopezgDB',
      sourcemap: true,
    },
    plugins: [
      typescript({ tsconfig: './tsconfig.prod.json' }),
      resolve(),
      commonjs(),
    ],
  },
];
