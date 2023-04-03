import {
  createAction,
  createReducer,
  createSelector,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import { store } from "@/redux";
import { utxoRequest } from "@/redux/utxo";

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
    // handle initial subscription response
    if (!Array.isArray(action.payload)) {
      const payload = handleAddressSubscriptionInit(action.payload);
      if (payload) {
        listenerApi.dispatch(walletAddressStateUpdate(payload));
      }
    } else {
      const AddressManager = new AddressManagerService();
      const [address, addressState] = action.payload;

      if (AddressManager.updateAddressState(address, addressState)) {
        // get new utxos, history, balance for address
        console.log("address state changed for", address);

        const balance = await Electrum.requestBalance(address);
        const walletBalance = AddressManager.updateAddressBalance(
          address,
          balance
        );
        listenerApi.dispatch(walletBalanceUpdate(walletBalance));

        listenerApi.dispatch(utxoRequest(address));
      }
    }
  },
});

function handleAddressSubscriptionInit(payload) {
  const AddressManager = new AddressManagerService();
  // if initial subscription is null, address is unused, so don't proceed
  if (payload !== null) {
    // if we find the address by state, the address is up to date
    const address = AddressManager.getAddressByState(payload);
    if (address === null) {
      // one of our addresses changed while we were offline
      console.log("address update while offline?", address, payload);

      // we don't know which address, so scan them all
      AddressManager.getReceiveAddresses().forEach(async (address, i) => {
        const addressState = await Electrum.requestAddressState(
          address.address
        );
        console.log("requested address state", i, address, addressState);

        // don't continue scanning if address is unused
        if (addressState !== null) {
          // return up-to-date address state
          return [address.address, addressState];
        }
      });
    }
    console.log("address up-to-date", address);
  }
}

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
