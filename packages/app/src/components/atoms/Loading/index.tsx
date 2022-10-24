import { BallIndicator } from "react-native-indicators";
import COLOURS from "@selene-wallet/common/design/colours";

interface Props {
  style?: any;
  size?: number;
  color?: string;
}

const Loading = ({ style = {}, size = 30, color = COLOURS.black }: Props) => (
  <BallIndicator style={style} size={size} color={color} />
);

export default Loading;
