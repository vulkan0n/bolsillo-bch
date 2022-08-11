import React from "react";
import { View, Pressable, Text } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import Divider from "../../../atoms/Divider";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faHashtag } from "@fortawesome/free-solid-svg-icons/faHashtag";
import { faMessage } from "@fortawesome/free-solid-svg-icons/faMessage";
import COLOURS from "../../../../design/colours";
import Button from "../../../atoms/Button";

const CommunityView = () => {
  return (
    <View style={styles.container as any}>
      <View style={styles.background as any}>
        <Text style={TYPOGRAPHY.h2black as any}>Reddit</Text>
        {/* TODO: Get better icon */}
        <FontAwesomeIcon
          style={styles.icon}
          icon={faMessage}
          size={45}
          color={COLOURS.bchGreen}
        />

        <Text style={TYPOGRAPHY.p as any}>/r/btc</Text>
        <Text style={TYPOGRAPHY.p as any}>
          Home of big-block Bitcoin discussion since before the BTC/BCH split.
        </Text>
        <Text style={TYPOGRAPHY.p as any}>/r/Bitcoincash</Text>
        <Text style={TYPOGRAPHY.p as any}>Just BCH, no Bitcoin debates.</Text>

        <Divider />
        {/* TODO: Get better icon */}
        <Text style={TYPOGRAPHY.h2black as any}>Twitter</Text>
        <FontAwesomeIcon
          style={styles.icon}
          icon={faHashtag}
          size={45}
          color={COLOURS.bchGreen}
        />
        <Text style={TYPOGRAPHY.p as any}>#BitcoinCash</Text>
        <Text>Top follows:</Text>
        <Text>@TheBCHPodcast</Text>
        <Text>@BeCashy</Text>
        <Text>@ww_tism</Text>
        <Text>@DavidShares</Text>
        <Text>@RogerVer</Text>
        <Text>@SalTheAgorist</Text>
        <Text>@SheriUcar</Text>
        <Text>@SalTheAgorist</Text>
        <Text>... Explore more</Text>
        <Divider />

        <Text style={TYPOGRAPHY.h2black as any}>Telegram</Text>
        {/* TODO: Get better icon */}
        <FontAwesomeIcon
          style={styles.icon}
          icon={faMessage}
          size={45}
          color={COLOURS.bchGreen}
        />

        <Text style={TYPOGRAPHY.p as any}>/r/btc</Text>
        <Text style={TYPOGRAPHY.p as any}>
          Home of big-block Bitcoin discussion since before the BTC/BCH split.
        </Text>
        <Text style={TYPOGRAPHY.p as any}>/r/Bitcoincash</Text>
        <Text style={TYPOGRAPHY.p as any}>Just BCH, no Bitcoin debates.</Text>

        <Divider />
      </View>
      <View style={styles.menuRow as any}>
        <Pressable onPress={() => {}}>
          <View style={styles.pressableCard as any}>
            <View style={styles.iconWrapper as any}>
              <FontAwesomeIcon
                icon={faHashtag}
                size={25}
                color={COLOURS.bchGreen}
              />
            </View>
            <Text style={TYPOGRAPHY.subMenuHeaderWhite as any}>Twitter</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => {}}>
          <View style={styles.pressableCard as any}>
            <View style={styles.iconWrapper as any}>
              <FontAwesomeIcon
                icon={faHashtag}
                size={25}
                color={COLOURS.bchGreen}
              />
            </View>
            <Text style={TYPOGRAPHY.subMenuHeaderWhite as any}>Twitter</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => {}}>
          <View style={styles.pressableCard as any}>
            <View style={styles.iconWrapper as any}>
              <FontAwesomeIcon
                icon={faHashtag}
                size={25}
                color={COLOURS.bchGreen}
              />
            </View>
            <Text style={TYPOGRAPHY.subMenuHeaderWhite as any}>Twitter</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => {}}>
          <View style={styles.pressableCard as any}>
            <View style={styles.iconWrapper as any}>
              <FontAwesomeIcon
                icon={faHashtag}
                size={25}
                color={COLOURS.bchGreen}
              />
            </View>
            <Text style={TYPOGRAPHY.subMenuHeaderWhite as any}>Twitter</Text>
          </View>
        </Pressable>
      </View>
      <View style={styles.menuRow as any}>
        <Pressable onPress={() => {}}>
          <View style={styles.pressableCard as any}>
            <View style={styles.iconWrapper as any}>
              <FontAwesomeIcon
                icon={faHashtag}
                size={25}
                color={COLOURS.bchGreen}
              />
            </View>
            <Text style={TYPOGRAPHY.subMenuHeaderWhite as any}>Twitter</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => {}}>
          <View style={styles.pressableCard as any}>
            <View style={styles.iconWrapper as any}>
              <FontAwesomeIcon
                icon={faHashtag}
                size={25}
                color={COLOURS.bchGreen}
              />
            </View>
            <Text style={TYPOGRAPHY.subMenuHeaderWhite as any}>Twitter</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => {}}>
          <View style={styles.pressableCard as any}>
            <View style={styles.iconWrapper as any}>
              <FontAwesomeIcon
                icon={faHashtag}
                size={25}
                color={COLOURS.bchGreen}
              />
            </View>
            <Text style={TYPOGRAPHY.subMenuHeaderWhite as any}>Twitter</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => {}}>
          <View style={styles.pressableCard as any}>
            <View style={styles.iconWrapper as any}>
              <FontAwesomeIcon
                icon={faHashtag}
                size={25}
                color={COLOURS.bchGreen}
              />
            </View>
            <Text style={TYPOGRAPHY.subMenuHeaderWhite as any}>Twitter</Text>
          </View>
        </Pressable>
      </View>

      {/* Home */}
      {/* Reddit */}
      {/* Twitter */}
      {/* Telegram */}
      {/* Youtube */}
      {/* Podcasts */}
      {/* Music */}
      {/* Art */}
      {/* Memes */}
      {/* Meetups */}
    </View>
  );
};

export default CommunityView;
