import Logger from "js-logger";
import ReactDOM from "react-dom/client";
import { SplashScreen } from "@capacitor/splash-screen";
import LogService from "@/services/LogService";
import JanitorService from "@/services/JanitorService";
import { redux_init, redux_post_init } from "@/redux";
import Main from "@/Main";

// eslint-disable-next-line react-refresh/only-export-components
const Log = LogService("init");

function initialize_app() {
  redux_init();

  Log.debug("render <Main>");
  ReactDOM.createRoot(document.getElementById("root")).render(<Main />);
}

async function post_init() {
  Log.log("* POST_INIT *");
  const Janitor = JanitorService();
  await Janitor.migrateLegacyDbFile();
  Janitor.cleanupAddressStates();
  Janitor.cleanupAddressTransactions();

  redux_post_init();
}

// big green START button for the whole app
Log.log("* Initializing App *");
initialize_app();
await post_init();
await SplashScreen.hide();
Logger.timeEnd("INIT_APP");
