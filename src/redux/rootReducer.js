import initialState from "./initialState";
import ACTION_TYPES from "./actionTypes";

const { STORE_WALLET } = ACTION_TYPES;

export default function rootReducer(state = initialState, action) {
  switch (action.type) {
    case STORE_WALLET:
      return {
        ...state,
        wallet: action.payload.wallet,
      };
    default:
      return state;
  }
}
