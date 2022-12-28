import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import SPACING from "@selene-wallet/common/design/spacing";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "./styles";
import Divider from "@selene-wallet/app/src/components/atoms/Divider";
import { DiscoverCategory } from "../DiscoverHomeView";
import ItemCard from "./ItemCard";

interface Props {
  category: DiscoverCategory;
  navigation: any; // provided by React Navigation
  route: any; // provided by React Navigation
}

function CategoryView({ route, navigation }: Props) {
  const { category } = route.params;
  const { items } = category;

  const onBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.scrollView as any}>
      <View style={styles.container as any}>
        <Pressable onPress={onBack}>
          <Text>Back to Discover</Text>
        </Pressable>
        <Text style={{ ...TYPOGRAPHY.h1black, marginTop: SPACING.ten } as any}>
          {category.name}
        </Text>
        <Text style={TYPOGRAPHY.p as any}>{category.description}</Text>
        <Divider />
        {items.map((item) => (
          <ItemCard key={item?.name} item={item} navigation={navigation} />
        ))}
      </View>
    </ScrollView>
  );
}

export default CategoryView;
