function SettingsView() {
  return (
    <>
      <div className="bg-zinc-900 text-xl text-zinc-200 text-center p-3 font-bold">
        Settings
      </div>

      <div className="px-2">
        <div className="m-2 p-2">
          <div className="alert alert-warning p-4 shadow-lg bg-warning text-black rounded-lg text-center">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-red-500 flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xl">
                YOU HAVE NOT BACKED UP YOUR PRIVATE KEY
              </span>
            </div>
          </div>
        </div>

        <div
          tabIndex={0}
          className="bg-zinc-800 rounded-lg p-2 my-1 collapse collapse-arrow text-zinc-200"
        >
          <input type="checkbox" />
          <div className="collapse-title text-lg font-medium p-1">
            Manage Wallets
          </div>
          <div className="collapse-content bg-zinc-200 text-zinc-700 rounded-sm divide-y divide-zinc-300">
            <a
              href="/settings/wallet/Selene Default"
              className="w-full block p-2"
            >
              Selene Default
            </a>
            <a href="/settings/wallet/Selene Test" className="w-full block p-2">
              Selene Test
            </a>
          </div>
        </div>

        <div
          tabIndex={0}
          className="bg-zinc-800 rounded-lg p-2 my-1 collapse collapse-arrow text-zinc-200 p-2 my-1"
        >
          <input type="checkbox" />
          <div className="collapse-title text-lg font-medium p-1">
            Currency Settings
          </div>
          <div className="collapse-content bg-zinc-200 text-zinc-700 rounded-sm divide-y divide-zinc-300">
            <div className="form-control p-3">
              <label className="label">
                <span className="label-text">Local Currency</span>
                <select className="select">
                  <option>USD</option>
                  <option>EUR</option>
                  <option>CNY</option>
                  <option>JPY</option>
                  <option>GBP</option>
                  <option>CAD</option>
                  <option>AUD</option>
                  <option>BTC</option>
                </select>
              </label>
            </div>
            <div className="form-control p-3">
              <label className="label cursor-pointer">
                <span className="label-text">Prefer Local Currency</span>
                <input type="checkbox" className="toggle" />
              </label>
            </div>
            <div className="form-control p-3">
              <label className="label cursor-pointer">
                <span className="label-text">Hide Available Balance</span>
                <input type="checkbox" className="toggle" />
              </label>
            </div>
            <div className="form-control p-3">
              <label className="label cursor-pointer">
                <span className="label-text">BCH Denomination</span>
                <input type="checkbox" className="toggle" />
              </label>
            </div>
          </div>
        </div>

        <div
          tabIndex={0}
          className="bg-zinc-800 rounded-lg p-2 my-1 collapse collapse-arrow text-zinc-200 p-2 my-1"
        >
          <input type="checkbox" />
          <div className="collapse-title text-lg font-medium p-1">
            Payment Settings
          </div>
          <div className="collapse-content bg-zinc-200 text-zinc-700 rounded-sm divide-y divide-zinc-300">
            <div className="form-control p-3">
              <label className="label cursor-pointer">
                <span className="label-text">Allow Instant Pay</span>
                <input type="checkbox" className="toggle" />
              </label>
            </div>
            <div className="form-control p-3">
              <label className="label">
                <span className="label-text">Instant Pay Threshold</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.00001000"
                  placeholder="0.25000000"
                  className="input"
                />
              </label>
            </div>
          </div>
        </div>

        <div
          tabIndex={0}
          className="bg-zinc-800 rounded-lg p-2 my-1 collapse collapse-arrow text-zinc-200 p-2 my-1"
        >
          <input type="checkbox" />
          <div className="collapse-title text-lg font-medium p-1">
            QR Code Settings
          </div>
          <div className="collapse-content bg-zinc-200 text-zinc-700 rounded-sm divide-y divide-zinc-300">
            <div className="form-control p-3">
              <label className="label">
                <span className="label-text">Logo</span>
                <select className="select">
                  <option>Selene</option>
                  <option>BCH</option>
                  <option>None</option>
                </select>
              </label>
            </div>
            <div className="form-control p-3">
              <label className="label cursor-pointer">
                <span className="label-text">Background Color</span>
                <input type="checkbox" className="toggle" />
              </label>
            </div>
            <div className="form-control p-3">
              <label className="label cursor-pointer">
                <span className="label-text">Foreground Color</span>
                <input type="checkbox" className="toggle" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsView;
