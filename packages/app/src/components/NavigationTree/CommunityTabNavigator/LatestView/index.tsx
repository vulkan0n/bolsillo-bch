import React, { useState } from "react";
import { View, FlatList, Text } from "react-native";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "./styles";
import ContentCard from "./ContentCard";
import { useQuery } from "@apollo/client";
import GET_CONTENT from "@selene-wallet/common/dist/graphql/queries/getContent";
import Loading from "@selene-wallet/app/src/components/atoms/Loading";

function LatestView() {
  const [isScrolling, setIsScrolling] = useState(false);
  const { loading, error, data } = useQuery(GET_CONTENT);

  if (loading) return <Loading />;
  if (error) return <Text>Error :(</Text>;

  const onScrollBeginDrag = () => {
    setIsScrolling(true);
  };

  const onScrollEndDrag = () => {
    setIsScrolling(false);
  };

  const renderContentCard = ({
    item: {
      key,
      title,
      creator,
      publicationDate,
      videoId,
      description,
      donationBchAddress,
    },
  }) => (
    <ContentCard
      isInteractive={!isScrolling} // Can't tap Youtube player as side effect of scrolling the list
      key={key}
      title={title}
      creator={creator}
      publicationDate={publicationDate}
      videoId={videoId}
      description={description}
      donationBchAddress={donationBchAddress}
    />
  );

  const ListHeader = (
    <View>
      <Text style={styles.header as any}>Welcome to Bitcoin Cash!</Text>
      <Text style={TYPOGRAPHY.p as any}>
        Catch the latest discussions, podcasts, art, music and memes from the
        BCH community.
      </Text>
    </View>
  );

  return (
    <FlatList
      style={styles.flatList as any}
      data={data.content}
      renderItem={renderContentCard}
      keyExtractor={({ key }) => key}
      ListHeaderComponent={ListHeader}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
      // Prevent Android crash on overscrolling
      // https://github.com/LonelyCpp/react-native-youtube-iframe/issues/216#issuecomment-1011152445
      overScrollMode="never"
    />
  );
}

export default LatestView;
