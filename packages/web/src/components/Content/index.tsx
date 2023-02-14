import React from "react";
import styles from "./styles";
import { useQuery } from "@apollo/client";
import GET_CONTENT from "@selene-wallet/common/dist/graphql/queries/getContent";

const Content = () => {
  const { loading, data } = useQuery(GET_CONTENT);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={styles.content as any}>
      {data.content.map((c) => (
        <p key={c.title}>{c.title}</p>
      ))}
    </div>
  );
};

export default Content;
