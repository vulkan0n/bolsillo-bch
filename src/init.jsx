import Logger from "js-logger";
import ReactDOM from "react-dom/client";
import { SplashScreen } from "@capacitor/splash-screen";
import { redux_init } from "@/redux";
import Main from "@/Main";
import { SELENE_WALLET_VERSION } from "@/util/version";

function initialize_app() {
  Logger.useDefaults(); // eslint-disable-line react-hooks/rules-of-hooks
  Logger.info(`Selene Wallet v${SELENE_WALLET_VERSION} :: https://selene.cash`);

  // initialize redux state, don't render app until redux state is loaded
  Logger.debug("redux init");
  redux_init();

  Logger.debug("render app");
  ReactDOM.createRoot(document.getElementById("root")).render(<Main />);
}

// big green START button for the whole app
initialize_app();
await SplashScreen.hide();
