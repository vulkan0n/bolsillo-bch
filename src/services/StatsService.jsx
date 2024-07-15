import { DateTime } from "luxon";
import { gql } from "@apollo/client";

import apolloClient from "@/apolloClient";
import { store } from "@/redux";
import { selectDeviceInfo } from "@/redux/device";
import {
  setPreference,
  selectIsPrerelease,
  selectLastCheckIn,
} from "@/redux/preferences";

import LogService from "@/services/LogService";

const Log = LogService("Stats");

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
  // TODO: check-in interval should be enforced server-side per device ID
  async function submitCheckIn() {
    //console.log("Submitting!!");
    const now = DateTime.utc();
    const nowFormatted = now.toFormat("yyyyLLdd"); // LL is month, 2 digit padded

    const DAY = "day";

    const lastCheckIn = selectLastCheckIn(store.getState());

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

    // This will be replaced with a user-optional setting
    const isPrerelease = selectIsPrerelease(store.getState());

    const { deviceIdHash } = selectDeviceInfo(store.getState());

    Log.debug({ lastCheckIn, isShouldCheckIn, deviceIdHash });

    if (isShouldCheckIn && isPrerelease) {
      Log.debug("sending checkin");
      const result = await apolloClient.mutate({
        mutation: SEND_DAILY_CHECK_IN,
        variables: {
          hashedDeviceId: deviceIdHash,
          date: nowFormatted,
        },
      });

      if (result) {
        Log.debug("check-in successful");
        store.dispatch(
          setPreference({ key: "lastCheckIn", value: nowFormatted })
        );
      }
    }
  }
}
