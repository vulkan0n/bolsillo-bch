import { DeviceEventEmitter } from "react-native";
import { EmitEvent } from "@selene-wallet/common/dist/types";

const emit = (event: EmitEvent) => {
  DeviceEventEmitter.emit("event.emitEvent", event);
};

export default emit;
