import React from "react";
import { View, Text, ScrollView } from "react-native";
import COLOURS from "@design/colours";
import SPACING from "@design/spacing";
import TYPOGRAPHY from "@design/typography";
import { ONE_HUNDRED, TEN_MILLION } from "@utils/consts";
import styles from "./styles";
import { diff } from "react-native-reanimated";

function OnlineView({ navigation }) {
  const proposals = [
    {
      title: "Daily Active User stats",
      description:
        "Collect daily active user stats for Selene, 24h, 1 week, 1 month, 3 month and 1 year stats. Will be published live on a new Stats page in the Community tab. Community can then directly track economy / project growth.",
      effort: "Medium",
      satoshis: 0,
      cashAddress: "bitcoincash:xxx",
      isCompleted: false,
      completedDate: null,
    },
    {
      title: "Port Selene Wallet to web",
      description:
        "Make a website version of Selene Wallet for desktop browser users.",
      effort: "High",
      satoshis: 0,
      cashAddress: "bitcoincash:xxx",
      isCompleted: false,
      completedDate: null,
    },
    {
      title: "Selene Home Page",
      description: "Make a static web page to advertise Selene.",
      effort: "Medium",
      satoshis: 0,
      cashAddress: "bitcoincash:xxx",
      isCompleted: false,
      completedDate: null,
    },
    {
      title: "Transaction History",
      description: "Make a static web page to advertise Selene.",
      effort: "Medium",
      satoshis: 0,
      cashAddress: "bitcoincash:xxx",
      isCompleted: false,
      completedDate: null,
    },
    {
      title: "Language setting for Spanish",
      description:
        "Translate the app into Spanish, settable in Settings. Will help Selene expand into Spain and South America.",
      effort: "Medium",
      satoshis: 0,
      cashAddress: "bitcoincash:xxx",
      isCompleted: false,
      completedDate: null,
    },
  ];

  return (
    <ScrollView style={styles.scrollView as any}>
      <View style={styles.container as any}>
        <Text style={TYPOGRAPHY.h1black as any}>How It Works</Text>
        <Text style={TYPOGRAPHY.p as any}>
          Selene Wallet is built for you, the Bitcoin Cash community. Vote on
          possible roadmap items below by sending in satoshis, and the devs will
          deliver the most funded ideas first.
        </Text>
        <Text style={TYPOGRAPHY.h1black as any}>Proposals</Text>
        {proposals.map(({ title, description, effort, satoshis }) => (
          <View key={title} style={styles.proposalCard}>
            <Text style={TYPOGRAPHY.h2black as any}>{title}</Text>
            <Text style={TYPOGRAPHY.subtitleBlack as any}>{satoshis}</Text>
            <Text style={TYPOGRAPHY.pLeft as any}>Effort: {effort}</Text>
            <Text style={TYPOGRAPHY.pLeft as any}>{description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default OnlineView;
