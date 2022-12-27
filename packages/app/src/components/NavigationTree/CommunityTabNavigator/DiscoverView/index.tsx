import React from "react";
import { View, Text, ScrollView } from "react-native";
import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "./styles";
import Divider from "@selene-wallet/app/src/components/atoms/Divider";

interface DiscoverCategory {
  name: String;
  description: String;
  items: [DiscoverItem];
}

interface DiscoverItem {
  name: String;
  description: String;
  url: String;
}

function DiscoverView({ navigation }) {
  const discoverCategories: [DiscoverCategory?] = [
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
        {discoverCategories.map((category) => {
          const s = category.items.length === 1 ? "" : "s";
          return (
            <View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <Text style={TYPOGRAPHY.h2black as any}>{category.name}</Text>
                <Text style={TYPOGRAPHY.p as any}>
                  {`${category.items.length} item${s}`}
                </Text>
              </View>

              <Text style={TYPOGRAPHY.pLeft as any}>
                {category.description}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

export default DiscoverView;
