import MainViewBalance from "./MainViewBalance";
import MainViewReceive from "./MainViewReceive";
import MainViewSend from "./MainViewSend";

function MainView() {
  return (
    <div>
      <MainViewBalance />
      <MainViewReceive />
    </div>
  );
}

export default MainView;

