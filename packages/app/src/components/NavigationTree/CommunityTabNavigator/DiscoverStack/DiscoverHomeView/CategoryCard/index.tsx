import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "./styles";
import Card from "@selene-wallet/app/src/components/atoms/Card";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "@selene-wallet/app/src/design/icons";
import { DiscoverCategory } from "..";

interface Props {
  category: DiscoverCategory;
  navigation: any; // provided by React Navigation
}

function CategoryCard({ category, navigation }: Props) {
  const s = category.items.length === 1 ? "" : "s";

  const onPressCategory = () => {
    navigation.navigate("Discover Category", { category });
  };

  return (
    <Card key={category?.name}>
      <Pressable style={styles.pressable as any} onPress={onPressCategory}>
        <View style={styles.textBlock as any}>
          <View style={styles.textWrapper as any}>
            <Text style={TYPOGRAPHY.h2black as any}>{category.name}</Text>
            <Text style={TYPOGRAPHY.p as any}>
              {`${category.items.length} item${s}`}
            </Text>
          </View>

          <Text style={TYPOGRAPHY.pLeft as any}>{category.description}</Text>
        </View>
        <View style={styles.chevronContainer}>
          <FontAwesomeIcon
            icon={iconImport("faChevronRight")}
            size={20}
            color={COLOURS.black}
          />
        </View>
      </Pressable>
    </Card>
  );
}

export default CategoryCard;
