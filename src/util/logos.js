import seleneLogo from "@/assets/selene-logo.svg";
import seleneCashtokensLogo from "@/assets/selene-cashtokens-logo.svg";
import bchLogo from "@/assets/bch-logo.svg";
//import bchCashtokensLogo from "@/assets/cashtokens-logo.svg";
import bchCashtokensBwLogo from "@/assets/cashtokens-logo-bw.svg";

// logo keys must be all lowercase
export const logos = {
  selene: { name: "Selene", img: seleneLogo, img_tokens: seleneCashtokensLogo },
  bch: { name: "BCH", img: bchLogo, img_tokens: bchCashtokensBwLogo },
  none: { name: "None", img: "", img_tokens: "" },
};
