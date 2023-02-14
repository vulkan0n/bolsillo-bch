import { gql } from "@apollo/client";

const GET_CONTENT = gql`
  query GetContent {
    content {
      key
      title
      creator
      publicationDate
      videoId
      description
      donationBchAddress
    }
  }
`;

export default GET_CONTENT;
