import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import packageJson from "./package.json" assert { type: 'json' };

export default [
	{
		input: "src/index.ts",
		output: [
			{
				file: packageJson.main,
				format: "cjs",
				sourcemap: true,
			},
			{
				file: packageJson.module,
				format: "esm",
				sourcemap: true,
			},
		],
		plugins: [
			resolve({
				extensions: [".js", ".jsx", ".ts", ".tsx"],
				skip: ["react", "react-dom"],
			}),
			commonjs(),
			typescript({
				tsconfig: "./tsconfig.json"
			}),
		],
		external: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "datatables.net", "jquery"],
	},
	{
		input: "dist/types/index.d.ts",
		output: [{ file: "dist/index.d.ts", format: "esm" }],
		plugins: [dts()],
	},
];
