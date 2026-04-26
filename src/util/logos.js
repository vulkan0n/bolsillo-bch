import bchLogo from "@/assets/bch-logo.svg";
import bolsilloLogo from "@/assets/bolsillo-logo.svg";
//import bchCashtokensBwLogo from "@/assets/cashtokens-logo-bw.svg";
import bchCashtokensLogo from "@/assets/cashtokens-logo.svg";
import seleneCashtokensLogo from "@/assets/selene-cashtokens-logo.svg";

// logo keys must be all lowercase
export const logos = {
  selene: {
    name: "Bolsillo BCH",
    img: bolsilloLogo,
    img_tokens: seleneCashtokensLogo,
  },
  bch: { name: "BCH", img: bchLogo, img_tokens: bchCashtokensLogo },
  none: { name: "None", img: "", img_tokens: "" },
};
