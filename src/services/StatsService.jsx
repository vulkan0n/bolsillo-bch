import Logger from "js-logger";
import { DateTime } from "luxon";
import { Device } from "@capacitor/device";
import { gql } from "@apollo/client";

import { store } from "@/redux";
import { setPreference } from "@/redux/preferences";
import apolloClient from "@/apolloClient";

const SEND_DAILY_CHECK_IN = gql`
  mutation SendCheckIn($deviceId: String!, $date: String!) {
    sendCheckIn(deviceId: $deviceId, date: $date) {
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

    console.log('hit this point')
    console.log({ nowFormatted })
    console.log({ lastCheckIn })
    const defaultLastCheckInMoment = now.minus({ days: 1 }).startOf(DAY).plus({ seconds: 1 })
    const lastCheckInMoment = lastCheckIn === "" ? defaultLastCheckInMoment : DateTime.fromISO(lastCheckIn).startOf(DAY).plus({ seconds: 1 })

    const nextCheckIn = lastCheckInMoment.plus({ days: 1 }).startOf(DAY);

    const isShouldCheckIn = lastCheckIn === "" || now.isAfter(nextCheckIn);

    const deviceId = (await Device.getId())?.identifier;
    Logger.debug({ lastCheckIn, isShouldCheckIn, deviceId });

    console.log("Should we send!!")
    if (isShouldCheckIn) {
      console.log("Sending!!")
      apolloClient.mutate({
        mutation: SEND_DAILY_CHECK_IN,
        variables: {
          deviceId,
          date: nowFormatted,
        },
      });

      Logger.debug("sending off store.dispatch");
      store.dispatch(
        setPreference({ key: "lastCheckIn", value: nowFormatted })
      );
    }
  }
}
