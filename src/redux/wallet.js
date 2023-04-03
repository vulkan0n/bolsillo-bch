import {
  createAction,
  createReducer,
  createSelector,
  createListenerMiddleware,
} from "@reduxjs/toolkit";
import { store } from "@/redux";
import ElectrumService from "@/services/ElectrumService";
import WalletService from "@/services/WalletService";
import AddressManagerService from "@/services/AddressManagerService";

const Electrum = new ElectrumService();

export const walletActivate = createAction("wallet/activate");
export const walletReady = createAction("wallet/ready");
export const walletAddressStateUpdate = createAction("wallet/addressUpdate");
export const walletBalanceUpdate = createAction("wallet/balanceUpdate");

export const walletMiddleware = createListenerMiddleware();

// walletActivate: request wallet load
walletMiddleware.startListening({
  actionCreator: walletActivate,
  effect: async (action, listenerApi) => {
    const wallet_id = action.payload;
    console.log("got walletActivate", wallet_id);
    const wallet = await new WalletService().boot(wallet_id);
    listenerApi.dispatch(walletReady(wallet));
  },
});

// walletReady: when wallet is loaded from database
walletMiddleware.startListening({
  actionCreator: walletReady,
  effect: async (action, listenerApi) => {
    // set up initial address subscriptions
    const addresses = new AddressManagerService().getReceiveAddresses();
    addresses.forEach((address) =>
      Electrum.subscribeToAddress(address.address)
    );
  },
});

// walletAddressStateUpdate : when data acquired from electrum address subscription
walletMiddleware.startListening({
  actionCreator: walletAddressStateUpdate,
  effect: async (action, listenerApi) => {
    console.log("walletAddressStateUpdate", action.payload);
    const AddressManager = new AddressManagerService();

    if (!Array.isArray(action.payload)) {
      if (action.payload !== null) {
        const address = AddressManager.getAddressByState(action.payload);
        if (address === null) {
          // one of our addresses changed while we were disconnected
          console.log("yoink! address updated offline?", address, action.payload);
          AddressManager.getReceiveAddresses().forEach(async (address, i) => {
            console.log("inside non-array state update foreach", i, address);
            const addressState = await Electrum.requestAddressState(
              address.address
            );
            console.log("requested address state", address, addressState);
            if (addressState !== null) {
              listenerApi.dispatch(
                walletAddressStateUpdate([address.address, addressState])
              );
            }
          });
        }
        console.log("address up-to-date", address);
      }
      return;
    }

    const address = action.payload[0];
    const addressState = action.payload[1];

    if (AddressManager.updateAddressState(address, addressState)) {
      // get new utxos, history, balance for address
      console.log("address state changed for", address);

      const balance = await Electrum.requestBalance(address);
      const walletBalance = AddressManager.updateAddressBalance(address, balance);
      listenerApi.dispatch(walletBalanceUpdate(walletBalance));
    }
  },
});

const initialState = {
  id: 0,
};

export const walletReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(walletReady, (state, action) => {
      return action.payload;
    })
    .addCase(walletBalanceUpdate, (state, action) => {
      state.balance = action.payload;
    });
});

export const selectActiveWallet = createSelector(
  (state) => state,
  (state) => state.wallet
);
