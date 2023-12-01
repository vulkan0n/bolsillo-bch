import Logger from "js-logger";
import ReactDOM from "react-dom/client";
import { redux_init } from "@/redux";
import Main from "@/Main";
import { SELENE_WALLET_VERSION } from "@/util/version";

function init() {
  Logger.useDefaults(); // eslint-disable-line react-hooks/rules-of-hooks
  Logger.info(`Selene Wallet v${SELENE_WALLET_VERSION} :: https://selene.cash`);

  redux_init();

  // don't render app until redux state is loaded
  ReactDOM.createRoot(document.getElementById("root")).render(<Main />);
}

init();
