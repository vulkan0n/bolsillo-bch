import Logger from "js-logger";
import { DateTime } from "luxon";
import { Device } from "@capacitor/device";
import { gql } from "@apollo/client";
import { sha256 } from "@bitauth/libauth";

import apolloClient from "@/apolloClient";
import { binToHex } from "@/util/hex";
import { store } from "@/redux";
import { setPreference } from "@/redux/preferences";

const SEND_DAILY_CHECK_IN = gql`
  mutation SendCheckIn($hashedDeviceId: String!, $date: String!) {
    sendCheckIn(hashedDeviceId: $hashedDeviceId, date: $date) {
      status
    }
  }
`;

// StatsService: handles submitting daily transactions
export default function StatsService() {
  return {
    submitCheckIn,
  };

  // --------------------------------

  // run a daily check in, if current time UTC is on a date later than previous check in
  async function submitCheckIn() {
    const now = DateTime.utc();
    const nowFormatted = now.toFormat("yyyyLLdd"); // LL is month, 2 digit padded

    const DAY = "day";

    const lastCheckIn = store.getState().preferences.lastCheckIn || "";

    const defaultLastCheckInMoment = now
      .minus({ days: 1 })
      .startOf(DAY)
      .plus({ seconds: 1 });
    const lastCheckInMoment =
      lastCheckIn === ""
        ? defaultLastCheckInMoment
        : DateTime.fromISO(lastCheckIn).startOf(DAY).plus({ seconds: 1 });

    const nextCheckIn = lastCheckInMoment.plus({ days: 1 }).startOf(DAY);

    const isShouldCheckIn = lastCheckIn === "" || now > nextCheckIn;

    const deviceId = (await Device.getId())?.identifier;
    const textEncoder = new TextEncoder();
    const hashedDeviceId = binToHex(sha256.hash(textEncoder.encode(deviceId)));
    Logger.debug({ lastCheckIn, isShouldCheckIn, hashedDeviceId });

    if (isShouldCheckIn) {
      const result = await apolloClient.mutate({
        mutation: SEND_DAILY_CHECK_IN,
        variables: {
          hashedDeviceId,
          date: nowFormatted,
        },
      });

      if (result) {
        Logger.debug("sending off store.dispatch");
        store.dispatch(
          setPreference({ key: "lastCheckIn", value: nowFormatted })
        );
      }
    }
  }
}
