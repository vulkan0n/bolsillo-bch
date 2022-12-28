import React from "react";
import { View, Text, Pressable } from "react-native";
import COLOURS from "@selene-wallet/common/design/colours";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "./styles";
import Card from "@selene-wallet/app/src/components/atoms/Card";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "@selene-wallet/app/src/design/icons";
import { DiscoverItem } from "..";

interface Props {
  item: DiscoverItem;
  navigation: any; // provided by React Navigation
}

function ItemCard({ item, navigation }: Props) {
  const onPressCategory = () => {
    navigation.navigate("Discover Category", { category });
  };

  return (
    <Card key={item?.name}>
      <Pressable style={styles.pressable as any} onPress={onPressCategory}>
        <View style={styles.textBlock as any}>
          <View style={styles.textWrapper as any}>
            <Text style={TYPOGRAPHY.h2black as any}>{item.name}</Text>
          </View>

          <Text style={TYPOGRAPHY.pLeft as any}>{item.description}</Text>
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

export default ItemCard;
