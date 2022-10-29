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
import { faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons/faScrewdriverWrench";
import { faBarsStaggered } from "@fortawesome/free-solid-svg-icons/faBarsStaggered";
import { faMoon } from "@fortawesome/free-solid-svg-icons/faMoon";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons/faPlusCircle";
import { faFileImport } from "@fortawesome/free-solid-svg-icons/faFileImport";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons/faTrashCan";
import { faEye } from "@fortawesome/free-solid-svg-icons/faEye";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons/faPowerOff";
import { faPaste } from "@fortawesome/free-solid-svg-icons/faPaste";
import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode";
import { faImage } from "@fortawesome/free-solid-svg-icons/faImage";
import { faKeyboard } from "@fortawesome/free-solid-svg-icons/faKeyboard";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons/faCircleCheck";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons/faXmarkCircle";
import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons/faPhotoFilm";
import { faHandshake } from "@fortawesome/free-solid-svg-icons/faHandshake";
import { faChartLine } from "@fortawesome/free-solid-svg-icons/faChartLine";
import { faCamera } from "@fortawesome/free-solid-svg-icons/faCamera";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons/faArrowLeft";

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
  | "faEarthAmericas"
  | "faScrewdriverWrench"
  | "faBarsStaggered"
  | "faMoon"
  | "faPlusCircle"
  | "faFileImport"
  | "faTrashCan"
  | "faEye"
  | "faPowerOff"
  | "faPaste"
  | "faQrcode"
  | "faImage"
  | "faKeyboard"
  | "faCircleCheck"
  | "faXmark"
  | "faXmarkCircle"
  | "faPhotoFilm"
  | "faHandshake"
  | "faChartLine"
  | "faCamera"
  | "faChevronRight"
  | "faArrowRight"
  | "faArrowLeft";

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
    case "faScrewdriverWrench":
      return faScrewdriverWrench;
    case "faBarsStaggered":
      return faBarsStaggered;
    case "faMoon":
      return faMoon;
    case "faPlusCircle":
      return faPlusCircle;
    case "faFileImport":
      return faFileImport;
    case "faTrashCan":
      return faTrashCan;
    case "faEye":
      return faEye;
    case "faPowerOff":
      return faPowerOff;
    case "faPaste":
      return faPaste;
    case "faQrcode":
      return faQrcode;
    case "faImage":
      return faImage;
    case "faKeyboard":
      return faKeyboard;
    case "faCircleCheck":
      return faCircleCheck;
    case "faXmark":
      return faXmark;
    case "faXmarkCircle":
      return faXmarkCircle;
    case "faPhotoFilm":
      return faPhotoFilm;
    case "faHandshake":
      return faHandshake;
    case "faChartLine":
      return faChartLine;
    case "faCamera":
      return faCamera;
    case "faChevronRight":
      return faChevronRight;
    case "faArrowRight":
      return faArrowRight;
    case "faArrowLeft":
      return faArrowLeft;
    default:
      return null;
  }
};
