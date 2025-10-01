/* eslint-disable no-unsafe-optional-chaining */
import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { useQuery } from "@apollo/client";

import Button from "@/atoms/Button";
import Card from "@/atoms/Card";
import SeleneLogo from "@/atoms/SeleneLogo";
import ActiveUsersChart from "./ActiveUsersChart";
import GET_ACTIVE_BITCOINERS from "./getActiveBitcoiners";
import { ONE_SECOND, Period } from "@/util/time";
import { translate } from "@/util/translations";
import translations from "./GlobalAdoptionSummaryTranslations";

export default function StatsGraphCard() {
  const { hash: locationHash } = useLocation();

  const periodHashMap = {
    "#d": Period.Daily,
    "#w": Period.Weekly,
    "#m": Period.Monthly,
    "#y": Period.Yearly,
  };

  const period = periodHashMap[locationHash || "#d"];

  const {
    loading: isLoading,
    data,
    startPolling,
    stopPolling,
  } = useQuery(GET_ACTIVE_BITCOINERS, {
    variables: {
      period,
    },
  });

  useEffect(
    function initializePolling() {
      startPolling(ONE_SECOND * 60);

      return stopPolling;
    },
    [startPolling, stopPolling]
  );

  const isReady = !isLoading && data && data.activeBitcoiners;

  return (
    <Card>
      <div className="flex items-center">
        <SeleneLogo className="w-12 mr-1" />
        <div>
          <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {translate(translations.globalAdoption)}
          </span>
          <div className="text-lg font-bold text-neutral-700 dark:text-neutral-200">
            {translate(translations.activeSeleneUsers)}
          </div>
        </div>
      </div>

      <div className="bg-primary-50 dark:bg-primarydark-50 my-2 p-2 rounded">
        {!isReady && <p>Loading chart...</p>}
        {isReady && <ActiveUsersChart data={data} period={period} />}
      </div>

      <div className="w-full flex justify-around items-center">
        <Button
          label={translate(translations.daily)}
          labelSize="md"
          rounded="lg"
          padding="2"
          navigateTo="#d"
        />
        <Button
          label={translate(translations.weekly)}
          labelSize="md"
          rounded="lg"
          padding="2"
          navigateTo="#w"
        />
        <Button
          label={translate(translations.monthly)}
          labelSize="md"
          rounded="lg"
          padding="2"
          navigateTo="#m"
        />
        <Button
          label={translate(translations.yearly)}
          labelSize="md"
          rounded="lg"
          padding="2"
          navigateTo="#y"
        />
      </div>
    </Card>
  );
}
