module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    souceType: 'module',
  },
  env: { node: true },
  extends: 'standard',
  plugins: [
    'promise',
    'node',
    'import',
  ],
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'comma-dangle': ['error', 'always-multiline'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
  }
}
