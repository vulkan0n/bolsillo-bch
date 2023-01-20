// https://github.com/inokawa/react-native-react-bridge#expo
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const updatedConfig = {
  ...config,
  transformer: {
    ...config.transformer,
    babelTransformerPath: require.resolve(
      "react-native-react-bridge/lib/plugin"
    ),
  },
  resolver: {
    ...config.resolver,
    alias: {
      // https://mainnet.cash/tutorial/shipping-mainnet.html#configuring-webpack
      // mainnet-js
      // Substituting react-native-tcp-socket for net / tls
      stream: require.resolve("stream-browserify"), // bip39
      crypto: require.resolve("crypto-browserify"), // bip39
      net: require.resolve("react-native-tcp-socket"), // electrum-cash tcp connections
      tls: require.resolve("react-native-tcp-socket"), // electrum-cash tcp connections
      fs: require.resolve("react-native-tcp-socket"), // qrcode-svg.save
    },
    // Allow local use of yalc without messing up the build pipeline
    blacklistRE: exclusionList([/.yalc\/.*/]),
  },
  // To fix an issue with metro caching of @babel/runtime
  // https://github.com/facebook/react-native/issues/27712#issuecomment-715780864
  watchFolders: [`${__dirname}/../..`],
};

// https://github.com/apollographql/apollo-client/issues/9194#issuecomment-1000850769
updatedConfig.resolver.sourceExts.push("cjs");

module.exports = updatedConfig;
