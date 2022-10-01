import React from "react";
import { View, ScrollView, Text } from "react-native";
import SPACING from "@selene/common/design/spacing";
import TYPOGRAPHY from "@selene/common/design/typography";
import styles from "./styles";
import ContentCard from "./ContentCard";
import { useQuery, gql } from "@apollo/client";

export const GET_CONTENT = gql`
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

function LatestView() {
  const { loading, error, data } = useQuery(GET_CONTENT);

  console.log({ loading, error, data });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error :(</Text>;

  return (
    <ScrollView style={styles.scrollView as any}>
      <View style={styles.container as any}>
        <Text
          style={{ ...TYPOGRAPHY.h1black, marginTop: SPACING.fifteen } as any}
        >
          Welcome to Bitcoin Cash!
        </Text>
        <Text style={TYPOGRAPHY.p as any}>
          Catch the latest discussions, podcasts, art, music and memes from the
          BCH community.
        </Text>

        {data.content.map(
          ({
            key,
            title,
            creator,
            publicationDate,
            videoId,
            description,
            donationBchAddress,
          }) => (
            <ContentCard
              key={key}
              title={title}
              creator={creator}
              publicationDate={publicationDate}
              videoId={videoId}
              description={description}
              donationBchAddress={donationBchAddress}
            />
          )
        )}
      </View>
    </ScrollView>
  );
}

export default LatestView;
