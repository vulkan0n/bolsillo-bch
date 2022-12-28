# @selene-wallet/web

Web frontend for Selene.

Note: This repo is part of the Selene monorepo. Refer to the central documentation for more required information.

## Development

```
$ npm install
# Note that npm start deletes the react and react-dom packages from /node_modules in this package
# This is a hacky workaround while developing to avoid conflicting React versions (breaking hooks)
# with the top level Lerna node_modules also installing react and react-dom
# Lerna's nohoist options and workspaces are still primitive/unintuitive to addressing this issue
# A better fix will be developed eventually
$ npm start
# Available at http://localhost:3000
```
