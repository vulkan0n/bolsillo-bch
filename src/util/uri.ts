import { Decimal } from "decimal.js";
import {
  decodeCashAddress,
  decodeBase58Address,
  decodePrivateKeyWif,
  encodeCashAddress,
  secp256k1,
  CashAddressType,
  assertSuccess,
} from "@bitauth/libauth";
import { sha256, ripemd160 } from "@/util/hash";
import { Haptic } from "@/util/haptic";
import WalletManagerService from "@/services/WalletManagerService";

// validateBchUri: validates all possible BCH URI formats
export function validateBchUri(uri: string) {
  const {
    isBip21,
    isCashAddress,
    isTokenAddress,
    isBase58Address,
    address,
    amount,
  } = validateBip21Uri(uri);

  const { isPaymentProtocol, requestUri } = validatePaymentProtocolUri(uri);

  const wifPayload = validateWifUri(uri);

  const wcPayload = validateWalletConnectUri(uri);

  const isValid =
    isBip21 ||
    isPaymentProtocol ||
    wifPayload.isWif ||
    wcPayload.isWalletConnect;

  const query = new Decimal(amount).greaterThan(0) ? `?amount=${amount}` : "";

  const payload = {
    address,
    amount,
    query,
    requestUri,
    isValid,
    isBip21,
    isCashAddress,
    isTokenAddress,
    isBase58Address,
    isPaymentProtocol,
    ...wifPayload,
    ...wcPayload,
  };

  return payload;
}

// validateBip21Uri: cashaddr, base58 addresses, and bip21 invoices (?amount=)
export function validateBip21Uri(uri: string) {
  const uriSplit = uri.split("?");
  const address = uriSplit[0];

  const queryString = uriSplit[1] || "";
  const searchParams = new URLSearchParams(queryString);
  const amount = searchParams.get("amount") || "0";

  // various providers do stupid things with cashaddr that we must handle.
  // in the wild we've seen:
  // -  addresses with multiple prefixes (bitcoincash:bitcoincash:qz38adf...)
  // -  prefix followed by base58 (bitcoincash:1D3ADB...)
  const addressSplit = address.split(":");

  // always get last item of split, as it's most likely the raw address.
  const noPrefixAddress =
    addressSplit.length > 1 ? addressSplit[addressSplit.length - 1] : address;

  // check if raw address is base58.
  const isBase58Address =
    typeof decodeBase58Address(noPrefixAddress) === "object";

  // only prefix the address if it's cashaddr, not base58.
  // prefix is dependent on currently-connected network (mainnet/chipnet)
  const prefix = WalletManagerService().getPrefix();
  const prefixedAddress = isBase58Address
    ? noPrefixAddress
    : `${prefix}:${noPrefixAddress}`;

  const decodedCashAddress = decodeCashAddress(prefixedAddress);
  const isCashAddress = typeof decodedCashAddress === "object";
  const isTokenAddress =
    isCashAddress &&
    (decodedCashAddress.type === CashAddressType.p2pkhWithTokens ||
      decodedCashAddress.type === CashAddressType.p2shWithTokens);

  const isBip21 = isCashAddress || isBase58Address;

  return {
    isBip21,
    isCashAddress,
    isTokenAddress,
    isBase58Address,
    address: isBip21 ? prefixedAddress : "",
    amount,
  };
}

// validatePaymentProtocolUri: BIP70/JSON Payment Protocol (bitcoincash:?r=https://)
function validatePaymentProtocolUri(uri: string) {
  if (!uri.startsWith("bitcoincash:?r=")) {
    return { isPaymentProtocol: false };
  }

  const requestUri = uri.split("bitcoincash:?r=")[1];
  const decodedUri = decodeURI(requestUri);

  const isPaymentProtocol = decodedUri !== null;

  return { isPaymentProtocol, requestUri: decodedUri };
}

