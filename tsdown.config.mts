import { defineConfig } from 'tsdown';

const external = [
	'react',
	'react-dom',
	'react-dom/client',
	'react/jsx-runtime',
	'datatables.net',
	'jquery'
];

export default defineConfig([
	// 1. ESM bundle + ESM types (dist/index.mjs + dist/index.d.mts)
	{
		entry: ['./src/index.ts'],
		format: ['esm'],
		outDir: 'dist',
		clean: true,
		dts: true,
		sourcemap: true,
		deps: {
			neverBundle: external
		},
		outExtensions: () => ({
			js: '.mjs',
			dts: '.d.mts'
		}),
		publint: true,
	    attw: { profile: 'node16' },
	},

	// 2. CJS bundle + CJS types (dist/index.js + dist/index.d.ts)
	{
		entry: {
			index: './src/index.cjs.ts'
		},
		format: ['cjs'],
		outDir: 'dist',
		clean: false,
		dts: true,
		sourcemap: true,
		deps: {
			neverBundle: external
		},
		outExtensions: () => ({
			js: '.js',
			dts: '.d.ts'
		})
	}
]);
