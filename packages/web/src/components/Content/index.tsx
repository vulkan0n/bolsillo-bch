import React from "react";
import styles from "./styles";
import { useQuery, gql } from "@apollo/client";

const GET_BOOKS = gql`
  query GetBooks {
    books {
      title
    }
  }
`;

const Content = () => {
  const { loading, error, data } = useQuery(GET_BOOKS);

  // console.log({ loading, data });

  // if (loading) return <p>Loading...</p>;

  return (
    <div style={styles.content as any}>
      {/* {data.books.map((d) => (
        <p>{d.title}</p>
      ))} */}
    </div>
  );
};

export default Content;
