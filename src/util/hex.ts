/* eslint-disable no-plusplus, no-bitwise */
import { hexToBin, binToUtf8 } from "@bitauth/libauth";

// initialize binToHex lookup tables
const LUT_HEX_4B = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
];

const LUT_HEX_8B = new Array(0x100);
for (let n = 0; n < 0x100; n++) {
  LUT_HEX_8B[n] = `${LUT_HEX_4B[(n >>> 4) & 0xf]}${LUT_HEX_4B[n & 0xf]}`;
}

// faster (4x) binToHex implementation: https://archive.is/2v7QZ
// libauth uses slower array conversion method
export function binToHex(buffer) {
  let out = "";
  for (let idx = 0, edx = buffer.length; idx < edx; idx++) {
    out += LUT_HEX_8B[buffer[idx]];
  }
  return out;
}

// re-export libauth hexToBin
export { hexToBin };

// hexToUtf8: attempt to decode a hex string to utf8
export function hexToUtf8(hex: string) {
  return binToUtf8(hexToBin(hex));
}
