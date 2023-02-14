const prisma = require("../../prisma/client");
import { CheckInPeriodTypes } from "@selene-wallet/common/dist/types";

const sendCheckIn = async (
  _: any,
  { period, date }: { period: CheckInPeriodTypes; date: string }
) => {
  const checkIn = await prisma.default.checkIn.create({
    data: {
      period,
      date,
    },
  });

  console.log({ checkIn });
  return {
    status: "SUCCESS",
  };
};

module.exports = sendCheckIn;
