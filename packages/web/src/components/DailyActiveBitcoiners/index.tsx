import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import GET_ACTIVE_BITCOINERS from "@selene-wallet/common/dist/graphql/queries/getActiveBitcoiners";
import Chart from "@selene-wallet/app/src/components/NavigationTree/CommunityTabNavigator/StatsView/ActiveBitcoinersChart/Chart";
import {
  ONE_HUNDRED,
  TEN_MILLION,
  CHECK_IN_PERIOD_TYPES,
} from "@selene-wallet/common/dist/utils/consts";

const DailyActiveBitcoiners = () => {
  const [period, setPeriod] = useState(CHECK_IN_PERIOD_TYPES.daily);

  console.log("GET_ACTIVE_BITCOINERS", GET_ACTIVE_BITCOINERS);

  const { loading, data } = useQuery(GET_ACTIVE_BITCOINERS, {
    variables: {
      period,
    },
  });

  const activeBitcoiners =
    data?.activeBitcoiners?.[data?.activeBitcoiners.length - 1]?.count || 1;
  const missionPercentage = parseFloat(
    ((ONE_HUNDRED / TEN_MILLION) * activeBitcoiners).toFixed(5)
  );

  const title = () => {
    switch (period) {
      case CHECK_IN_PERIOD_TYPES.daily:
        return "Today:";
      case CHECK_IN_PERIOD_TYPES.weekly:
        return "This week:";
      case CHECK_IN_PERIOD_TYPES.monthly:
        return "This month:";
      case CHECK_IN_PERIOD_TYPES.yearly:
        return "This year:";
      default:
        return "Today";
    }
  };

  console.log("DailyActiveBitcoiners");
  console.log({ loading, data });

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <p>Daily active Bitcoiners</p>
      <p>{JSON.stringify(data)}</p>
      <Chart labels={["a"]} data={[10]} chartHeight={500} />
    </div>
  );
};

export default DailyActiveBitcoiners;
