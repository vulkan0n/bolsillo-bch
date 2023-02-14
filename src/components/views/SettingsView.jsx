/* = Settings =
 * 1. BCH denomination (BCH/mBCH/bits/sats)
 * 2. Local Currency (USD by default, includes BTC)
 * 3. Show Settings Tab
 * 4. Testnet/Chipnet
 * 5. Reset App
 */

/* = Main Menu =
 * 1. Wallet Manager
 * 2. Coin Control (later)
 * 3. Credits
 * 4. Settings
 */

function SettingsView() {
  return (
    <div>
      <div>Settings</div>
      <div>
        <ul>
          <li>BCH Denomination</li>
          <li>Local Currency</li>
          <li>Testnet/Chipnet</li>
          <li>Reset App</li>
        </ul>
      </div>
    </div>
  )
}

export default SettingsView;
