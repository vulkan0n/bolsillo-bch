import store from "./store";
import { persistStore } from "redux-persist";

const persistor = persistStore(store);

export default persistor;
