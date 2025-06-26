import { createAsyncThunk } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import { gql } from "@apollo/client";
import LogService from "@/services/LogService";
import WalletManagerService from "@/services/WalletManagerService";
import { selectDeviceInfo } from "@/redux/device";
import {
  setPreference,
  selectLastCheckIn,
  selectPrivacySettings,
  selectIsOfflineMode,
  selectActiveWalletHash,
} from "@/redux/preferences";
import apolloClient from "@/apolloClient";

const Log = LogService("redux/stats");

const SEND_DAILY_CHECK_IN = gql`
  mutation SendCheckIn($hashedDeviceId: String!, $date: String!) {
    sendCheckIn(hashedDeviceId: $hashedDeviceId, date: $date) {
      status
    }
  }
`;

// triggerCheckIn: run a daily check in, if current time UTC is on a date later than previous check in
// TODO: check-in interval should be enforced server-side per device ID
export const triggerCheckIn = createAsyncThunk(
  "stats/submitCheckIn",
  async (payload, thunkApi) => {
    const isOfflineMode = selectIsOfflineMode(thunkApi.getState());
    if (isOfflineMode) {
      Log.log("stats/submitCheckIn blocked by offline mode");
      return;
    }

    const { isDailyCheckInEnabled } = selectPrivacySettings(
      thunkApi.getState()
    );

    if (!isDailyCheckInEnabled) {
      Log.log("stats/submitCheckIn blocked by user preference");
      return;
    }

    const WalletManager = WalletManagerService();
    const walletHash = selectActiveWalletHash(thunkApi.getState());
    const hasGenesisHeight =
      !!(await WalletManager.fetchGenesisHeight(walletHash));

    if (!hasGenesisHeight) {
      Log.debug("stats/submitCheckIn blocked - no genesis height");
      return;
    }

    const lastCheckIn = selectLastCheckIn(thunkApi.getState());

    const now = DateTime.utc();
    const defaultLastCheckInMoment = now
      .minus({ days: 1 })
      .startOf("day")
      .plus({ seconds: 1 });

    const lastCheckInMoment =
      lastCheckIn === ""
        ? defaultLastCheckInMoment
        : DateTime.fromISO(lastCheckIn).startOf("day").plus({ seconds: 1 });

    const nextCheckIn = lastCheckInMoment.plus({ days: 1 }).startOf("day");

    const isShouldCheckIn = lastCheckIn === "" || now > nextCheckIn;

    if (!isShouldCheckIn) {
      Log.debug(
        "stats/submitCheckIn skipped - nextCheckIn is",
        nextCheckIn.toString()
      );
      return;
    }

    const { deviceIdHash } = selectDeviceInfo(thunkApi.getState());

    Log.debug("sending checkin", {
      lastCheckIn,
      deviceIdHash,
    });

    const nowFormatted = now.toFormat("yyyyLLdd"); // LL is month, 2 digit padded

    const result = await apolloClient.mutate({
      mutation: SEND_DAILY_CHECK_IN,
      variables: {
        hashedDeviceId: deviceIdHash,
        date: nowFormatted,
      },
    });

    if (result) {
      Log.debug("check-in successful");
      thunkApi.dispatch(
        setPreference({ key: "lastCheckIn", value: nowFormatted })
      );
    }
  }
);
