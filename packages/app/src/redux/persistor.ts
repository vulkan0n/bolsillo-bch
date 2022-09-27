import store from "./store";
import { persistStore } from "redux-persist";

const persistor = persistStore(store);
// Uncomment and reload app to completely purge persisted state
// Then recomment to continue development
// CAUTION: Purges everything!! Including wallet mnemonics
// persistor.purge();

export default persistor;
