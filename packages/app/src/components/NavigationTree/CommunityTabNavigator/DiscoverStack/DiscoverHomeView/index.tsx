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

  // console.log({ loading, error, data });

  if (loading) return <Loading />;
  if (error) return <Text>Error :(</Text>;

  const discoverCategories: DiscoverCategory[] = data.categories;

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
