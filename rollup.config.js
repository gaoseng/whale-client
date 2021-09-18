import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/index.ts",
  output: {
    file: "lib/bundle.js",
    format: "cjs",
  },
  plugins: [
    resolve(),
    typescript(/*{ plugin options }*/),
    babel({
      exclude: "node_modules/**", // 只编译我们的源代码
      extensions: [".js", ".ts"],
    }),
  ],
};
