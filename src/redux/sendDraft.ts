import { createSelector, createSlice } from "@reduxjs/toolkit";

export interface SendDraftState {
  address: string | null;
  amountFiat: string | null;
  amountSats: bigint | null;
  memo: string | null;
}

const initialState: SendDraftState = {
  address: null,
  amountFiat: null,
  amountSats: null,
  memo: null,
};

const sendDraftSlice = createSlice({
  name: "sendDraft",
  initialState,
  reducers: {
    initSendDraft(state, action) {
      state.address = action.payload.address;
      state.amountFiat = action.payload.amountFiat ?? null;
      state.memo = action.payload.memo ?? null;
      state.amountSats = action.payload.amountSats ?? null;
    },
    setAmountFiat(state, action) {
      state.amountFiat = action.payload;
    },
    setAmountSats(state, action) {
      state.amountSats = action.payload;
    },
    setMemo(state, action) {
      state.memo = action.payload;
    },
    clearSendDraft() {
      return initialState;
    },
  },
});

export const {
  initSendDraft,
  setAmountFiat,
  setAmountSats,
  setMemo,
  clearSendDraft,
} = sendDraftSlice.actions;

export const sendDraftReducer = sendDraftSlice.reducer;

export const selectSendDraft = createSelector(
  (state) => state,
  (state) => state.sendDraft
);

export const selectSendDraftAddress = createSelector(
  (state) => state,
  (state) => state.sendDraft.address
);

export const selectSendDraftAmountFiat = createSelector(
  (state) => state,
  (state) => state.sendDraft.amountFiat
);

export const selectSendDraftAmountSats = createSelector(
  (state) => state,
  (state) => state.sendDraft.amountSats
);

export const selectSendDraftMemo = createSelector(
  (state) => state,
  (state) => state.sendDraft.memo
);
