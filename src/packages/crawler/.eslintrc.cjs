module.exports = {
  extends: ['@fw/eslint-config/typescript'],
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['import'],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
};

