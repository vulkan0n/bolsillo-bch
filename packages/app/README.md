# @selene-wallet/app

Join the Cash economy.

Note: This repo is part of the Selene monorepo. Refer to the central documentation for more required information.

[NPM Packages](https://www.npmjs.com/org/selene-wallet)

[Gitlab source](https://gitlab.com/selene.cash/selene-wallet)

## Setup

```
$ npm install
$ npm install --location=global @expo/ngrok@^4.1.0
$ npx expo start
# You will need to have XCode setup to run the iOS simulator
# Press 'i' to open simulator
# Note, you need to ensure you have stable wifi to connect through the tunnel
# Alternatively:
$ npm run ios
$ npm run android

# To run the web version
$ npx expo start --web
```

## Development

```
$ npx tsc # type check

# Fully purge cache and reinstall
$ watchman watch-del-all && rm -rf node_modules && npm install && rm -rf /tmp/metro-* && npm run start --reset-cache
```

## Bridge

In order to run mainnet.cash and other browser JS libraries through React Native, a hacky WebView with the mainnet script `eval`d as a `<script>` tag is implemented. State is all stored on the React Native side (in persisted Redux), and it communicates to the mainnet.cash library through the "Bridge" like it was an external API by using the DeviceEventEmitter to send "emitEvent" methods from components, then forwarded from `App.tsx`, to send messages back and forth.

Note that this has some limitations, as WebView browser doesn't have access to everything a regular browser does.

To watch the console.logs from inside the Bridge, see: https://stackoverflow.com/a/48573345

Bridge actions are driven by the native app, which sends a `BRIDGE_MESSAGE_TYPE` and receives a corresponding paired `RESPONSE_MESSAGE_TYPE`. The only exception is the `RESPONSE_MESSAGE_TYPE.RECEIVED_COINS` which the bridge independently monitors and notifies the main app of unprompted.

## Conventions

This is a BCH standard app. Think in terms of BCH satoshis, stored as strings, then use the formatting and exchange rate helpers. All other exchange rates and balances are transformations of the satoshi value.

Exception: wallet.balance stored as an integer, in satoshis.

Bitcoin denominations are treated as separate currencies with a fixed exchange rate.

Transaction histories are stored in reverse-chronological (descending block height) order.

## Dev Notes

Be careful with using `navigation.reset`, as it can mess around with the loading of the root <Toast> component and cause React to blow up on finding Toast calls with props that are objects (and therefore not renderable) instead of strings. `navigation.reset` is used in `Reset app` to completely purge all data, but should otherwise perhaps be avoided.

## Testing

To run Electron Cash on testnet:

```
$ /Applications/Electron-Cash.app/Contents/MacOS/Electron-Cash --testnet
```

And note that mainnet.cash uses `m/44/0'/0'` for mainnet derivative path and `m/44/1'/0'` for testnet.

# Builds

```
# Ensure packages/app/src/apolloClient.tsx is using PRODUCTION_SERVER

# Update app version on Credits page
# Update app version in `package.json`
# Update `app.json` `version`, bump `ios.buildNumber` & `android.versionCode`
# Update `package.json`s of other other packages, e.g. `@selene-wallet/web` to the new `@selene-wallet/app` version and run `lerna bootstrap` at the root level.
# git commit
# Publish other packages if necessary, e.g. a new version of @selene-wallet common (see root README)
$ npm publish --access=public # Publish `@selene-wallet/app package`

# Android test release build
$ eas build --profile preview --platform android
# Prod build
$ eas build --profile production --platform android
```
