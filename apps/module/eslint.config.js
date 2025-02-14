import baseConfig from "@aklive2d/eslint-config";
/** @type {import('eslint').Config} */
export default [
    ...baseConfig,
    { ignores: ['src/libs/*'] },
];