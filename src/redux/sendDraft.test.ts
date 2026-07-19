import { describe, it, expect } from "vitest";
import {
  sendDraftReducer,
  initSendDraft,
  setAmountFiat,
  setAmountSats,
  setMemo,
  clearSendDraft,
} from "./sendDraft";

const initialState = {
  address: null,
  amountFiat: null,
  amountSats: null,
  memo: null,
  isSendMax: false,
};

describe("sendDraft slice", () => {
  it("starts with all null fields", () => {
    expect(sendDraftReducer(undefined, { type: "@@init" })).toEqual(
      initialState
    );
  });

  describe("initSendDraft", () => {
    it("resets fields when only address is provided", () => {
      const state = sendDraftReducer(
        {
          address: "old",
          amountFiat: "1000",
          amountSats: 100000n,
          memo: "old memo",
        },
        initSendDraft({ address: "qrn8abc" })
      );
      expect(state).toEqual({
        address: "qrn8abc",
        amountFiat: null,
        amountSats: null,
        memo: null,
        isSendMax: false,
      });
    });

    it("sets amountFiat, amountSats and memo when provided", () => {
      const state = sendDraftReducer(
        initialState,
        initSendDraft({
          address: "qrn8abc",
          amountFiat: "1500",
          amountSats: 150000n,
          memo: "pago almuerzo",
        })
      );
      expect(state).toEqual({
        address: "qrn8abc",
        amountFiat: "1500",
        amountSats: 150000n,
        memo: "pago almuerzo",
        isSendMax: false,
      });
    });
  });

  describe("setAmountFiat", () => {
    it("updates fiat amount", () => {
      const state = sendDraftReducer(initialState, setAmountFiat("2500"));
      expect(state.amountFiat).toBe("2500");
    });
  });

  describe("setAmountSats", () => {
    it("updates sats amount", () => {
      const state = sendDraftReducer(initialState, setAmountSats(250000n));
      expect(state.amountSats).toBe(250000n);
    });
  });

  describe("setMemo", () => {
    it("updates memo", () => {
      const state = sendDraftReducer(initialState, setMemo("nuevo memo"));
      expect(state.memo).toBe("nuevo memo");
    });
  });

  describe("clearSendDraft", () => {
    it("resets to initial state", () => {
      const state = sendDraftReducer(
        {
          address: "qrn8abc",
          amountFiat: "1500",
          amountSats: 100000n,
          memo: "pago",
        },
        clearSendDraft()
      );
      expect(state).toEqual(initialState);
    });
  });
});
