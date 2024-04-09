module.exports = {
  root: true,

  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "preact",
    "plugin:react-hooks/recommended",
  ],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: [
        "plugin:@typescript-eslint/strict-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
      ],
      parserOptions: {
        project: true,
        // eslint-disable-next-line no-undef
        tsconfigRootDir: __dirname,
      },
      rules: {
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
      },
    },
    {
      files: ["*.cjs"],
    },
  ],
  rules: {
    "jest/expect-expect": "off",
    "jest/no-done-callback": "off",
  },
  settings: {
    // We don't use jest, but eslint-config-preact includes it.
    jest: { version: 27 },
  },
};
