# Selene Wallet

Join the Cash economy

## Setup

```
$ npm install
$ npm install --location=global @expo/ngrok@^4.1.0
$ expo start
# You will need to have XCode setup to run the iOS simulator
# Press 'i' to open simulator
# Note, you need to ensure you have stable wifi to connect through the tunnel
```

## Bridge

In order to run mainnet.cash and other browser JS libraries through React Native, a hacky WebView with the mainnet script `eval`d as a `<script>` tag is implemented. State is all stored on the React Native side (in persisted Redux), and it communicates to the mainnet.cash library through the "Bridge" like it was an external API by using the "emit" method to send messages back and forth.

Note that this has some limitations, as WebView browser doesn't have access to everything a regular browser does.

To watch the console.logs from inside the Bridge, see: https://stackoverflow.com/a/48573345

## Conventions

This is a BCH standard app. Think in terms of BCH satoshis, stored as strings, then use the formatting and exchange rate helpers. All other exchange rates and balances are transformations of the satoshi value.
