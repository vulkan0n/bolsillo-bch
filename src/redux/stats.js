import { createAsyncThunk } from "@reduxjs/toolkit";
import StatsService from "@/services/StatsService";

export const triggerCheckIn = createAsyncThunk(
  "stats/submitCheckIn",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (payload, thunkApi) => {
    const { submitCheckIn } = StatsService();

    submitCheckIn();
  }
);
