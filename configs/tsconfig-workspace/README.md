# TypeScript Config

This package provides some shared TypeScript configurations for all projects in the workspace.

## Usage

```bash
yarn add tsconfig-workspace 'typescript@*' --dev
```

Then, add the following to your `tsconfig.json`:

```json5
{
  "extends": "tsconfig-workspace",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"] // Optional path mappings
    }
  },
  "include": [
    "**/*.ts"
  ]
}
```
