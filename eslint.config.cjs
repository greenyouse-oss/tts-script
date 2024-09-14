const js = require("@eslint/js")
const typescriptParser = require("@typescript-eslint/parser")
const typescriptPlugin = require("@typescript-eslint/eslint-plugin")
const prettierPlugin = require("eslint-plugin-prettier")

module.exports = [
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    ignores: ["node_modules/", "dist/", "eslint.config.js", ".prettierrc.js"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescriptPlugin.configs.recommended.rules,
      "prettier/prettier": "error",
    },
  },
]
