import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import SPACING from "@selene-wallet/common/design/spacing";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "./styles";
import Divider from "@selene-wallet/app/src/components/atoms/Divider";
import CategoryCard from "./CategoryCard";

export interface DiscoverCategory {
  name: string;
  description: string;
  items: DiscoverItem[];
}

export interface DiscoverItem {
  name: string;
  description: string;
  url: string;
}

function DiscoverHomeView({ navigation }) {
  const discoverCategories: DiscoverCategory[] = [
    {
      name: "Essential",
      description:
        "The best of Bitcoin. Foundational resources and knowledge for all Bitcoiners.",
      items: [
        {
          name: "Bitcoin Whitepaper",
          description: "Satoshi Nakamoto's original description of Bitcoin.",
          url: "https://bitcoincashpodcast.com/bitcoin.pdf",
        },
      ],
    },
    {
      name: "Full nodes",
      description:
        "Software that propogates and validates transactions for Bitcoin miners and nodes.",
      items: [
        {
          name: "BCHN (Bitcoin Cash Node)",
          description:
            "A professional, miner-friendly node that solves practical problems for Bitcoin Cash. Currently the most popular node implementation.",
          url: "https://bitcoincashnode.org/en/",
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.scrollView as any}>
      <View style={styles.container as any}>
        <Text style={{ ...TYPOGRAPHY.h1black, marginTop: SPACING.ten } as any}>
          Discover
        </Text>
        <Text style={TYPOGRAPHY.p as any}>Explore the BCH ecosystem.</Text>
        <Divider />
        {discoverCategories.map((category) => (
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
