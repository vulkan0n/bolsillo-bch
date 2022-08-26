import React, { useState, useEffect } from "react";
import { Pressable, Text, Image, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import styles from "./styles";
import TYPOGRAPHY from "@design/typography";

const ImageEntry = () => {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  return (
    <View style={styles.entryRow as any}>
      <View style={styles.container as any}>
        <Pressable onPress={pickImage}>
          <Text style={TYPOGRAPHY.h2black as any}>
            Tap to pick a QR code image from Gallery.
          </Text>
        </Pressable>
        {image && (
          <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
        )}
      </View>
    </View>
  );
};

export default ImageEntry;
