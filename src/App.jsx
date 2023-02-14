import Init from "./components/Init";
import MainView from "./components/MainView";

import './App.css'

/* = Main Menu =
 * 1. Wallet Manager
 * 2. Coin Control (later)
 * 3. Credits
 * 4. Settings
 */

/* = Settings =
 * 1. BCH denomination (BCH/mBCH/bits/sats)
 * 2. Local Currency (USD by default, includes BTC)
 * 3. Show Community Tab
 * 4. Testnet/Chipnet
 * 5. Reset App
 */

function App() {
  return (
    <div className="App">
      <Init />
      <MainView />
    </div>
  )
}

export default App;
