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

export function validateBchUri(uri) {
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

  const isValid = isBip21 || isPaymentProtocol || wifPayload.isWif;
  const query = new Decimal(amount).greaterThan(0) ? `?amount=${amount}` : "";

  const payload = {
    address,
    amount,
    query,
    requestUri,
    isValid,
    isCashAddress,
    isTokenAddress,
    isBase58Address,
    isPaymentProtocol,
    ...wifPayload,
  };

  return payload;
}

export function validateBip21Uri(uri) {
  const address = uri.split("?")[0];
  const amountMatch = uri.match(/amount=([0-9]*\.?[0-9]{0,8})/);
  const amount = amountMatch === null ? "0" : amountMatch[1];

  const noPrefixAddress = address.includes(":")
    ? address.split(":")[1]
    : address;

  const isBase58Address =
    typeof decodeBase58Address(noPrefixAddress) === "object";

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

function validatePaymentProtocolUri(uri) {
  const requestMatch = uri.match(/(?:r=)?(https:\/\/[^?]*)(?:\?.+)?$/);
  const requestUri = requestMatch !== null ? requestMatch[1] : null;
  const isPaymentProtocol = requestUri !== null;

  return { isPaymentProtocol, requestUri };
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

export const navigateOnValidUri = async (input): Promise<string> => {
  // go to send screen when valid address is entered
  const { isValid, isPaymentProtocol, isWif, address, query, requestUri, wif } =
    validateBchUri(input);

  let navTo = "";
  if (isValid) {
    await Haptic.success();

    if (isPaymentProtocol) {
      navTo = `/wallet/pay/?r=${requestUri}`;
    } else if (isWif) {
      navTo = `/wallet/sweep/${wif}`;
    } else {
      navTo = `/wallet/send/${address}${query}`;
    }
  } else {
    await Haptic.error();
  }

  return navTo;
};
