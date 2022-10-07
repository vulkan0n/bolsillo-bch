import React from "react";
import styles from "./styles";
import { useQuery } from "@apollo/client";
import GET_CONTENT from "@selene-wallet/common/dist/graphql/queries/getContent";

const Content = () => {
  const { loading, error, data } = useQuery(GET_CONTENT);

  console.log({ loading, data });

  if (loading) return <p>Loading...</p>;

  return (
    <div style={styles.content as any}>
      {data.content.map((c) => (
        <p>{c.title}</p>
      ))}
    </div>
  );
};

export default Content;
