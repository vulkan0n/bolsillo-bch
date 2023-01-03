# @selene-wallet/app

Join the Cash economy.

Note: This repo is part of the Selene monorepo. Refer to the central documentation for more required information.

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
$ npm test # Run jest tests once
$ npm test-watch # Watch tests while developing

# Fully purge cache and reinstall
$ watchman watch-del-all && rm -rf node_modules && npm install && rm -rf /tmp/metro-* && npm run start --reset-cache
```

## Bridge

In order to run mainnet.cash and other browser JS libraries through React Native, a hacky WebView with the mainnet script `eval`d as a `<script>` tag is implemented. State is all stored on the React Native side (in persisted Redux), and it communicates to the mainnet.cash library through the "Bridge" like it was an external API by using the DeviceEventEmitter to send "emitEvent" methods from components, then forwarded from `App.tsx`, to send messages back and forth.

Note that this has some limitations, as WebView browser doesn't have access to everything a regular browser does.

To watch the console.logs from inside the Bridge, see: https://stackoverflow.com/a/48573345

Bridge actions are driven by the native app, which sends a `BRIDGE_MESSAGE_TYPE` and receives a corresponding paired `RESPONSE_MESSAGE_TYPE`.

Note also that sometimes making code changes to code running inside the bridge won't actually be reflected in the iOS simulator, even after refreshing / reloading the app, or even uninstalling and reinstalling Expo itself. Instead, try and restart the entire computer - and note that when Selene expo app is restarted it will do a "Building JavaScript bundle... 1%" right from 0% over about 30 seconds. That will include any changes just made to bridge code. Alternatively, use the "Erase All Content and Settings" option in XCode, and then rescan any wallets you were using once Expo and the app have been reloaded.

## Conventions

This is a BCH standard app. Think in terms of BCH satoshis, stored as strings, then use the formatting and exchange rate helpers. All other exchange rates and balances are transformations of the satoshi value.

Bitcoin denominations are treated as separate currencies with a fixed exchange rate.

Transaction histories are stored in reverse-chronological (descending block height) order.

"Coins" and "UTXOs" are sometimes used interchangeably, so be aware of that. Mainnet.cash tends to think of them as "Coins", but Selene sometimes calls them "UTXOs" instead.

Mainnet.cash "wallets", aka on the non-app side of the bridge, are not the same as "Selene Wallets". Mainnet wallets use only a single BCH address, and individually treat each BCH address at each index derived from the same seed as a separate wallet with attached UTXOs. To mimic an HD wallet, Selene aggregates those addresses into a single "Selene Wallet", and provides helper methods to extract the next available deposit address (first address with no balance or transaction history), count the outstanding number of UTXOs, sum the UTXO set to get a total wallet balance and so on.

## Dev Notes

Be careful with using `navigation.reset`, as it can mess around with the loading of the root <Toast> component and cause React to blow up on finding Toast calls with props that are objects (and therefore not renderable) instead of strings. `navigation.reset` is used in `Reset app` to completely purge all data, but should otherwise perhaps be avoided.

For performance reasons, .getHistory() calls are only used up to 100 transactions at this point. This could be improved with some pagination or queueing for addresses with more transactions but in general proper fresh address use should mean 99.9% of addresses do not fall into the category of 100+ transactions. The app will report incomplete histories for addresses with hundreds of transactions (or more).

### Upgrading mainnet.cash

Update the `mainnet-js` package in `package.json`, and don't forget to also update to the same version in `src/config/preloadMainNetScript`.

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
