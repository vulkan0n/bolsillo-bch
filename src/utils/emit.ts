import { DeviceEventEmitter } from "react-native";
import { EmitEvent } from "../types";

const emit = (event: EmitEvent) =>
  DeviceEventEmitter.emit("event.emitEvent", event);

export default emit;
