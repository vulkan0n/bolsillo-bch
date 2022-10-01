import React from "react";
import { View, ScrollView, Text } from "react-native";
import SPACING from "@selene/common/design/spacing";
import TYPOGRAPHY from "@selene/common/design/typography";
import styles from "./styles";
import ContentCard from "./ContentCard";
import { useQuery, gql } from "@apollo/client";

export const GET_BOOKS = gql`
  query GetBooks {
    books {
      title
    }
  }
`;

const CONTENT = [
  {
    key: 1,
    title: "#59: Listener Survey 2022 & Political change",
    creator: "The Bitcoin Cash Podcast",
    publicationDate: new Date(2022, 8, 13),
    videoId: "qyUKMhARnps",
    description:
      "Jett and I discuss all of the listener survey results and feedback, testing out the Alpha release of AnyHedge, the AVAX drama and the changing political tides around the world..",
    donationBchAddress:
      "bitcoincash:qpagvpjs32etwhv2hn75vdqyhckqs83w4unacjfjsa",
  },
  {
    key: 2,
    title: "Who Killed Bitcoin?",
    creator: "La Eterna Vigilante",
    publicationDate: new Date(2022, 0, 11),
    videoId: "eafzIW52Rgc",
    description:
      "A 45 minute documentary explaining money, power and the history of Bitcoin.",
  },
];

function LatestView() {
  const { loading, error, data } = useQuery(GET_BOOKS);

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
        {data.books.map((d) => (
          <Text key={d.title}>{JSON.stringify(d)}</Text>
        ))}

        {CONTENT.map(
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
