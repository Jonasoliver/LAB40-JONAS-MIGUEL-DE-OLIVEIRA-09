// Configuração do ESLint (flat config) sem dependências além do próprio eslint.
const nodeGlobals = {
  require: "readonly",
  module: "writable",
  exports: "writable",
  __dirname: "readonly",
  __filename: "readonly",
  process: "readonly",
  console: "readonly",
  Buffer: "readonly",
  URL: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  fetch: "readonly",
};

const browserGlobals = {
  window: "readonly",
  document: "readonly",
  fetch: "readonly",
  console: "readonly",
  alert: "readonly",
  localStorage: "readonly",
};

const regras = {
  "no-undef": "error",
  "no-unused-vars": ["error", { args: "after-used", caughtErrors: "none" }],
  "no-unreachable": "error",
  "no-dupe-keys": "error",
  "no-redeclare": "error",
  "no-self-compare": "error",
  "no-constant-condition": "error",
  "no-empty": "error",
  "no-eval": "error",
  "no-implied-eval": "error",
  "no-new-func": "error",
  eqeqeq: ["error", "always"],
  "prefer-const": "error",
  "no-var": "error",
};

module.exports = [
  { ignores: ["node_modules/**", "coverage/**"] },
  {
    files: [
      "src/**/*.js",
      "test/**/*.js",
      "scripts/**/*.js",
      "eslint.config.js",
    ],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      globals: nodeGlobals,
    },
    rules: regras,
  },
  {
    files: ["public/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "script",
      globals: browserGlobals,
    },
    rules: regras,
  },
];
