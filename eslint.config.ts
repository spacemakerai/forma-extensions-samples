import js from "@eslint/js";
import prettier from "eslint-plugin-prettier/recommended";
import hooksPlugin from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    plugins: {
      "react-hooks": hooksPlugin,
    },
    settings: {
      react: {
        version: "18",
      },
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "prettier/prettier": "warn",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/non-nullable-type-assertion-style": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNumber: true,
          allowBoolean: true,
        },
      ],
      ...hooksPlugin.configs.recommended.rules,
      "react/no-unknown-property": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  prettier,
  {
    ignores: ["data-providers/", "**/dist/"],
  },
);
