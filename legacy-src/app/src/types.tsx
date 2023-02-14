import store from "@selene-wallet/app/src/redux/store";

export type AppDispatch = typeof store.dispatch;

export type ValidateRequestType = {
  isValid: boolean;
  address: string;
  rawSatAmount: string;
};
