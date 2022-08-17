import { DeviceEventEmitter } from "react-native";
import { EmitEvent } from "../types";

const emitMessage = (event: EmitEvent) => {
  console.log("inside EmitMessage");
  DeviceEventEmitter.emit("event.emitEvent", event);
};

export default emitMessage;
