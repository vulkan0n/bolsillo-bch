import { DeviceEventEmitter } from "react-native";
import { EmitEvent } from "@selene/app/src/types";

const emit = (event: EmitEvent) => {
  DeviceEventEmitter.emit("event.emitEvent", event);
};

export default emit;
