import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import { faBookOpenReader } from "@fortawesome/free-solid-svg-icons/faBookOpenReader";
import { faPiggyBank } from "@fortawesome/free-solid-svg-icons/faPiggyBank";
import { faCode } from "@fortawesome/free-solid-svg-icons/faCode";
import { faGears } from "@fortawesome/free-solid-svg-icons/faGears";

export const iconImport = (icon) => {
  switch (icon) {
    // case "faPaperPlane":
    //   return faPaperPlane;
    // case "faBitcoinSign":
    //   return faBitcoinSign;
    // case "faChevronLeft":
    //   return faChevronLeft;
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
    default:
      return null;
  }
};
