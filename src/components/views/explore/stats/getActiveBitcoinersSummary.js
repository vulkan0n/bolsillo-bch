import { gql } from "@apollo/client";

const GET_ACTIVE_BITCOINERS_SUMMARY = gql`
  query GetActiveBitcoinersSummary {
    activeBitcoinersSummary {
      dailyActiveCount
      dailyActiveChange
    }
  }
`;

// 30dActive
// 30dChange
// 365dActive
// 365dChange

export default GET_ACTIVE_BITCOINERS_SUMMARY;
