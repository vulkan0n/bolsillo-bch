import { Decimal } from "decimal.js";
import {
  decodeCashAddress,
  decodeBase58Address,
  decodePrivateKeyWif,
  encodeCashAddress,
  secp256k1,
} from "@bitauth/libauth";
import { sha256, ripemd160 } from "@/util/hash";

export function validateBchUri(uri) {
  const { isBip21, isCashAddress, isBase58Address, address, amount } =
    validateBip21Uri(uri);
  const { isPaymentProtocol, requestUri } = validatePaymentProtocolUri(uri);
  const wifPayload = validateWifUri(uri);

  const isValid = isBip21 || isPaymentProtocol;
  const query = new Decimal(amount).greaterThan(0) ? `?amount=${amount}` : "";

  return {
    address,
    amount,
    query,
    requestUri,
    isValid,
    isCashAddress,
    isBase58Address,
    isPaymentProtocol,
    ...wifPayload,
  };
}

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
  const hash160 = ripemd160.hash(sha256.hash(publicKey));

  // Encode the Public Key as an address (so that we can look up the UTXOs).
  const address = encodeCashAddress("bitcoincash", "p2pkh", hash160);

  return {
    isWif: true,
    wif: wifWithoutPrefix,
    address,
    privateKey: decodedPrivateKey.privateKey,
  };
}

function validatePaymentProtocolUri(uri) {
  const requestMatch = uri.match(/(?:r=)?(https:\/\/.*)$/);
  const requestUri = requestMatch !== null ? requestMatch[1] : null;
  const isPaymentProtocol = requestUri !== null;

  return { isPaymentProtocol, requestUri };
}

function validateBip21Uri(uri) {
  const address = uri.split("?")[0];

  const prefixedAddress = address.includes(":")
    ? address
    : `bitcoincash:${address}`;

  const isCashAddress = typeof decodeCashAddress(prefixedAddress) === "object";
  const isBase58Address =
    !isCashAddress && typeof decodeBase58Address(address) === "object";

  const amountMatch = uri.match(/amount=([0-9]*\.?[0-9]{0,8})/);
  const amount = amountMatch === null ? "0" : amountMatch[1];

  const isBip21 = isCashAddress || isBase58Address;

  return {
    isBip21,
    isCashAddress,
    isBase58Address,
    address: prefixedAddress,
    amount,
  };
}
