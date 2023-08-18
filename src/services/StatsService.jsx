import moment from "moment";
import { Device } from "@capacitor/device";
import { gql } from "@apollo/client";

import { store } from "@/redux";
import apolloClient from "../apolloClient";

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
    const now = moment.utc();
    const nowFormatted = now.format("YYYYMMDD");

    const DAY = "day";

    const lastCheckIn = store.getState().preferences.lastCheckIn || "";

    const lastCheckInMoment = moment
      .utc(lastCheckIn, "YYYYMMDD")
      .startOf(DAY)
      .add(1, "s");

    const nextCheckIn = lastCheckInMoment.clone().add(1, DAY).startOf(DAY);

    const isShouldCheckIn = lastCheckIn === "" || now.isAfter(nextCheckIn);

    const deviceId = (await Device.getId())?.identifier;
    console.log({ lastCheckIn, isShouldCheckIn, deviceId });

    if (isShouldCheckIn) {
      apolloClient.mutate({
        mutation: SEND_DAILY_CHECK_IN,
        variables: {
          deviceId,
          date: nowFormatted,
        },
      });

      // TODO: Update preferences to store latest check in date
      // store.dispatch(
      //   updateMethod({
      //     [updateProperty]: nowFormatted,
      //   })
      // );
    }
  }
}
