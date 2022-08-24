# Selene Wallet

Join the Cash economy.

## Setup

```
$ npm install
$ npm install --location=global @expo/ngrok@^4.1.0
$ expo start
# You will need to have XCode setup to run the iOS simulator
# Press 'i' to open simulator
# Note, you need to ensure you have stable wifi to connect through the tunnel
# Alternatively:
$ npm run ios
$ npm run android
```

## Development

```
$ npx tsc # type check
```

## Bridge

In order to run mainnet.cash and other browser JS libraries through React Native, a hacky WebView with the mainnet script `eval`d as a `<script>` tag is implemented. State is all stored on the React Native side (in persisted Redux), and it communicates to the mainnet.cash library through the "Bridge" like it was an external API by using the DeviceEventMitter to send "emitEvent" methods from components, then forwarded from `App.tsx`, to send messages back and forth.

Note that this has some limitations, as WebView browser doesn't have access to everything a regular browser does.

To watch the console.logs from inside the Bridge, see: https://stackoverflow.com/a/48573345

Bridge actions are driven by the native app, which sends a `BRIDGE_MESSAGE_TYPE` and receives a corresponding paired `RESPONSE_MESSAGE_TYPE`. The only exception is the `RESPONSE_MESSAGE_TYPE.RECEIVED_COINS` which the bridge independently monitors and notifies the main app of unprompted.

## Conventions

This is a BCH standard app. Think in terms of BCH satoshis, stored as strings, then use the formatting and exchange rate helpers. All other exchange rates and balances are transformations of the satoshi value.

Bitcoin denominations are treated as separate currencies with a fixed exchange rate.

## Testing

To run Electron Cash on testnet:

```
$ /Applications/Electron-Cash.app/Contents/MacOS/Electron-Cash --testnet
```

And note that mainnet.cash uses `m/44/0'/0'` for mainnet derivative path and `m/44/1'/0'` for testnet.

# Builds

```
# Update app version number on Credits page
# Update `app.json`, `version` and `runtimeVersion`
# git commit
$ eas build
# Wait 20 minutes for build to finish
$ eas update --auto
```
