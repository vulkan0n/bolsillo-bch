# `@selene-wallet/common`

Shared functions and utilities for other BCH libraries.

Note: This repo is part of the Selene monorepo. Refer to the central documentation for more required information.

## Dev

After any changes, need to compile to Typescript

```
$ rm -rf ./dist && npx tsc --noEmit false --outDir ./dist
```

Then to include it in other libraries:

Log in to `https://www.npmjs.com`.

```
$ npm publish --access=public
```

Update the `package.json` files of other packages (`app, web`), and reinstall their node packages to grab latest common.
