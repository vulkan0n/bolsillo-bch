import { createDrawerNavigator } from "@react-navigation/drawer";
import DrawerNavigator from "@atoms/DrawerNavigator";
import RoadmapView from "./RoadmapView";

const Drawer = createDrawerNavigator();

function OnlineDrawerNavigator() {
  return (
    <DrawerNavigator>
      <Drawer.Screen name="Roadmap" component={RoadmapView} />
      {/* <Drawer.Screen name="Online" component={OnlineView} /> */}
      {/* <Drawer.Screen name="Twitter" component={OnlineView} /> */}
    </DrawerNavigator>
  );
}

export default OnlineDrawerNavigator;
