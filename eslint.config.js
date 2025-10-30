import js from '@eslint/js';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import tseslint from 'typescript-eslint';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import nextPlugin from '@next/eslint-plugin-next';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';

const projectFilePatterns = ['**/*.{js,jsx,ts,tsx}'];
const tsFilePatterns = ['**/*.{ts,tsx,cts,mts}'];
const testFilePatterns = [
  '**/*.{test,spec}.{ts,tsx}',
  'test/**/*.{ts,tsx}',
  '**/__tests__/**/*.{ts,tsx}',
];
const nodeConfigFilePatterns = [
  '**/*.config.{js,ts,mjs,cjs}',
  '**/.eslintrc.{js,ts,cjs,mjs}',
  '**/.stylelintrc.{js,ts,cjs,mjs}',
  'next.config.mjs',
  'postcss.config.mjs',
  'eslint.config.js',
];

const typeScriptConfigs = tseslint.configs.recommended.map((config) => ({
  ...config,
  files: tsFilePatterns,
}));

const reactConfig = {
  ...reactRecommended,
  files: ['**/*.{jsx,tsx}'],
  languageOptions: {
    ...reactRecommended.languageOptions,
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
  settings: {
    ...reactRecommended.settings,
    react: {
      ...reactRecommended.settings?.react,
      version: 'detect',
    },
  },
  rules: {
    ...reactRecommended.rules,
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};

const reactJsxRuntimeConfig = {
  ...reactJsxRuntime,
  files: ['**/*.{jsx,tsx}'],
};

const reactHooksConfig = {
  ...reactHooks.configs['recommended-latest'],
  files: projectFilePatterns,
};

const jsxA11yConfig = {
  name: 'jsx-a11y/accessibility',
  files: projectFilePatterns,
  plugins: {
    'jsx-a11y': jsxA11y,
  },
  rules: {
    'jsx-a11y/alt-text': [
      'warn',
      {
        elements: ['img'],
        img: ['Image'],
      },
    ],
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-proptypes': 'warn',
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn',
  },
};

const jsRecommended = {
  ...js.configs.recommended,
  files: ['**/*.{js,jsx}'],
};

const jsonRecommended = {
  ...json.configs.recommended,
  files: ['**/*.json'],
  language: 'json/json',
};

const projectLanguageOptions = {
  name: 'project/language-options',
  files: projectFilePatterns,
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
};

const customTypeScriptRules = {
  name: 'typescript/custom-rules',
  files: tsFilePatterns,
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
};

const vitestConfig = {
  name: 'tests/vitest',
  files: testFilePatterns,
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.vitest,
    },
  },
};

const nodeConfigFiles = {
  name: 'node/config-files',
  files: nodeConfigFilePatterns,
  languageOptions: {
    sourceType: 'module',
    globals: {
      ...globals.node,
    },
  },
};

export default [
  {
    name: 'ignores',
    ignores: [
      '.next/',
      '.vercel/',
      'coverage/',
      'dist/',
      'out/',
      'build/',
      'node_modules/',
      'public/',
      'pnpm-lock.yaml',
      'tsconfig.tsbuildinfo',
      '**/generated/**',
    ],
  },
  jsRecommended,
  ...typeScriptConfigs,
  projectLanguageOptions,
  reactConfig,
  reactJsxRuntimeConfig,
  reactHooksConfig,
  jsxA11yConfig,
  nextPlugin.flatConfig.coreWebVitals,
  jsonRecommended,
  ...markdown.configs.recommended,
  customTypeScriptRules,
  vitestConfig,
  nodeConfigFiles,
  prettier,
];
