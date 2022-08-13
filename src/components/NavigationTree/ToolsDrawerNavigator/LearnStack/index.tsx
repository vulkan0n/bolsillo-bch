import { createDrawerNavigator } from "@react-navigation/drawer";
import BackupView from "../BackupStack/BackupView";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LearnView from "./LearnView";
import { Text } from "react-native";
import COLOURS from "../../../../design/colours";
import TYPOGRAPHY from "../../../../design/typography";

const Stack = createNativeStackNavigator();

const BackupStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Learn"
      component={LearnView}
      options={{
        headerStyle: {
          backgroundColor: COLOURS.white,
        },
        headerTitle: (props) => <Text style={TYPOGRAPHY.header}>Learn</Text>,
      }}
    />
    <Stack.Screen
      name="Reset"
      component={BackupView}
      options={{
        headerStyle: {
          // backgroundColor: "red",
        },
      }}
    />
  </Stack.Navigator>
);

export default BackupStack;
