function SettingsView() {
  return (
    <div>
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
          <div className="collapse-content bg-zinc-200 text-zinc-700 rounded-sm">
            <div className="flex items-center">
              <div className="flex-1 p-2">Selene Default</div>
              <div className="flex-2 p-2"></div>
            </div>
            <div className="flex items-center">
              <div className="flex-1 p-2">Selene Test</div>
              <div className="flex-2 p-2"></div>
            </div>
          </div>
        </div>

        <div
          tabIndex={0}
          className="bg-zinc-200 rounded-lg p-2 my-1 collapse collapse-arrow"
        >
          <input type="checkbox" />
          <div className="collapse-title text-lg font-medium">
            QR Code Settings
          </div>
          <div className="collapse-content">
            <div className="flex items-center">
              <div className="flex-1 px-2">Logo</div>
              <div className="flex-2 px-2">
                <select className="select w-full">
                  <option>Selene</option>
                  <option>BCH</option>
                  <option>None</option>
                </select>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-1 px-2">Foreground Color</div>
              <div className="flex-2 px-2"></div>
            </div>
            <div className="flex items-center">
              <div className="flex-1 px-2">Background Color</div>
              <div className="flex-2 px-2"></div>
            </div>
          </div>
        </div>

        <div
          tabIndex={0}
          className="bg-zinc-200 rounded-lg p-2 my-1 collapse collapse-arrow"
        >
          <input type="checkbox" />
          <div className="collapse-title text-lg font-medium">
            Currency Settings
          </div>
          <div className="collapse-content">
            <div className="flex items-center">
              <div className="flex-1 px-2">Logo</div>
              <div className="flex-2 px-2">
                <select className="select w-full">
                  <option>Selene</option>
                  <option>BCH</option>
                  <option>None</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div
          tabIndex={0}
          className="bg-zinc-200 rounded-lg p-2 my-1 collapse collapse-arrow"
        >
          <input type="checkbox" />
          <div className="collapse-title text-lg font-medium">
            Payment Settings
          </div>
          <div className="collapse-content">
            <div className="flex items-center">
              <div className="flex-1">Instant Payment Threshold</div>
              <div className="flex-1">
                <input type="number" className="input" />
              </div>
            </div>
            <div className="flex items-center"></div>
            <div className="flex items-center">
              <div className="flex-1 px-2">Donation Amount</div>
              <div className="flex-1 px-2">
                <input type="number" className="input" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;
