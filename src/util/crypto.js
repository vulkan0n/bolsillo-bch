import {
  instantiateSecp256k1,
  instantiateRipemd160,
  instantiateSha256,
  instantiateSha512,
} from "@bitauth/libauth";

const secp256k1 = await instantiateSecp256k1();
const ripemd160 = await instantiateRipemd160();
const sha256 = await instantiateSha256();
const sha512 = await instantiateSha512();

export const crypto = {
  ripemd160,
  secp256k1,
  sha256,
  sha512,
};
