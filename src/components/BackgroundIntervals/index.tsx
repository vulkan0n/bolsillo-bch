import React, { useEffect } from "react";
import { View } from "react-native";
import { TEN_SECONDS } from "../../utils/consts";

const BackgroundIntervals = () => {
  const ping = () => {
    console.log("ping!");
  };

  useEffect(() => {
    ping();
    const interval = setInterval(() => {
      ping();
    }, TEN_SECONDS);

    return () => clearInterval(interval);
  }, []);

  return <View />;
};

export default BackgroundIntervals;
