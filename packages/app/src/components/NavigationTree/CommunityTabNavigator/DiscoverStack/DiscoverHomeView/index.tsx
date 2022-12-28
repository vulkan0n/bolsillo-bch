import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import SPACING from "@selene-wallet/common/design/spacing";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "./styles";
import Divider from "@selene-wallet/app/src/components/atoms/Divider";
import CategoryCard from "./CategoryCard";
import { DiscoverCategory } from "..";
import { useQuery } from "@apollo/client";
import GET_DISCOVER_CATEGORIES from "@selene-wallet/common/dist/graphql/queries/getDiscoverCategories";
import Loading from "@selene-wallet/app/src/components/atoms/Loading";

function DiscoverHomeView({ navigation }) {
  const { loading, error, data } = useQuery(GET_DISCOVER_CATEGORIES);

  if (loading) return <Loading />;
  if (error) return <Text>Error :(</Text>;

  // const discoverCategories: DiscoverCategory[] = [
  //   {
  //     name: "Essential",
  //     description:
  //       "The best of Bitcoin. Foundational resources and knowledge for all Bitcoiners.",
  //     items: [
  //       {
  //         name: "The Bitcoin Whitepaper",
  //         description: "Satoshi Nakamoto's original description of Bitcoin.",
  //         url: "https://bitcoincashpodcast.com/bitcoin.pdf",
  //       },
  //     ],
  //   },
  //   {
  //     name: "Full nodes",
  //     description:
  //       "Software that propogates and validates transactions for Bitcoin miners and nodes.",
  //     items: [
  //       {
  //         name: "BCHN (Bitcoin Cash Node)",
  //         description:
  //           "A professional, miner-friendly node that solves practical problems for Bitcoin Cash. Currently the most popular node implementation.",
  //         url: "https://bitcoincashnode.org/en/",
  //       },
  //     ],
  //   },
  // ];

  return (
    <ScrollView style={styles.scrollView as any}>
      <View style={styles.container as any}>
        <Text style={{ ...TYPOGRAPHY.h1black, marginTop: SPACING.ten } as any}>
          Discover
        </Text>
        <Text style={TYPOGRAPHY.p as any}>Explore the BCH ecosystem.</Text>
        <Divider />
        {data.discoverCategories.map((category) => (
          <CategoryCard
            key={category?.name}
            category={category}
            navigation={navigation}
          />
        ))}
      </View>
    </ScrollView>
  );
}

export default DiscoverHomeView;
