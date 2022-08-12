import { faPaperPlane } from "@fortawesome/free-solid-svg-icons/faPaperPlane";
import { faBitcoinSign } from "@fortawesome/free-solid-svg-icons/faBitcoinSign";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import { faBookOpenReader } from "@fortawesome/free-solid-svg-icons/faBookOpenReader";
import { faPiggyBank } from "@fortawesome/free-solid-svg-icons/faPiggyBank";
import { faCode } from "@fortawesome/free-solid-svg-icons/faCode";
import { faGears } from "@fortawesome/free-solid-svg-icons/faGears";
import { faWallet } from "@fortawesome/free-solid-svg-icons/faWallet";
import { faEarthAmericas } from "@fortawesome/free-solid-svg-icons/faEarthAmericas";

export type IconType =
  | ""
  | "faPaperPlane"
  | "faBitcoinSign"
  | "faChevronLeft"
  | "faUsers"
  | "faBookOpenReader"
  | "faPiggyBank"
  | "faCode"
  | "faGears"
  | "faWallet"
  | "faEarthAmericas";

export const iconImport = (icon: IconType) => {
  switch (icon) {
    case "faPaperPlane":
      return faPaperPlane;
    case "faBitcoinSign":
      return faBitcoinSign;
    case "faChevronLeft":
      return faChevronLeft;
    case "faUsers":
      return faUsers;
    case "faBookOpenReader":
      return faBookOpenReader;
    case "faPiggyBank":
      return faPiggyBank;
    case "faCode":
      return faCode;
    case "faGears":
      return faGears;
    case "faWallet":
      return faWallet;
    case "faEarthAmericas":
      return faEarthAmericas;
    default:
      return null;
  }
};
