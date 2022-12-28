import React from "react";
import { Pressable, Text, Linking } from "react-native";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";

interface Props {
  url: string;
  isWhite?: boolean;
}

function WebLink({ url, isWhite = false }: Props) {
  const onPressUrl = () => {
    Linking.openURL(url);
  };

  return (
    <Pressable onPress={onPressUrl}>
      <Text
        style={
          isWhite
            ? (TYPOGRAPHY.pWhiteUnderlined as any)
            : (TYPOGRAPHY.pUnderlined as any)
        }
      >
        {url}
      </Text>
    </Pressable>
  );
}

export default WebLink;
