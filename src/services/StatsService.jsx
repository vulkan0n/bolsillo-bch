import { store } from "@/redux";

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
  function submitCheckIn() {
    console.log("checking in");

    const now = moment.utc();
    const nowFormatted = now.format("YYYYMMDD");

    const DAY = "day";

    // get from Preferences
    const currentState = store.getState();
    console.log("currentState", currentState);
    const lastCheckIn = store.getState().local[updateProperty] || "";

    const lastCheckInMoment = moment
      .utc(lastCheckIn, "YYYYMMDD")
      .startOf(DAY)
      .add(1, "s");

    const nextCheckIn = lastCheckInMoment.clone().add(1, DAY).startOf(DAY);

    const isShouldCheckIn = lastCheckIn === "" || now.isAfter(nextCheckIn);

    if (isShouldCheckIn) {
      apolloClient.mutate({
        mutation: SEND_DAILY_CHECK_IN,
        variables: {
          deviceId,
          date: nowFormatted,
        },
      });

      // Update preferences to store latest check in date
      store.dispatch(
        updateMethod({
          [updateProperty]: nowFormatted,
        })
      );
    }
  }
}
