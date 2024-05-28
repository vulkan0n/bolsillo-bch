import Logger from "js-logger";
import ReactDOM from "react-dom/client";
import { SplashScreen } from "@capacitor/splash-screen";
import LogService from "@/services/LogService";
import { redux_init } from "@/redux";
import Main from "@/Main";

// eslint-disable-next-line react-refresh/only-export-components
const Log = LogService("init");

function initialize_app() {
  // initialize redux state, don't render app until redux state is loaded
  Log.debug("redux init");
  redux_init();

  Log.debug("render app");
  ReactDOM.createRoot(document.getElementById("root")).render(<Main />);
}

// big green START button for the whole app
Log.log("* Initializing App *");
initialize_app();
await SplashScreen.hide();
Logger.timeEnd("INIT_APP");
