# Selene

Software to make Bitcoin Cash (BCH) the global reserve currency.

- `@selene/app`: iOS/Android React Native wallet application in Expo.
- `@selene/common`: Shared utilities and code. NOTE that `@selene/web` has to import files from other packages directly, rather than from the default export. This is some kind of webpack or CommonJS issue, but hasn't been solved yet.
- `@selene/server`: Backend code and stat tracking.
- `@selene/web`: React app for web frontend.

See README in each package for futher information.

## Tips

If starting app from Expo window is giving error:

```
iOS Bundling failed 19ms
Unable to resolve "../../App" from "node_modules/expo/AppEntry.js"
```

Make sure you are running `npx expo start` from inside `$ selene-wallet/packages/app` and not `$ selene-wallet` root!
