import { gql } from "@apollo/client";

const GET_DISCOVER_CATEGORIES = gql`
  query GetDiscoverCategories {
    categories {
      name
      description
      items {
        name
        description
        url
      }
    }
  }
`;

export default GET_DISCOVER_CATEGORIES;