// validateWifUri: Wallet Sweep (CashStamps) (bitcoincash: or bch-wif:)
export function validateWifUri(
  wif: string,
  removePrefixes = ["bitcoincash:", "bch-wif:"]
) {
  // Remove the prefixes from the WIF (if they exist).
  // NOTE: We do this in case the WIF was invoked from a URL handler.
  //       e.g. bitcoincash:someWif or bch-wif:someWif
  const wifWithoutPrefix = removePrefixes.reduce((result, prefix) => {
    return result.startsWith(prefix) ? result.slice(prefix.length) : result;
  }, wif);

  // Attempt to decode the WIF.
  const decodedPrivateKey = decodePrivateKeyWif(wifWithoutPrefix);

  // If a string is returned, this indicates an error...
  if (typeof decodedPrivateKey === "string") {
    return {
      isWif: false,
    };
  }

  // Ensure the Private Key is valid by checking the length (32 bytes = uncompressed private key, 33 bytes = compressed private key).
  // NOTE: This is to work around a LibAuth bug where decodePrivateKeyWif does not verify the version of the Base58 string.
  //       This means that we will get a false positive on Base58/Legacy addresses as being valid WIFs.
  //       Once the below PR is merged into LibAuth (and we've updated to the new version), we can remove the following code.
  //       https://github.com/bitauth/libauth/pull/147
  const isValidPrivateKey =
    decodedPrivateKey.privateKey.length === 32 ||
    decodedPrivateKey.privateKey.length === 33;

  // If it is not a valid private key, then it is not a WIF,
  if (!isValidPrivateKey) {
    return {
      isWif: false,
    };
  }

  // Attempt to derive the public key.
  const publicKey = secp256k1.derivePublicKeyCompressed(
    decodedPrivateKey.privateKey
  );

  // If a string is returned, this indicates an error...
  if (typeof publicKey === "string") {
    return {
      isWif: false,
    };
  }

  // SHA256 and then RIPDEMD160 the Public Key.
  const payload = ripemd160.hash(sha256.hash(publicKey));

  // Encode the Public Key as an address (so that we can look up the UTXOs).
  const { address } = assertSuccess(
    encodeCashAddress({
      prefix: "bitcoincash",
      type: CashAddressType.p2pkh,
      payload,
    })
  );

  return {
    isWif: true,
    wif: wifWithoutPrefix,
    address,
    privateKey: decodedPrivateKey.privateKey,
  };
}

// validateWalletConnectUri: Wallet Connect (wc:)
export function validateWalletConnectUri(uri: string) {
  const parsedUri = URL.parse(uri);
  if (parsedUri === null) {
    return {
      isWalletConnect: false,
    };
  }

  const { protocol } = parsedUri;

  if (protocol !== "wc:") {
    return {
      isWalletConnect: false,
    };
  }

  return {
    isWalletConnect: true,
    wcUri: parsedUri.href,
  };
}

// navigateOnValidUri: maps URI handlers to app routes
export const navigateOnValidUri = async (
  input: string
): Promise<{ navTo: string; navState: object; isTokenAddress: boolean }> => {
  // go to send screen when valid address is entered
  const {
    isValid,
    isTokenAddress,
    isWalletConnect,
    isPaymentProtocol,
    isWif,
    address,
    query,
    requestUri,
    wif,
    wcUri,
  } = validateBchUri(input);

  let navTo = "";
  let navState;

  if (isValid) {
    await Haptic.success();

    if (isWalletConnect) {
      navTo = `/apps/walletconnect`;
      navState = { wcUri };
    } else if (isPaymentProtocol) {
      navTo = `/wallet/pay/?r=${requestUri}`;
    } else if (isWif) {
      navTo = `/wallet/sweep/${wif}`;
    } else {
      navTo = `/wallet/send/${address}${query}`;
    }
  } else {
    await Haptic.error();
  }

  return { navTo, navState, isTokenAddress };
};
