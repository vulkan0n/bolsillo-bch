import React from "react";
import { View, FlatList, Text, TouchableHighlight } from "react-native";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMessage } from "@fortawesome/free-solid-svg-icons/faMessage";
import COLOURS from "../../../../../design/colours";
import Divider from "../../../../atoms/Divider";
import songs from "./songs";

const CommunityView = () => {
  return (
    <View style={styles.container as any}>
      {/* TODO: Get better icon */}
      <FontAwesomeIcon
        style={styles.icon}
        icon={faMessage}
        size={45}
        color={COLOURS.bchGreen}
      />
      <View style={styles.background as any}>
        <FlatList
          style={{ width: "100%" }}
          // ItemSeparatorComponent={<Divider />}
          data={songs}
          renderItem={({ item, index, separators }) => (
            <TouchableHighlight
              key={item.id}
              onPress={() => {}}
              // onShowUnderlay={separators.highlight}
              // onHideUnderlay={separators.unhighlight}
            >
              <View style={{ backgroundColor: "white" }}>
                <Text>{item.title}</Text>
                <Text>{item.artist}</Text>
                <Divider />
              </View>
            </TouchableHighlight>
          )}
        />
      </View>
    </View>
  );
};

export default CommunityView;
