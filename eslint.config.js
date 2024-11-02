import globals from 'globals'

export default [
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'space-before-function-paren': 'off',
      'max-len': ['error', 80],
      'max-lines': ['error', 150]
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        defineNuxtConfig: true,
        useRoute: true,
        useRouter: true,
        onMounted: true,
        ref: true,
        computed: true,
        useRuntimeConfig: true,
        watch: true
      }
    },
    ignores: ['.nuxt/*']
  }
]
