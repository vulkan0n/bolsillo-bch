import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "./styles";
import Divider from "@selene-wallet/app/src/components/atoms/Divider";
import Card from "@selene-wallet/app/src/components/atoms/Card";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { iconImport } from "@selene-wallet/app/src/design/icons";
import { DiscoverCategory } from "../DiscoverHomeView";

interface Props {
  category: DiscoverCategory;
  navigation: any;
}

function CategoryView({ category, navigation }: Props) {
  return (
    <ScrollView style={styles.scrollView as any}>
      <View style={styles.container as any}>
        <Text style={{ ...TYPOGRAPHY.h1black, marginTop: SPACING.ten } as any}>
          Category
        </Text>
        <Text style={TYPOGRAPHY.p as any}>Explore the BCH ecosystem.</Text>
        <Divider />
        {/* {discoverCategories.map((category) => {
          const s = category.items.length === 1 ? "" : "s";
          return (
            <Card>
              <Pressable
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onPress={onPressCategory}
              >
                <View
                  style={{
                    marginHorizontal: SPACING.ten,
                    flex: 6,
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                    }}
                  >
                    <Text style={TYPOGRAPHY.h2black as any}>
                      {category.name}
                    </Text>
                    <Text style={TYPOGRAPHY.p as any}>
                      {`${category.items.length} item${s}`}
                    </Text>
                  </View>

                  <Text style={TYPOGRAPHY.pLeft as any}>
                    {category.description}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: SPACING.ten,
                  }}
                >
                  <FontAwesomeIcon
                    icon={iconImport("faChevronRight")}
                    size={20}
                    color={COLOURS.black}
                  />
                </View>
              </Pressable>
            </Card>
          );
        })} */}
      </View>
    </ScrollView>
  );
}

export default CategoryView;
