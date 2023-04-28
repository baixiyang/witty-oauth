module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  overrides: [],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': ['warn', {
      singleQuote: true
    }],
    'vue/multi-word-component-names': 0,
    '@typescript-eslint/no-unused-vars': 'off',
    // html 缩进
    'vue/html-indent': 'off',
    // 模板里组件名称：驼峰，与文件名保持一致
    'vue/component-name-in-template-casing': ['error', 'PascalCase', { registeredComponentsOnly: false }],
    // 属性不使用连字符，与属性定义保持一致
    'vue/attribute-hyphenation': ['error', 'never'],
    // v-bind="$attrs" 和 inheritAttrs 不能重复使用
    'vue/no-duplicate-attr-inheritance': 'error',
    // @click="funcA" 不需要写括号，除非有参数
    'vue/v-on-function-call': 'error',

  },
};
